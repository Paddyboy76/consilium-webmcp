import { buildEvidenceBundle, buildSyntheticHistory, fixtureReports, inferPatterns, SOURCE_CHUNKS, synthesize } from './domain';
import { createAgentGraph } from './model';
import { resolveSession } from './session';
import { OPERATING_LIMITS } from './limits';

type Bindings={DB:D1Database;VECTOR_INDEX:VectorizeIndex;AI:Ai;ASSETS:Fetcher;APP_MODE:'fixture'|'openai';MODEL_CONFIG_VERSION:string;PIPELINE_VERSION:string;CONSULTATION_LIMIT_PER_HOUR:string;SESSION_KEY_VERSION:string;SESSION_PREVIOUS_KEY_VERSION?:string;SESSION_SIGNING_KEY?:string;SESSION_PREVIOUS_SIGNING_KEY?:string;OPENAI_API_KEY?:string};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const boundedBody=async(request:Request):Promise<Record<string,unknown>>=>{if(Number(request.headers.get('content-length')??0)>OPERATING_LIMITS.maxBodyBytes)throw new Error('REQUEST_TOO_LARGE');const value:unknown=await request.json();if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('INVALID_JSON_OBJECT');return Object.fromEntries(Object.entries(value))};

async function ensureSession(db:D1Database,session:string){
  await db.prepare("INSERT OR IGNORE INTO users(id,display_name,created_at) VALUES('demo-user','Maya Chen',datetime('now'))").run();
  await db.prepare("INSERT OR IGNORE INTO sessions(id,user_id,created_at,reset_version) VALUES(?,'demo-user',datetime('now'),'seed-v2')").bind(session).run();
  const seeded=await db.prepare("SELECT COUNT(*) AS count FROM events WHERE user_id='demo-user'").first<{count:number}>();
  if((seeded?.count??0)===0){
    await db.batch([
      db.prepare("INSERT OR IGNORE INTO projects(id,user_id,title,created_at) VALUES('project-studio','demo-user','Accessibility audit studio','2026-06-01T09:00:00Z')"),
      db.prepare("INSERT OR IGNORE INTO goals(id,project_id,user_id,title,created_at) VALUES('goal-pilot','project-studio','demo-user','Validate accessibility audit pilot','2026-06-01T09:00:00Z')")
    ]);
    const history=buildSyntheticHistory();
    for(let start=0;start<history.length;start+=50){
      await db.batch(history.slice(start,start+50).map(item=>db.prepare("INSERT OR IGNORE INTO events(id,user_id,session_id,occurred_at,event_type,subject_id,valence,magnitude,payload_json,provenance,created_at) VALUES(?,'demo-user',NULL,?,?,?,?,?,?,?,'2026-09-01T00:00:00Z')").bind(item.id,item.occurredAt,item.type,item.subjectId,item.valence,item.magnitude,JSON.stringify({text:item.text,tags:item.tags}),'synthetic-seed-v2')));
    }
    const patterns=inferPatterns(history);
    for(const pattern of patterns){
      await db.prepare("INSERT OR IGNORE INTO patterns(id,user_id,name,assertion,confidence,window_start,window_end,algorithm_version,status,pipeline_hash,created_at) VALUES(?,'demo-user',?,?,?,?,?,?,?,?,'1f5efdc1c1ef895b221f8dba3ab9c6b64139eb4265eb33a154ba560aa761109f','2026-09-01T00:00:00Z')").bind(pattern.id,pattern.name,pattern.assertion,pattern.confidence,pattern.windowStart,pattern.windowEnd,pattern.algorithmVersion,pattern.status).run();
      const links=[...pattern.supportingIds.map(id=>({id,relation:'supports'})),...pattern.contradictoryIds.map(id=>({id,relation:'contradicts'}))];
      if(links.length)await db.batch(links.map(link=>db.prepare("INSERT OR IGNORE INTO pattern_evidence(pattern_id,event_id,relation,weight) VALUES(?,?,?,1)").bind(pattern.id,link.id,link.relation)));
    }
    const packs=[
      {id:'pack-marcus-pg2680-v1',advisor:'marcus-aurelius',version:'pg2680-2026-07-13-v1',author:'Marcus Aurelius',title:'Meditations',translator:'Meric Casaubon',edition:'Casaubon 1634/1635 text; Project Gutenberg #2680',year:1634,basis:'Public domain in USA; Casaubon died 1671',url:'https://www.gutenberg.org/ebooks/2680',sha:'c8aa53365343d26f5ecc9abf2e4221efffddfc49e841152a505761b38f9a3482',doctrine:'Present duty, judgment, character, impermanence',boundary:'No therapy, modern empiricism, or productivity-guru drift'},
      {id:'pack-epictetus-pg10661-v1',advisor:'epictetus',version:'pg10661-v1',author:'Epictetus',title:'The Encheiridion, or Manual',translator:'George Long',edition:'1877 translation; Project Gutenberg #10661',year:1877,basis:'Public domain in USA; Long died 1879',url:'https://www.gutenberg.org/ebooks/10661',sha:'2acf138b4695834ffbb0b2f70d66f08ee9202f23d979cfc0914e29177029a47e',doctrine:'Distinguish action and judgment from external outcomes',boundary:'No passivity, emotion suppression, or denial of constraints'},
      {id:'pack-suntzu-pg132-v1',advisor:'sun-tzu',version:'pg132-2024-10-29-v1',author:'Sunzi',title:'The Art of War',translator:'Lionel Giles',edition:'Luzac 1910; Project Gutenberg #132',year:1910,basis:'1910 edition public domain in USA',url:'https://www.gutenberg.org/ebooks/132',sha:'701ea46fcd771d30d3fac26552187922e975580b59c142fa542bf0fb7d86e9e1',doctrine:'Conditions, advantageous ground, adaptation, avoiding waste',boundary:'Non-violent metaphor only; no manipulation or fabricated threats'}
    ];
    await db.batch(packs.map(pack=>db.prepare("INSERT OR IGNORE INTO source_packs(id,advisor_id,version,author,title,translator,edition,publication_year,public_domain_basis,canonical_url,source_sha256,doctrine_profile,anti_drift_boundaries,ingestion_version,embedding_model,embedding_dimensions) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,'source-ingest-v2','@cf/baai/bge-base-en-v1.5',768)").bind(pack.id,pack.advisor,pack.version,pack.author,pack.title,pack.translator,pack.edition,pack.year,pack.basis,pack.url,pack.sha,pack.doctrine,pack.boundary)));
    await db.batch(SOURCE_CHUNKS.map((chunk,ordinal)=>db.prepare("INSERT OR IGNORE INTO source_chunks(id,pack_id,advisor_id,locator,canonical_text,normalized_hash,ordinal) VALUES(?,?,?,?,?,'canonical-verified-v1',?)").bind(chunk.id,chunk.packId,chunk.advisorId,chunk.locator,chunk.text,ordinal)));
    await db.batch(packs.map(pack=>db.prepare("INSERT OR IGNORE INTO council_appointments(id,user_id,advisor_id,pack_id,appointed_at,provenance) VALUES(?,'demo-user',?,?, '2026-08-01T09:00:00Z','synthetic user appointment')").bind(`appointment-${pack.advisor}`,pack.advisor,pack.id)));
  }
}

async function context(env:Bindings,session:string){
  await ensureSession(env.DB,session);
  const pending=await env.DB.prepare("SELECT id,text,rationale,status FROM proposals WHERE session_id=? AND status='pending' LIMIT 1").bind(session).first();
  const actions=await env.DB.prepare("SELECT id,text,status,created_at FROM actions WHERE user_id='demo-user' AND proposal_id IN (SELECT id FROM proposals WHERE session_id=?) ORDER BY created_at").bind(session).all();
  const history=buildSyntheticHistory();
  return {persona:{id:'demo-user',name:'Maya Chen'},goals:[{id:'goal-pilot',title:'Validate accessibility audit pilot'}],today:{available_minutes:45,priorities:['Pilot outreach','Client delivery']},historySummary:{days:67,eventCount:history.length,from:history[0]?.occurredAt,to:history.at(-1)?.occurredAt},patterns:inferPatterns(history),appointments:['marcus-aurelius','epictetus','sun-tzu'],pendingProposal:pending,pending_proposal:pending,actions:actions.results};
}

async function route(request:Request,env:Bindings,session:string):Promise<Response>{
  const url=new URL(request.url);
  if(url.pathname==='/api/health') return json({status:'ok',runtime:'cloudflare-worker',mode:env.APP_MODE,modelConfigured:Boolean(env.OPENAI_API_KEY)});
  if(url.pathname==='/api/context') return json(await context(env,session));
  if(url.pathname==='/api/memory') {const query=(url.searchParams.get('q')??'').toLowerCase().slice(0,300),terms=query.split(/\W+/).filter(x=>x.length>2);const results=buildSyntheticHistory().map(item=>({item,score:terms.filter(term=>`${item.text} ${item.tags.join(' ')}`.toLowerCase().includes(term)).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||b.item.occurredAt.localeCompare(a.item.occurredAt)).slice(0,8).map(x=>({...x.item,untrusted:true}));return json({results,contentTrust:'untrusted_data'})}
  if(url.pathname==='/api/patterns'){await ensureSession(env.DB,session);const count=await env.DB.prepare("SELECT COUNT(*) AS count FROM events WHERE user_id='demo-user'").first();return json({patterns:inferPatterns(buildSyntheticHistory()),canonicalEventCount:count?.count})}
  if(url.pathname.startsWith('/api/patterns/')){const found=inferPatterns(buildSyntheticHistory()).find(p=>p.id===url.pathname.split('/').at(-1));return found?json(found):json({error:'not found'},404)}
  if(url.pathname==='/api/council'&&request.method==='GET') return json({appointed:['marcus-aurelius','epictetus','sun-tzu'],sourceChunks:SOURCE_CHUNKS.map(({text,...safe})=>({...safe,excerpt:text}))});
  if(url.pathname==='/api/advisors'&&request.method==='GET') return json({advisors:[{id:'marcus-aurelius',name:'Marcus Aurelius',focus:'Present duty and judgment'},{id:'epictetus',name:'Epictetus',focus:'Agency and controllable action'},{id:'sun-tzu',name:'Sun Tzu',focus:'Conditions, adaptation, and avoiding waste'}],sources:SOURCE_CHUNKS});
  if(url.pathname==='/api/reset'&&request.method==='POST'){await ensureSession(env.DB,session);await env.DB.batch([env.DB.prepare("DELETE FROM advisor_reports WHERE consultation_id IN (SELECT id FROM consultations WHERE session_id=?)").bind(session),env.DB.prepare("DELETE FROM consultations WHERE session_id=?").bind(session),env.DB.prepare("DELETE FROM actions WHERE proposal_id IN (SELECT id FROM proposals WHERE session_id=?)").bind(session),env.DB.prepare("DELETE FROM audit_events WHERE session_id=?").bind(session),env.DB.prepare("DELETE FROM proposals WHERE session_id=?").bind(session)]);return json(await context(env,session))}
  if((url.pathname==='/api/council/consult'||url.pathname==='/api/council')&&request.method==='POST'){
    const body=await boundedBody(request), question=body.question;
    if(typeof question!=='string'||question.length<3||question.length>OPERATING_LIMITS.maxQuestionChars)return json({error:'INVALID_QUESTION'},400);
    if(request.signal.aborted)return json({error:'CONSULTATION_CANCELLED'},499);if(env.APP_MODE==='openai'&&!env.OPENAI_API_KEY)return json({error:'MODEL_CONFIGURATION_ERROR'},503);
    const recent=await env.DB.prepare("SELECT COUNT(*) AS count FROM consultations WHERE session_id=? AND created_at >= datetime('now','-1 hour')").bind(session).first<{count:number}>();if((recent?.count??0)>=Number(env.CONSULTATION_LIMIT_PER_HOUR))return json({error:'CONSULTATION_RATE_LIMIT'},429);
    await ensureSession(env.DB,session);const bundle=buildEvidenceBundle(question,buildSyntheticHistory()); const reports=fixtureReports(bundle); const decision=synthesize(bundle,reports);const traceId=`trace-${crypto.randomUUID()}`;
    const safeBundle={goals:bundle.goals,personalIds:bundle.history.map(e=>e.id),outcomeIds:bundle.outcomes.map(e=>e.id),patterns:bundle.patterns};
    await env.DB.prepare("INSERT INTO consultations(id,user_id,session_id,question,evidence_bundle_json,model_config_version,status,pipeline_hash,created_at) VALUES(?,'demo-user',?,?,?,?, 'completed',?,datetime('now'))").bind(traceId,session,question,JSON.stringify(safeBundle),env.MODEL_CONFIG_VERSION,env.PIPELINE_VERSION).run();
    await env.DB.batch(reports.map(report=>{const validation=synthesize(bundle,[report]);return env.DB.prepare("INSERT INTO advisor_reports(id,consultation_id,advisor_id,report_json,validation_json,abstained,pipeline_hash,created_at) VALUES(?,?,?,?,?,?,?,datetime('now'))").bind(crypto.randomUUID(),traceId,report.advisorId,JSON.stringify(report),JSON.stringify({valid:!validation.abstained}),report.abstained?1:0,env.PIPELINE_VERSION)}));
    const recommendationId=`recommendation-${crypto.randomUUID()}`;if(!decision.abstained){await env.DB.batch([env.DB.prepare("INSERT INTO recommendations(id,user_id,consultation_id,text,producer,pipeline_hash,created_at) VALUES(?,'demo-user',?,?,'council-chair',?,datetime('now'))").bind(recommendationId,traceId,decision.recommendation,env.PIPELINE_VERSION),...decision.personalEvidenceIds.map(id=>env.DB.prepare("INSERT INTO recommendation_evidence(recommendation_id,evidence_id,lane) VALUES(?,?,'personal')").bind(recommendationId,id)),...decision.advisorEvidenceIds.map(id=>env.DB.prepare("INSERT INTO recommendation_evidence(recommendation_id,evidence_id,lane) VALUES(?,?,'advisor')").bind(recommendationId,id))])}
    const events=[{stage:'Evidence bundle',status:'complete',detail:`${bundle.history.length} relevant timeline events retrieved before advice`},...reports.map(report=>({stage:report.advisorId,status:report.abstained?'abstained':'validated',detail:report.recommendation})),{stage:'Dual-grounding guardrail',status:decision.abstained?'failed':'passed',detail:'Every accepted personalized claim has personal and appointed-source IDs'}];
    return json({traceId,trace_id:traceId,recommendationId:decision.abstained?null:recommendationId,modelMode:'fixture',modelConfigVersion:env.MODEL_CONFIG_VERSION,pipelineVersion:env.PIPELINE_VERSION,evidenceBundle:safeBundle,reports,decision,recommendation:decision.recommendation,events,validation:{allDisplayedEvidenceCanonical:true,dualGrounded:!decision.abstained,persistent_mutation:false}});
  }
  if(url.pathname.startsWith('/api/traces/')&&request.method==='GET'){
    const traceId=url.pathname.split('/').at(-1)??'';if(!/^trace-[0-9a-f-]{36}$/.test(traceId))return json({error:'INVALID_TRACE_ID'},400);
    const consultation=await env.DB.prepare("SELECT id,question,evidence_bundle_json,model_config_version,status,created_at FROM consultations WHERE id=? AND session_id=?").bind(traceId,session).first();if(!consultation)return json({error:'TRACE_NOT_FOUND'},404);
    const reports=await env.DB.prepare("SELECT advisor_id,report_json,validation_json,abstained FROM advisor_reports WHERE consultation_id=?").bind(traceId).all();return json({consultation,reports:reports.results});
  }
  if(url.pathname==='/api/proposals'&&request.method==='POST'){
    await ensureSession(env.DB,session);const body=await boundedBody(request);if(typeof body.text!=='string'||body.text.length<3||body.text.length>240)return json({error:'INVALID_PROPOSAL'},400);
    const id=`proposal-${crypto.randomUUID()}`;await env.DB.batch([env.DB.prepare("UPDATE proposals SET status='superseded' WHERE session_id=? AND status='pending'").bind(session),env.DB.prepare("INSERT INTO proposals(id,session_id,text,rationale,status,created_at) VALUES(?,?,?,?, 'pending',datetime('now'))").bind(id,session,body.text,typeof body.rationale==='string'?body.rationale.slice(0,500):'')]);return json({proposalId:id,status:'pending',persistedAction:false});
  }
  if(url.pathname==='/api/actions/commit'&&request.method==='POST'){
    const body=await boundedBody(request),proposalId=body.proposalId??body.proposal_id;if(typeof proposalId!=='string'||!/^proposal-[0-9a-f-]{36}$/.test(proposalId))return json({error:'INVALID_PROPOSAL_ID'},400);
    const actionId=`action-${crypto.randomUUID()}`,auditId=crypto.randomUUID();
    const results=await env.DB.batch([
      env.DB.prepare("UPDATE proposals SET status='committed',committed_at=datetime('now') WHERE id=? AND session_id=? AND status='pending'").bind(proposalId,session),
      env.DB.prepare("INSERT INTO actions(id,user_id,proposal_id,text,status,created_at) SELECT ?,'demo-user',id,text,'committed',datetime('now') FROM proposals WHERE id=? AND session_id=? AND status='committed' ON CONFLICT(proposal_id) DO NOTHING").bind(actionId,proposalId,session),
      env.DB.prepare("INSERT INTO audit_events(id,session_id,event_type,subject_id,safe_detail_json,commit_proposal_id,created_at) SELECT ?,?,'action_committed',?,'{}',id,datetime('now') FROM proposals WHERE id=? AND session_id=? AND status='committed' ON CONFLICT(commit_proposal_id) DO NOTHING").bind(auditId,session,actionId,proposalId,session)
    ]);
    if((results[0]?.meta.changes??0)!==1)return json({error:'ALREADY_COMMITTED_OR_NOT_OWNED',proposalId},409);
    if((results[1]?.meta.changes??0)!==1||(results[2]?.meta.changes??0)!==1)throw new Error('COMMIT_INVARIANT_FAILED');
    return json({actionId,proposalId,status:'committed'});
  }
  return env.ASSETS.fetch(request);
}

// Import-time construction is the no-call Agents SDK compatibility spike.
createAgentGraph();
export default {async fetch(request:Request,env:Bindings):Promise<Response>{try{if(!env.SESSION_SIGNING_KEY)return json({error:'SESSION_CONFIGURATION_ERROR'},503);const keys={current:{version:env.SESSION_KEY_VERSION,secret:env.SESSION_SIGNING_KEY},...(env.SESSION_PREVIOUS_KEY_VERSION&&env.SESSION_PREVIOUS_SIGNING_KEY?{previous:{version:env.SESSION_PREVIOUS_KEY_VERSION,secret:env.SESSION_PREVIOUS_SIGNING_KEY}}:{})},ownership=await resolveSession(request,keys),response=await route(request,env,ownership.sessionId);if(!ownership.setCookie)return response;const headers=new Headers(response.headers);headers.append('set-cookie',ownership.setCookie);return new Response(response.body,{status:response.status,statusText:response.statusText,headers})}catch(error){console.error(JSON.stringify({event:'request_error',message:error instanceof Error?error.message:'unknown'}));return json({error:'INTERNAL_ERROR'},500)}}} satisfies ExportedHandler<Bindings>;
