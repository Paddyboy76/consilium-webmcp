import assert from 'node:assert/strict';

const base = process.env.CONSILIUM_ACCEPTANCE_URL;
assert.match(base ?? '', /^http:\/\/localhost:\d+$/, 'loopback acceptance URL required');

const request = async (path, {cookie, method='GET', body, headers={}}={}) => {
  const response = await fetch(`${base}${path}`, {method, headers:{...(cookie?{cookie}:{}), ...(body?{'content-type':'application/json'}:{}), ...headers}, body:body?JSON.stringify(body):undefined});
  const text = await response.text(); let data;
  try { data=JSON.parse(text); } catch { data=text; }
  return {response,data,setCookie:response.headers.get('set-cookie')};
};
const cookieFrom = value => { assert.ok(value); return value.split(';',1)[0]; };
const pass = message => console.log(`PASS  ${message}`);
const safePreview = value => {
  const raw=typeof value==='string'?value:JSON.stringify(value);
  return raw.replace(/consilium_session=[^\s;"']+/gi,'consilium_session=[REDACTED]').replace(/acceptance-only-[0-9a-f]+/gi,'[REDACTED]').slice(0,500);
};
const expectStatus = (result,expected,label) => {
  if(result.response.status!==expected)throw new Error(`${label}: expected HTTP ${expected}, received ${result.response.status}; response=${safePreview(result.data)}`);
};

const healthA=await request('/api/health');
expectStatus(healthA,200,'GET /api/health session A'); assert.equal(healthA.data.mode,'fixture'); assert.equal(healthA.data.modelConfigured,false);
assert.match(healthA.setCookie,/HttpOnly/i); assert.match(healthA.setCookie,/Secure/i); assert.match(healthA.setCookie,/SameSite=Strict/i);
const cookieA=cookieFrom(healthA.setCookie); pass('fixture health and server-issued signed cookie attributes');

const healthB=await request('/api/health'); const cookieB=cookieFrom(healthB.setCookie); assert.notEqual(cookieA,cookieB);
const sessionA=cookieA.split('.')[3];
const contextA=await request('/api/context',{cookie:cookieA});
expectStatus(contextA,200,'GET /api/context first authenticated request'); assert.ok(contextA.data.historySummary.days>=60); assert.ok(contextA.data.historySummary.eventCount>=25); assert.ok(contextA.data.patterns.length>=2);
pass('longitudinal context and inferred patterns');

const patterns=await request('/api/patterns',{cookie:cookieA});
assert.ok(patterns.data.canonicalEventCount>=25); const adaptive=patterns.data.patterns.find(pattern=>pattern.supportingIds.length&&pattern.contradictoryIds.length); assert.ok(adaptive);
const pattern=await request(`/api/patterns/${adaptive.id}`,{cookie:cookieA}); assert.ok(pattern.data.supportingIds.length); assert.ok(pattern.data.contradictoryIds.length);
pass('canonical pattern support and counterevidence');

const council=await request('/api/council',{cookie:cookieA});
assert.deepEqual(council.data.appointed,['marcus-aurelius','epictetus','sun-tzu']); assert.ok(council.data.sourceChunks.length>=3);
for(const source of council.data.sourceChunks){assert.ok(source.packId); assert.ok(source.locator); assert.ok(source.excerpt);}
pass('appointed council and source provenance');

const consult=await request('/api/council',{cookie:cookieA,method:'POST',body:{question:'I have 45 minutes before work. What should I focus on today, and why did my history change that advice?'}});
expectStatus(consult,200,'POST /api/council'); assert.equal(consult.data.modelMode,'deterministic-test-fixture'); assert.equal(consult.data.validation.dualGrounded,true); assert.ok(consult.data.pipelineVersion); assert.ok(consult.data.decision.personalEvidenceIds.length); assert.ok(consult.data.decision.advisorEvidenceIds.length);
for(const report of consult.data.reports.filter(item=>!item.abstained)){assert.ok(report.claims.length); for(const claim of report.claims){assert.ok(claim.personalEvidenceIds.length); assert.ok(claim.advisorEvidenceIds.length);}}
const traceId=consult.data.traceId; pass('consultation with dual-grounded advice and pipeline identity');

assert.equal((await request(`/api/traces/${traceId}`,{cookie:cookieA})).response.status,200);
assert.equal((await request(`/api/traces/${traceId}`,{cookie:cookieB})).response.status,404);
assert.equal((await request(`/api/traces/${traceId}`,{cookie:cookieB,headers:{'x-consilium-session':sessionA}})).response.status,404);
const forged=`${cookieA.slice(0,-1)}${cookieA.endsWith('a')?'b':'a'}`;
assert.equal((await request(`/api/traces/${traceId}`,{cookie:forged})).response.status,404);
pass('safe trace ownership rejects cross-session, header, and cookie forgery');

const proposed=await request('/api/proposals',{cookie:cookieA,method:'POST',body:{text:'Send one accessibility pilot invitation',rationale:'Protected single-action mornings improved follow-through.'}});
assert.equal(proposed.response.status,200); assert.equal(proposed.data.persistedAction,false); const proposalId=proposed.data.proposalId;
assert.equal((await request('/api/context',{cookie:cookieA})).data.actions.length,0);
assert.equal((await request('/api/actions/commit',{cookie:cookieB,method:'POST',body:{proposal_id:proposalId}})).response.status,409);
const committed=await request('/api/actions/commit',{cookie:cookieA,method:'POST',body:{proposal_id:proposalId}}); expectStatus(committed,200,'owner commit');
assert.equal((await request('/api/actions/commit',{cookie:cookieA,method:'POST',body:{proposal_id:proposalId}})).response.status,409);
assert.equal((await request('/api/context',{cookie:cookieA})).data.actions.length,1);
pass('proposal separation, owner-only atomic commit, and repeated rejection');

await request('/api/proposals',{cookie:cookieB,method:'POST',body:{text:'Session B private proposal',rationale:'Ownership proof'}});
await request('/api/reset',{cookie:cookieB,method:'POST',body:{}});
assert.equal((await request('/api/context',{cookie:cookieB})).data.pendingProposal,null);
assert.equal((await request('/api/context',{cookie:cookieA})).data.actions.length,1);
pass('reset is session-owned');

const html=await request('/'); assert.equal(html.response.status,200); assert.match(html.data,/id="runtime-label"/); assert.match(html.data,/13 TOOL CONTRACTS/);
const app=await request('/app.js'); assert.equal(app.response.status,200); assert.match(app.data,/document\.modelContext\.registerTool/); assert.match(app.data,/BROWSER AGENT DISCOVERY UNAVAILABLE/);
pass('visible UI and WebMCP asset delivery');
console.log('RESULT Hetzner HTTP acceptance passed: no OpenAI or remote Cloudflare calls.');
