import { buildEvidenceBundle, buildSyntheticHistory, fixtureReports, inferPatterns, SOURCE_CHUNKS, synthesize } from './domain';
import { COUNCIL_MODEL, COUNCIL_MODEL_CONFIG, runWorkersAiCouncil } from './model';
import { resolveSession } from './session';
import { OPERATING_LIMITS } from './limits';
import { retrieveAdvisor, retrievePersonal, vectorMetadata, WorkersAiEmbedder } from './retrieval';
import type { EvidenceBundle, SourceChunk, TimelineEvent } from './types';
import { handleProduct } from './product';

type Bindings={DB:D1Database;VECTOR_INDEX:VectorizeIndex;AI:Ai;ASSETS:Fetcher;APP_MODE:'fixture'|'cloudflare';MODEL_CONFIG_VERSION:string;PIPELINE_VERSION:string;CONSULTATION_LIMIT_PER_HOUR:string;SESSION_KEY_VERSION:string;INGESTION_ENABLED?:string;ACCEPTANCE_DIAGNOSTICS?:string;ACCEPTANCE_INSTANCE_ID?:string;SESSION_PREVIOUS_KEY_VERSION?:string;SESSION_SIGNING_KEY?:string;SESSION_PREVIOUS_SIGNING_KEY?:string;INGESTION_KEY?:string};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const auditTool=(db:D1Database,session:string,tool:string,input:unknown,result:unknown)=>db.prepare("INSERT INTO webmcp_calls VALUES(?,?,?,?,?,datetime('now'))").bind(`toolcall-${crypto.randomUUID()}`,session,tool,JSON.stringify(input),JSON.stringify(result)).run();
const parseStoredJson=(value:unknown):unknown=>JSON.parse(String(value)) as unknown;
const boundedBody=async(request:Request):Promise<Record<string,unknown>>=>{if(Number(request.headers.get('content-length')??0)>OPERATING_LIMITS.maxBodyBytes)throw new Error('REQUEST_TOO_LARGE');const value:unknown=await request.json();if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('INVALID_JSON_OBJECT');return Object.fromEntries(Object.entries(value))};
const seedFailureCategory=(error:unknown)=>{const message=error instanceof Error?error.message.toLowerCase():'';if(message.includes('no such table'))return 'schema-missing';if(message.includes('foreign key'))return 'foreign-key';if(message.includes('not null'))return 'not-null';if(message.includes('constraint'))return 'constraint';if(message.includes('too many')||message.includes('limit')||message.includes('exceeded'))return 'resource-limit';if(message.includes('undefined')||message.includes('prepare'))return 'binding-unavailable';return 'd1-operation'};
class SeedStageError extends Error {constructor(readonly stage:string,readonly category:string){super('SEED_STAGE_FAILURE')}}
const seedStage=async<T>(stage:string,operation:()=>Promise<T>)=>{try{return await operation()}catch(error){throw new SeedStageError(stage,seedFailureCategory(error))}};

async function ensureSession(db:D1Database,session:string){
  await seedStage('identity-user',()=>db.prepare("INSERT OR IGNORE INTO users(id,display_name,created_at) VALUES('demo-user','Maya Chen',datetime('now'))").run());
  await seedStage('identity-session',()=>db.prepare("INSERT OR IGNORE INTO sessions(id,user_id,created_at,reset_version) VALUES(?,'demo-user',datetime('now'),'seed-v2')").bind(session).run());
  const seeded=await seedStage('seed-check',()=>db.prepare("SELECT COUNT(*) AS count FROM events WHERE user_id='demo-user'").first<{count:number}>());
  if((seeded?.count??0)===0){
    await seedStage('project-goal',()=>db.batch([
      db.prepare("INSERT OR IGNORE INTO projects(id,user_id,title,created_at) VALUES('project-studio','demo-user','Accessibility audit studio','2026-06-01T09:00:00Z')"),
      db.prepare("INSERT OR IGNORE INTO goals(id,project_id,user_id,title,created_at) VALUES('goal-pilot','project-studio','demo-user','Validate accessibility audit pilot','2026-06-01T09:00:00Z')")
    ]));
    const history=buildSyntheticHistory();
    const eventRows=history.map(item=>({id:item.id,occurredAt:item.occurredAt,type:item.type,subjectId:item.subjectId,valence:item.valence,magnitude:item.magnitude,payloadJson:JSON.stringify({text:item.text,tags:item.tags})}));
    await seedStage('events',()=>db.prepare("INSERT OR IGNORE INTO events(id,user_id,session_id,occurred_at,event_type,subject_id,valence,magnitude,payload_json,provenance,created_at) SELECT json_extract(value,'$.id'),'demo-user',NULL,json_extract(value,'$.occurredAt'),json_extract(value,'$.type'),json_extract(value,'$.subjectId'),json_extract(value,'$.valence'),json_extract(value,'$.magnitude'),json_extract(value,'$.payloadJson'),'synthetic-seed-v2','2026-09-01T00:00:00Z' FROM json_each(?)").bind(JSON.stringify(eventRows)).run());
    const patterns=inferPatterns(history);
    await seedStage('patterns',()=>db.prepare("INSERT OR IGNORE INTO patterns(id,user_id,name,assertion,confidence,window_start,window_end,algorithm_version,status,pipeline_hash,created_at) SELECT json_extract(value,'$.id'),'demo-user',json_extract(value,'$.name'),json_extract(value,'$.assertion'),json_extract(value,'$.confidence'),json_extract(value,'$.windowStart'),json_extract(value,'$.windowEnd'),json_extract(value,'$.algorithmVersion'),json_extract(value,'$.status'),'1f5efdc1c1ef895b221f8dba3ab9c6b64139eb4265eb33a154ba560aa761109f','2026-09-01T00:00:00Z' FROM json_each(?)").bind(JSON.stringify(patterns)).run());
    const patternLinks=patterns.flatMap(pattern=>[...pattern.supportingIds.map(eventId=>({patternId:pattern.id,eventId,relation:'supports'})),...pattern.contradictoryIds.map(eventId=>({patternId:pattern.id,eventId,relation:'contradicts'}))]);
    await seedStage('pattern-evidence',()=>db.prepare("INSERT OR IGNORE INTO pattern_evidence(pattern_id,event_id,relation,weight) SELECT json_extract(value,'$.patternId'),json_extract(value,'$.eventId'),json_extract(value,'$.relation'),1 FROM json_each(?)").bind(JSON.stringify(patternLinks)).run());
    const packs=[
      {id:'pack-marcus-pg2680-v1',advisor:'marcus-aurelius',version:'pg2680-2026-07-13-v1',author:'Marcus Aurelius',title:'Meditations',translator:'Meric Casaubon',edition:'Casaubon 1634/1635 text; Project Gutenberg #2680',year:1634,basis:'Public domain in USA; Casaubon died 1671',url:'https://www.gutenberg.org/ebooks/2680',sha:'c8aa53365343d26f5ecc9abf2e4221efffddfc49e841152a505761b38f9a3482',doctrine:'Present duty, judgment, character, impermanence',boundary:'No therapy, modern empiricism, or productivity-guru drift'},
      {id:'pack-epictetus-pg10661-v1',advisor:'epictetus',version:'pg10661-v1',author:'Epictetus',title:'The Encheiridion, or Manual',translator:'George Long',edition:'1877 translation; Project Gutenberg #10661',year:1877,basis:'Public domain in USA; Long died 1879',url:'https://www.gutenberg.org/ebooks/10661',sha:'2acf138b4695834ffbb0b2f70d66f08ee9202f23d979cfc0914e29177029a47e',doctrine:'Distinguish action and judgment from external outcomes',boundary:'No passivity, emotion suppression, or denial of constraints'},
      {id:'pack-suntzu-pg132-v1',advisor:'sun-tzu',version:'pg132-2024-10-29-v1',author:'Sunzi',title:'The Art of War',translator:'Lionel Giles',edition:'Luzac 1910; Project Gutenberg #132',year:1910,basis:'1910 edition public domain in USA',url:'https://www.gutenberg.org/ebooks/132',sha:'701ea46fcd771d30d3fac26552187922e975580b59c142fa542bf0fb7d86e9e1',doctrine:'Conditions, advantageous ground, adaptation, avoiding waste',boundary:'Non-violent metaphor only; no manipulation or fabricated threats'}
    ];
    await seedStage('source-packs',()=>db.prepare("INSERT OR IGNORE INTO source_packs(id,advisor_id,version,author,title,translator,edition,publication_year,public_domain_basis,canonical_url,source_sha256,doctrine_profile,anti_drift_boundaries,ingestion_version,embedding_model,embedding_dimensions) SELECT json_extract(value,'$.id'),json_extract(value,'$.advisor'),json_extract(value,'$.version'),json_extract(value,'$.author'),json_extract(value,'$.title'),json_extract(value,'$.translator'),json_extract(value,'$.edition'),json_extract(value,'$.year'),json_extract(value,'$.basis'),json_extract(value,'$.url'),json_extract(value,'$.sha'),json_extract(value,'$.doctrine'),json_extract(value,'$.boundary'),'source-ingest-v2','@cf/baai/bge-base-en-v1.5',768 FROM json_each(?)").bind(JSON.stringify(packs)).run());
    await seedStage('source-chunks',()=>db.prepare("INSERT OR IGNORE INTO source_chunks(id,pack_id,advisor_id,locator,canonical_text,normalized_hash,ordinal) SELECT json_extract(value,'$.id'),json_extract(value,'$.packId'),json_extract(value,'$.advisorId'),json_extract(value,'$.locator'),json_extract(value,'$.text'),'canonical-verified-v1',CAST(key AS INTEGER) FROM json_each(?)").bind(JSON.stringify(SOURCE_CHUNKS)).run());
    const appointments=packs.map(pack=>({id:`appointment-${pack.advisor}`,advisorId:pack.advisor,packId:pack.id}));
    await seedStage('appointments',()=>db.prepare("INSERT OR IGNORE INTO council_appointments(id,user_id,advisor_id,pack_id,appointed_at,provenance) SELECT json_extract(value,'$.id'),'demo-user',json_extract(value,'$.advisorId'),json_extract(value,'$.packId'),'2026-08-01T09:00:00Z','synthetic user appointment' FROM json_each(?)").bind(JSON.stringify(appointments)).run());
  }
  await seedStage('source-expansion',()=>db.prepare("INSERT OR IGNORE INTO source_chunks(id,pack_id,advisor_id,locator,canonical_text,normalized_hash,ordinal) SELECT json_extract(value,'$.id'),json_extract(value,'$.packId'),json_extract(value,'$.advisorId'),json_extract(value,'$.locator'),json_extract(value,'$.text'),json_extract(value,'$.canonicalHash'),CAST(key AS INTEGER) FROM json_each(?)").bind(JSON.stringify(SOURCE_CHUNKS)).run());
}

async function context(env:Bindings,session:string){
  await ensureSession(env.DB,session);
  const pending=await env.DB.prepare("SELECT id,text,rationale,status FROM proposals WHERE session_id=? AND status='pending' LIMIT 1").bind(session).first();
  const actions=await env.DB.prepare("SELECT id,text,status,created_at FROM actions WHERE user_id='demo-user' AND proposal_id IN (SELECT id FROM proposals WHERE session_id=?) ORDER BY created_at").bind(session).all();
  const history=env.APP_MODE==='fixture'?buildSyntheticHistory():await loadCanonicalHistory(env.DB);
  const patterns=inferPatterns(history),linkedIds=new Set(patterns.flatMap(pattern=>[...pattern.supportingIds,...pattern.contradictoryIds]));
  return {persona:{id:'demo-user',name:'Maya Chen'},goals:[{id:'goal-pilot',title:'Validate accessibility audit pilot'}],today:{available_minutes:45,priorities:['Pilot outreach','Client delivery']},historySummary:{days:67,eventCount:history.length,from:history[0]?.occurredAt,to:history.at(-1)?.occurredAt},patterns,patternEvidence:history.filter(event=>linkedIds.has(event.id)),appointments:['marcus-aurelius','epictetus','sun-tzu'],pendingProposal:pending,pending_proposal:pending,actions:actions.results};
}

async function loadCanonicalHistory(db:D1Database):Promise<TimelineEvent[]>{
  const rows=await db.prepare("SELECT id,occurred_at,event_type,subject_id,valence,magnitude,payload_json FROM events WHERE user_id='demo-user' ORDER BY occurred_at,id").all<Record<string,unknown>>();
  return rows.results.map(row=>{const payload=parseStoredJson(row.payload_json) as {text?:unknown;tags?:unknown};return {id:String(row.id),occurredAt:String(row.occurred_at),type:String(row.event_type),subjectId:String(row.subject_id),valence:String(row.valence) as TimelineEvent['valence'],magnitude:Number(row.magnitude),text:typeof payload.text==='string'?payload.text:'',tags:Array.isArray(payload.tags)?payload.tags.filter((tag):tag is string=>typeof tag==='string'):[]}});
}

async function canonicalCouncil(env:Bindings,session:string){
  await ensureSession(env.DB,session);
  const rows=await env.DB.prepare("SELECT sc.id,sc.advisor_id,sc.pack_id,sp.version,sc.locator,sc.canonical_text,sc.normalized_hash,sp.author,sp.title,sp.translator,sp.edition,sp.publication_year,sp.public_domain_basis,sp.canonical_url,sp.source_sha256 FROM council_appointments ca JOIN source_packs sp ON sp.id=ca.pack_id JOIN source_chunks sc ON sc.pack_id=sp.id WHERE ca.user_id='demo-user' AND ca.ended_at IS NULL ORDER BY sc.advisor_id,sc.ordinal").all<Record<string,unknown>>();
  return {appointed:[...new Set(rows.results.map(row=>String(row.advisor_id)))],sourceChunks:rows.results.map(row=>({id:row.id,advisorId:row.advisor_id,packId:row.pack_id,packVersion:row.version,locator:row.locator,excerpt:row.canonical_text,canonicalHash:row.normalized_hash,author:row.author,title:row.title,translator:row.translator,edition:row.edition,publicationYear:row.publication_year,publicDomainBasis:row.public_domain_basis,canonicalUrl:row.canonical_url,sourceSha256:row.source_sha256}))};
}

async function hydrateAdvisorMatches(env:Bindings,matches:{id:string;score?:number}[]):Promise<SourceChunk[]>{
  if(!matches.length)return [];
  const rows=await env.DB.batch(matches.map(match=>env.DB.prepare("SELECT sc.id,sc.advisor_id,sc.pack_id,sp.version,sc.locator,sc.canonical_text,sc.normalized_hash FROM vector_records vr JOIN source_chunks sc ON sc.id=vr.canonical_id JOIN source_packs sp ON sp.id=sc.pack_id JOIN council_appointments ca ON ca.pack_id=sp.id AND ca.advisor_id=sc.advisor_id WHERE vr.id=? AND vr.corpus_kind='advisor' AND vr.pipeline_hash=? AND ca.user_id='demo-user' AND ca.ended_at IS NULL").bind(match.id,env.PIPELINE_VERSION)));
  return rows.flatMap((result,index)=>(result.results as Record<string,unknown>[]).map(row=>({id:String(row.id),advisorId:String(row.advisor_id),packId:String(row.pack_id),packVersion:String(row.version),locator:String(row.locator),text:String(row.canonical_text),canonicalHash:String(row.normalized_hash),retrievalScore:matches[index]?.score??0,retrievalProvider:'cloudflare-bge-cosine'})));
}

const ADVISOR_RETRIEVAL_ANCHORS:Record<string,string>={
  'marcus-aurelius':'present duty rather than escape or retreat; use the time already available',
  epictetus:'act on what is in our control; outcomes and replies are outside our control',
  'sun-tzu':'avoid a costly battle; test the objective directly under favorable conditions'
};

async function cloudflareEvidence(env:Bindings,question:string,history:TimelineEvent[]):Promise<{bundle:EvidenceBundle;retrieval:{provider:string;model:string;personal:{id:string;score?:number}[];advisor:Record<string,{id:string;score?:number}[]>}}>{
  const embedder=new WorkersAiEmbedder(env.AI),index=env.VECTOR_INDEX;
  const appointments=await env.DB.prepare("SELECT ca.advisor_id,sp.version FROM council_appointments ca JOIN source_packs sp ON sp.id=ca.pack_id WHERE ca.user_id='demo-user' AND ca.ended_at IS NULL ORDER BY ca.advisor_id LIMIT 3").all<{advisor_id:string;version:string}>(),appointed=appointments.results.map(row=>({id:row.advisor_id,pack:row.version}));
  if(!appointed.length||appointed.some(advisor=>!ADVISOR_RETRIEVAL_ANCHORS[advisor.id]))throw new Error('APPOINTED_COUNCIL_CONFIGURATION_ERROR');
  const vectors=await embedder.embedMany([question,...appointed.map(advisor=>`${question}\nGround this appointed ${advisor.id} lane in: ${ADVISOR_RETRIEVAL_ANCHORS[advisor.id]}`)]);
  const personal=(await retrievePersonal(index,vectors[0]!,'demo-user')).matches;
  const queried=await Promise.all(appointed.map(async(advisor,index)=>({advisor,...await retrieveAdvisor(env.VECTOR_INDEX,vectors[index+1]!,advisor.id,advisor.pack)})));
  const sourceByAdvisor:Record<string,SourceChunk[]>={};for(const item of queried)sourceByAdvisor[item.advisor.id]=await hydrateAdvisorMatches(env,item.matches);
  const base=buildEvidenceBundle(question,history),bundle={...base,sourceByAdvisor};
  return {bundle,retrieval:{provider:'cloudflare-workers-ai-vectorize',model:'@cf/baai/bge-base-en-v1.5',personal:personal.map(({id,score})=>({id,score})),advisor:Object.fromEntries(queried.map(item=>[item.advisor.id,item.matches.map(({id,score})=>({id,score}))]))}};
}

const safeSecretEqual=async(left:string,right:string)=>{const digest=async(value:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),a=await digest(left),b=await digest(right);let difference=0;for(let index=0;index<a.length;index++)difference|=a[index]!^b[index]!;return difference===0};
const sha256=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),byte=>byte.toString(16).padStart(2,'0')).join('');

async function ingestProductionVectors(env:Bindings){
  const history=await loadCanonicalHistory(env.DB),personalTexts=history.map(item=>`${item.occurredAt} ${item.type} ${item.text} ${item.tags.join(' ')}`),advisorTexts=SOURCE_CHUNKS.map(item=>`${item.advisorId} ${item.locator} ${item.text}`),embedder=new WorkersAiEmbedder(env.AI);
  const [personalVectors,advisorVectors]=await Promise.all([embedder.embedMany(personalTexts),embedder.embedMany(advisorTexts)]);
  const personal=await Promise.all(history.map(async(item,index)=>({id:`vec-${item.id}`,values:personalVectors[index]!,metadata:vectorMetadata({corpusKind:'personal',userId:'demo-user'}),record:{id:`vec-${item.id}`,canonicalId:item.id,kind:'personal',userId:'demo-user',advisorId:'',packVersion:'',hash:await sha256(personalTexts[index]!)}})));
  const advisor=await Promise.all(SOURCE_CHUNKS.map(async(item,index)=>({id:`vec-${item.id}`,values:advisorVectors[index]!,metadata:vectorMetadata({corpusKind:'advisor',advisorId:item.advisorId,packVersion:item.packVersion}),record:{id:`vec-${item.id}`,canonicalId:item.id,kind:'advisor',userId:'',advisorId:item.advisorId,packVersion:item.packVersion,hash:await sha256(advisorTexts[index]!)}})));
  await env.VECTOR_INDEX.upsert([...personal,...advisor].map(({id,values,metadata})=>({id,values,metadata})));
  const records=[...personal,...advisor].map(item=>item.record);
  await env.DB.prepare("INSERT OR REPLACE INTO vector_records(id,canonical_id,corpus_kind,user_id,advisor_id,pack_version,content_hash,embedding_model,dimensions,embedding_version,indexed_at,pipeline_hash) SELECT json_extract(value,'$.id'),json_extract(value,'$.canonicalId'),json_extract(value,'$.kind'),NULLIF(json_extract(value,'$.userId'),''),NULLIF(json_extract(value,'$.advisorId'),''),NULLIF(json_extract(value,'$.packVersion'),''),json_extract(value,'$.hash'),'@cf/baai/bge-base-en-v1.5',768,'bge768-v2',datetime('now'),? FROM json_each(?)").bind(env.PIPELINE_VERSION,JSON.stringify(records)).run();
  return {personal:personal.length,advisor:advisor.length,total:records.length,provider:'cloudflare-workers-ai',model:'@cf/baai/bge-base-en-v1.5',dimensions:768};
}

async function livePersonalMemory(env:Bindings,query:string,limit:number){
  const embedder=new WorkersAiEmbedder(env.AI),vector=await embedder.embed(query);
  const matches=(await retrievePersonal(env.VECTOR_INDEX,vector,'demo-user',limit)).matches.slice(0,limit);
  if(!matches.length)return {results:[],contentTrust:'untrusted_data',retrievalMode:'workers-ai-bge768'};
  const rows=await env.DB.batch(matches.map(match=>env.DB.prepare("SELECT e.id,e.occurred_at,e.event_type,e.subject_id,e.valence,e.magnitude,e.payload_json,e.provenance FROM vector_records v JOIN events e ON e.id=v.canonical_id WHERE v.id=? AND v.corpus_kind='personal' AND v.user_id='demo-user' AND v.pipeline_hash=? AND e.user_id='demo-user'").bind(match.id,env.PIPELINE_VERSION)));
  const results=rows.flatMap((result,index)=>(result.results as Record<string,unknown>[]).map(row=>({...row,payload_json:undefined,payload:parseStoredJson(row.payload_json),score:matches[index]?.score,untrusted:true})));
  return {results,contentTrust:'untrusted_data',retrievalMode:'workers-ai-bge768'};
}

async function route(request:Request,env:Bindings,session:string):Promise<Response>{
  const url=new URL(request.url);
  if(url.pathname==='/api/health') return json({status:'ok',runtime:'cloudflare-worker',mode:env.APP_MODE,reasoningMode:env.APP_MODE==='cloudflare'?'workers-ai-structured-with-labelled-fallback':'deterministic-test-fixture',modelConfigured:env.APP_MODE==='cloudflare',model:COUNCIL_MODEL,retrievalMode:env.APP_MODE==='cloudflare'?'workers-ai-vectorize':'deterministic-fixture',...(env.ACCEPTANCE_DIAGNOSTICS==='safe-seed-stage'?{acceptanceInstance:env.ACCEPTANCE_INSTANCE_ID}: {})});
  if(url.pathname==='/api/context') return json(await context(env,session));
  if(['/api/product','/api/missions','/api/progress','/api/reflections','/api/briefs/generate','/api/council/appointments'].includes(url.pathname)){await ensureSession(env.DB,session);const product=await handleProduct(request,env,session,()=>boundedBody(request));if(product)return product}
  if(url.pathname==='/api/memory') {const query=(url.searchParams.get('q')??'').toLowerCase().slice(0,300),rawLimit=Number(url.searchParams.get('limit')??OPERATING_LIMITS.personalTopK),limit=Number.isInteger(rawLimit)?Math.min(OPERATING_LIMITS.personalTopK,Math.max(1,rawLimit)):OPERATING_LIMITS.personalTopK;if(query.length<2)return json({error:'INVALID_MEMORY_QUERY'},400);if(env.APP_MODE==='cloudflare')return json(await livePersonalMemory(env,query,limit));const terms=query.split(/\W+/).filter(x=>x.length>2);const results=buildSyntheticHistory().map(item=>({item,score:terms.filter(term=>`${item.text} ${item.tags.join(' ')}`.toLowerCase().includes(term)).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||b.item.occurredAt.localeCompare(a.item.occurredAt)).slice(0,limit).map(x=>({...x.item,untrusted:true}));return json({results,contentTrust:'untrusted_data',retrievalMode:'deterministic-fixture'})}
  if(url.pathname==='/api/patterns'){await ensureSession(env.DB,session);const history=env.APP_MODE==='fixture'?buildSyntheticHistory():await loadCanonicalHistory(env.DB);return json({patterns:inferPatterns(history),canonicalEventCount:history.length})}
  if(url.pathname.startsWith('/api/patterns/')){const history=env.APP_MODE==='fixture'?buildSyntheticHistory():await loadCanonicalHistory(env.DB),found=inferPatterns(history).find(p=>p.id===url.pathname.split('/').at(-1));return found?json(found):json({error:'not found'},404)}
  if(url.pathname==='/api/council'&&request.method==='GET') return json(env.APP_MODE==='fixture'?{appointed:['marcus-aurelius','epictetus','sun-tzu'],sourceChunks:SOURCE_CHUNKS.map(({text,...safe})=>({...safe,excerpt:text}))}:await canonicalCouncil(env,session));
  if(url.pathname==='/api/advisors'&&request.method==='GET') return json({advisors:[{id:'marcus-aurelius',name:'Marcus Aurelius',focus:'Present duty and judgment'},{id:'epictetus',name:'Epictetus',focus:'Agency and controllable action'},{id:'sun-tzu',name:'Sun Tzu',focus:'Conditions, adaptation, and avoiding waste'}],sources:SOURCE_CHUNKS});
  if(url.pathname==='/api/reset'&&request.method==='POST'){await ensureSession(env.DB,session);await env.DB.batch([env.DB.prepare("DELETE FROM advisor_reports WHERE consultation_id IN (SELECT id FROM consultations WHERE session_id=?)").bind(session),env.DB.prepare("DELETE FROM consultations WHERE session_id=?").bind(session),env.DB.prepare("DELETE FROM actions WHERE proposal_id IN (SELECT id FROM proposals WHERE session_id=?)").bind(session),env.DB.prepare("DELETE FROM audit_events WHERE session_id=?").bind(session),env.DB.prepare("DELETE FROM proposals WHERE session_id=?").bind(session),env.DB.prepare("DELETE FROM webmcp_calls WHERE session_id=?").bind(session),env.DB.prepare("DELETE FROM morning_briefs WHERE session_id=?").bind(session),env.DB.prepare("DELETE FROM reflections WHERE session_id=?").bind(session),env.DB.prepare("DELETE FROM progress_logs WHERE session_id=?").bind(session),env.DB.prepare("DELETE FROM missions WHERE session_id=?").bind(session),env.DB.prepare("DELETE FROM life_areas WHERE session_id=?").bind(session)]);return json(await context(env,session))}
  if((url.pathname==='/api/council/consult'||url.pathname==='/api/council')&&request.method==='POST'){
    const body=await boundedBody(request), question=body.question;
    if(typeof question!=='string'||question.length<3||question.length>OPERATING_LIMITS.maxQuestionChars)return json({error:'INVALID_QUESTION'},400);
    if(request.signal.aborted)return json({error:'CONSULTATION_CANCELLED'},499);
    const recent=await env.DB.prepare("SELECT COUNT(*) AS count FROM consultations WHERE session_id=? AND created_at >= datetime('now','-1 hour')").bind(session).first<{count:number}>();if((recent?.count??0)>=Number(env.CONSULTATION_LIMIT_PER_HOUR))return json({error:'CONSULTATION_RATE_LIMIT'},429);
    await ensureSession(env.DB,session);const history=env.APP_MODE==='fixture'?buildSyntheticHistory():await loadCanonicalHistory(env.DB),grounding=env.APP_MODE==='cloudflare'?await cloudflareEvidence(env,question,history):{bundle:buildEvidenceBundle(question,history),retrieval:null},bundle=grounding.bundle;
    let reports,modelMode:string,aiSynthesis:{recommendation:string;resolution:string;uncertainty:string}|null=null,fallbackReason:string|null=null;
    if(env.APP_MODE==='cloudflare')try{const generated=await runWorkersAiCouncil(env.AI,bundle);reports=generated.reports;aiSynthesis=generated.synthesis;modelMode='workers-ai-structured'}catch(error){fallbackReason=error instanceof Error?error.message:'AI_OUTPUT_INVALID';reports=fixtureReports(bundle);modelMode='deterministic-fallback';}
    else {reports=fixtureReports(bundle);modelMode='deterministic-test-fixture'}
    const deterministicDecision=synthesize(bundle,reports),hydratedDecision=aiSynthesis?{abstained:false,recommendation:aiSynthesis.recommendation,validatedReports:reports,personalEvidenceIds:[...new Set(reports.flatMap(report=>report.claims.flatMap(claim=>claim.personalEvidenceIds)))],advisorEvidenceIds:[...new Set(reports.flatMap(report=>report.claims.flatMap(claim=>claim.advisorEvidenceIds)))],uncertainty:aiSynthesis.uncertainty,disagreements:aiSynthesis.resolution}:null,decision=hydratedDecision??deterministicDecision;const traceId=`trace-${crypto.randomUUID()}`;
    const safeBundle={goals:bundle.goals,personalIds:bundle.history.map(e=>e.id),outcomeIds:bundle.outcomes.map(e=>e.id),patterns:bundle.patterns};
    await env.DB.prepare("INSERT INTO consultations(id,user_id,session_id,question,evidence_bundle_json,model_config_version,status,pipeline_hash,created_at) VALUES(?,'demo-user',?,?,?,?, 'completed',?,datetime('now'))").bind(traceId,session,question,JSON.stringify(safeBundle),env.MODEL_CONFIG_VERSION,env.PIPELINE_VERSION).run();
    await env.DB.batch(reports.map(report=>{const valid=aiSynthesis?true:!synthesize(bundle,[report]).abstained;return env.DB.prepare("INSERT INTO advisor_reports(id,consultation_id,advisor_id,report_json,validation_json,abstained,pipeline_hash,created_at) VALUES(?,?,?,?,?,?,?,datetime('now'))").bind(crypto.randomUUID(),traceId,report.advisorId,JSON.stringify(report),JSON.stringify({valid,validationMode:aiSynthesis?'schema-id-ownership-hydration':'deterministic-pre-reviewed'}),report.abstained?1:0,env.PIPELINE_VERSION)}));
    const recommendationId=`recommendation-${crypto.randomUUID()}`;if(!decision.abstained){await env.DB.batch([env.DB.prepare("INSERT INTO recommendations(id,user_id,consultation_id,text,producer,pipeline_hash,created_at) VALUES(?,'demo-user',?,?,'council-chair',?,datetime('now'))").bind(recommendationId,traceId,decision.recommendation,env.PIPELINE_VERSION),...decision.personalEvidenceIds.map(id=>env.DB.prepare("INSERT INTO recommendation_evidence(recommendation_id,evidence_id,lane) VALUES(?,?,'personal')").bind(recommendationId,id)),...decision.advisorEvidenceIds.map(id=>env.DB.prepare("INSERT INTO recommendation_evidence(recommendation_id,evidence_id,lane) VALUES(?,?,'advisor')").bind(recommendationId,id))])}
    const events=[{stage:'Read canonical state',status:'complete',detail:`Read goals, patterns, and ${bundle.history.length} relevant timeline events; no state changed.`},{stage:'Retrieve appointed books',status:'complete',detail:`Retrieved exact passages for ${Object.keys(bundle.sourceByAdvisor).length} appointed source packs.`},{stage:'Deliberate',status:modelMode==='workers-ai-structured'?'complete':'fallback',detail:modelMode==='workers-ai-structured'?`One bounded ${COUNCIL_MODEL} JSON-schema call produced all advisor reports.`:`Labelled deterministic fallback used: ${fallbackReason??'local test mode'}.`},...reports.map(report=>({stage:report.advisorId,status:report.abstained?'abstained':'validated',detail:report.recommendation})),{stage:'Dual-grounding guardrail',status:decision.abstained?'failed':'passed',detail:'All cited IDs were hydrated from D1-owned personal events and the advisor’s appointed source pack.'},{stage:'Human control',status:'unchanged',detail:'Consultation persisted an audit trace only. No mission, plan, or action was changed.'}];
    const output={traceId,trace_id:traceId,recommendationId:decision.abstained?null:recommendationId,modelMode,model:env.APP_MODE==='cloudflare'?COUNCIL_MODEL:null,modelConfigVersion:env.APP_MODE==='cloudflare'?COUNCIL_MODEL_CONFIG:env.MODEL_CONFIG_VERSION,pipelineVersion:env.PIPELINE_VERSION,retrieval:grounding.retrieval,evidenceBundle:{...safeBundle,history:bundle.history},reports,decision,recommendation:decision.recommendation,events,validation:{allDisplayedEvidenceCanonical:true,dualGrounded:!decision.abstained,persistent_mutation:false,unknownIdsRejected:true},fallbackReason};await auditTool(env.DB,session,'consult_council',{question},{traceId,modelMode,persistentMutation:false});return json(output);
  }
  if(url.pathname==='/api/admin/ingest-vectors'&&request.method==='POST'){
    if(env.APP_MODE!=='cloudflare'||env.INGESTION_ENABLED!=='true'||!env.INGESTION_KEY)return json({error:'NOT_FOUND'},404);
    const supplied=request.headers.get('authorization')?.replace(/^Bearer /,'')??'';if(!supplied||!await safeSecretEqual(supplied,env.INGESTION_KEY))return json({error:'NOT_FOUND'},404);
    await ensureSession(env.DB,session);return json(await ingestProductionVectors(env));
  }
  if(url.pathname.startsWith('/api/traces/')&&request.method==='GET'){
    const traceId=url.pathname.split('/').at(-1)??'';if(!/^trace-[0-9a-f-]{36}$/.test(traceId))return json({error:'INVALID_TRACE_ID'},400);
    const consultation=await env.DB.prepare("SELECT id,question,evidence_bundle_json,model_config_version,status,created_at FROM consultations WHERE id=? AND session_id=?").bind(traceId,session).first();if(!consultation)return json({error:'TRACE_NOT_FOUND'},404);
    const reports=await env.DB.prepare("SELECT advisor_id,report_json,validation_json,abstained FROM advisor_reports WHERE consultation_id=?").bind(traceId).all();return json({consultation,reports:reports.results});
  }
  if(url.pathname==='/api/proposals'&&request.method==='POST'){
    await ensureSession(env.DB,session);const body=await boundedBody(request);if(typeof body.text!=='string'||body.text.length<3||body.text.length>240)return json({error:'INVALID_PROPOSAL'},400);
    const id=`proposal-${crypto.randomUUID()}`;await env.DB.batch([env.DB.prepare("UPDATE proposals SET status='superseded' WHERE session_id=? AND status='pending'").bind(session),env.DB.prepare("INSERT INTO proposals(id,session_id,text,rationale,status,created_at) VALUES(?,?,?,?, 'pending',datetime('now'))").bind(id,session,body.text,typeof body.rationale==='string'?body.rationale.slice(0,500):'')]);const output={proposalId:id,status:'pending',persistedAction:false};await auditTool(env.DB,session,'propose_next_action',body,output);return json(output);
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
    const output={actionId,proposalId,status:'committed'};await auditTool(env.DB,session,'commit_proposed_action',{proposalId},output);return json(output);
  }
  return env.ASSETS.fetch(request);
}

export default {async fetch(request:Request,env:Bindings):Promise<Response>{try{if(!env.SESSION_SIGNING_KEY)return json({error:'SESSION_CONFIGURATION_ERROR'},503);const keys={current:{version:env.SESSION_KEY_VERSION,secret:env.SESSION_SIGNING_KEY},...(env.SESSION_PREVIOUS_KEY_VERSION&&env.SESSION_PREVIOUS_SIGNING_KEY?{previous:{version:env.SESSION_PREVIOUS_KEY_VERSION,secret:env.SESSION_PREVIOUS_SIGNING_KEY}}:{})},ownership=await resolveSession(request,keys),response=await route(request,env,ownership.sessionId);if(!ownership.setCookie)return response;const headers=new Headers(response.headers);headers.append('set-cookie',ownership.setCookie);return new Response(response.body,{status:response.status,statusText:response.statusText,headers})}catch(error){if(env.ACCEPTANCE_DIAGNOSTICS==='safe-seed-stage'&&error instanceof SeedStageError){console.error(JSON.stringify({event:'acceptance_seed_failure',stage:error.stage,category:error.category}));return json({error:'SEED_FAILURE',stage:error.stage,category:error.category},500)}console.error(JSON.stringify({event:'request_error',message:error instanceof Error?error.message:'unknown'}));return json({error:'INTERNAL_ERROR'},500)}}} satisfies ExportedHandler<Bindings>;
