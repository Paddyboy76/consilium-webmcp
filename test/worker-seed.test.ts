import { readFileSync } from 'node:fs';
import { DatabaseSync, type StatementSync } from 'node:sqlite';
import { describe,expect,it } from 'vitest';
import worker from '../worker/index';

class SqliteStatement {
  private parameters:string[]=[];
  constructor(private readonly statement:StatementSync,readonly reads:boolean){}
  bind(...parameters:unknown[]){this.parameters=parameters.map(String);return this}
  run(){const result=this.statement.run(...this.parameters);return Promise.resolve({success:true,meta:{changes:Number(result.changes)},results:[]})}
  first<T>(){return Promise.resolve(this.statement.get(...this.parameters) as T|null)}
  all<T>(){return Promise.resolve({success:true,meta:{changes:0},results:this.statement.all(...this.parameters) as T[]})}
}

class SqliteD1 {
  constructor(private readonly database:DatabaseSync){}
  prepare(sql:string){return new SqliteStatement(this.database.prepare(sql),/^\s*SELECT\b/i.test(sql))}
  async batch(statements:SqliteStatement[]){const results=[];for(const statement of statements)results.push(statement.reads?await statement.all():await statement.run());return results}
}

class CloudflareAiFixture {run(_model:string,input:{text:string[]}){return Promise.resolve({data:input.text.map(text=>Array.from({length:768},(_,dimension)=>dimension===0?(text.includes('marcus-aurelius')?2:text.includes('epictetus')?3:text.includes('sun-tzu')?4:1):.01))})}}
class VectorizeFixture {
  private ids:string[]=[];
  upsert(vectors:{id:string}[]){this.ids=vectors.map(vector=>vector.id);return Promise.resolve({mutationId:'fixture-mutation'})}
  query(vector:number[],options:{topK:number;filter:Record<string,string>}){const filter=options.filter;let ids:string[]=[];if(filter.corpus_kind==='personal')ids=this.ids.filter(id=>id.startsWith('vec-evt-')).slice(0,8);else if(filter.advisor_id==='marcus-aurelius')ids=['vec-marcus-b4-03','vec-marcus-b2-15'];else if(filter.advisor_id==='epictetus')ids=['vec-epictetus-ench-01a','vec-epictetus-ench-01b'];else if(filter.advisor_id==='sun-tzu')ids=['vec-suntzu-3-2','vec-suntzu-1-18'];const expected=filter.advisor_id==='marcus-aurelius'?2:filter.advisor_id==='epictetus'?3:filter.advisor_id==='sun-tzu'?4:1;return Promise.resolve({matches:ids.filter(id=>this.ids.includes(id)).slice(0,options.topK).map(id=>({id,score:vector[0]===expected ? 0.9 : 0.1})),count:Math.min(ids.length,options.topK)})}
}

const baseEnv=(database:DatabaseSync)=>({DB:new SqliteD1(database),MODEL_CONFIG_VERSION:'council-v1',PIPELINE_VERSION:'1f5efdc1c1ef895b221f8dba3ab9c6b64139eb4265eb33a154ba560aa761109f',CONSULTATION_LIMIT_PER_HOUR:'6',SESSION_KEY_VERSION:'k1',SESSION_SIGNING_KEY:'test-only-signing-secret-at-least-32-bytes',ASSETS:{fetch:()=>Promise.resolve(new Response('asset'))}});
const migratedDatabase=()=>{const database=new DatabaseSync(':memory:');for(const file of ['0001_initial.sql','0002_hardening.sql','0003_recovery_product.sql','0004_structured_reflection.sql'])database.exec(readFileSync(`migrations/${file}`,'utf8'));return database};
const reflectionInput=(todayIds:string[],marker='outreach')=>({journal:`A deliberately specific ${marker} journal records the operational and emotional tone of this day.`,biometrics:{sleep_hours:6.5,energy_level:6,stress_level:7,resting_hr:61},caar:{q1_today_intent:`Completed measurable ${marker} progress on the primary deliverable.`,q2_top_win:`The main ${marker} friction was avoidance; Version 2 starts with the exposed task.`,q3_top_failure:`Focus was strongest in the quiet morning environment before messages arrived.`,q4_pattern_notice:`Preparation worked because I opened the evidence checklist before other tools.`,q5_tomorrow_priority:`I polished presentation details instead of testing the most uncertain outcome.`,q6_if_then_plan:`Tomorrow ${marker} is first; if avoidance appears, then send one plain test before polishing.`},goal_reflections:todayIds.map((goal_id,index)=>({goal_id,status:index===0?'missed':'achieved',...(index===0?{why_failed:`I avoided the exposed ${marker} action and chose comfortable polishing instead.`,adaptation:`Open the ${marker} target first and complete one plain attempt before any polishing.`}:{})}))});

describe('first-request D1 seed',()=>{
  it('persists the recovered mission → failure → reflection → brief loop on one session',async()=>{
    const database=migratedDatabase(),env={...baseEnv(database),APP_MODE:'fixture'};
    const initial=await worker.fetch(new Request('https://fixture.test/api/product'),env as never),cookie=initial.headers.get('set-cookie')?.split(';')[0],product=await initial.json<{areas:{id:string}[];missions:unknown[]}>();
    expect({status:initial.status,areas:product.areas.length,missions:product.missions.length}).toEqual({status:200,areas:4,missions:8});
    const call=async(path:string,input:unknown)=>worker.fetch(new Request(`https://fixture.test${path}`,{method:'POST',headers:{cookie:cookie!,'content-type':'application/json'},body:JSON.stringify(input)}),env as never);
    const created=await call('/api/missions',{kind:'goal',areaId:product.areas[0]!.id,horizon:'today',title:'Unique recovery goal',why:'Prove linked history'}),mission=await created.json<{id:string}>();
    expect(created.status).toBe(201);
    expect((await call('/api/progress',{missionId:mission.id,result:'failure',progress:10,note:'The first attempt failed'})).status).toBe(201);
    const refreshed=await (await worker.fetch(new Request('https://fixture.test/api/product',{headers:{cookie:cookie!}}),env as never)).json<{missions:{id:string;horizon:string;status:string}[]}>(),todayIds=refreshed.missions.filter(item=>item.horizon==='today'&&item.status==='active').map(item=>item.id);
    const reflected=await call('/api/reflections',reflectionInput(todayIds,'contact-list')),reflection=await reflected.json<{id:string}>();
    expect(reflected.status).toBe(201);
    const briefResponse=await call('/api/briefs/generate',{}),brief=await briefResponse.json<{priorities:{why:string;evidenceIds:string[]}[]}>();
    expect(brief.priorities[0]?.why).toContain('Open the contact-list target first');expect(brief.priorities[0]?.evidenceIds).toContain(reflection.id);
    expect(database.prepare("SELECT COUNT(*) count FROM webmcp_calls WHERE session_id=(SELECT session_id FROM missions WHERE id=?)").get(mission.id)?.count).toBe(4);
  });
  it('changes selected evidence and priorities for different reflections, including a new missed-goal adaptation',async()=>{
    const database=migratedDatabase(),env={...baseEnv(database),APP_MODE:'fixture'},initial=await worker.fetch(new Request('https://fixture.test/api/product'),env as never),cookie=initial.headers.get('set-cookie')?.split(';')[0],product=await initial.json<{missions:{id:string;horizon:string;status:string}[]}>(),today=product.missions.filter(item=>item.horizon==='today'&&item.status==='active').map(item=>item.id),call=(path:string,input:unknown)=>worker.fetch(new Request(`https://fixture.test${path}`,{method:'POST',headers:{cookie:cookie!,'content-type':'application/json'},body:JSON.stringify(input)}),env as never);
    const firstReflection=await call('/api/reflections',reflectionInput(today,'delivery')),first=await firstReflection.json<{id:string}>(),firstBrief=await (await call('/api/briefs/generate',{})).json<{priorities:{missionId:string;why:string;evidenceIds:string[]}[]}>();
    const secondInput=reflectionInput(today,'counterexample');secondInput.goal_reflections=secondInput.goal_reflections.map((item,index)=>index===0?{...item,status:'achieved' as const,why_failed:undefined,adaptation:undefined}:{...item,status:'missed' as const,why_failed:'I deferred the counterexample draft until the remaining time was too fragmented.',adaptation:'Draft the counterexample claim in the first focus block before reading more sources.'});
    const secondReflection=await call('/api/reflections',secondInput),second=await secondReflection.json<{id:string}>(),secondBrief=await (await call('/api/briefs/generate',{})).json<{priorities:{missionId:string;why:string;evidenceIds:string[]}[]}>();
    expect(first.id).not.toBe(second.id);expect(firstBrief.priorities[0]?.missionId).not.toBe(secondBrief.priorities[0]?.missionId);expect(firstBrief.priorities[0]?.evidenceIds).toContain(first.id);expect(secondBrief.priorities[0]?.evidenceIds).toContain(second.id);expect(secondBrief.priorities[0]?.why).toContain('Draft the counterexample claim');
  });
  it('returns useful field errors and rejects incomplete structured reflections',async()=>{
    const database=migratedDatabase(),env={...baseEnv(database),APP_MODE:'fixture'},response=await worker.fetch(new Request('https://fixture.test/api/reflections',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({journal:'short'})}),env as never),body=await response.json<{fieldErrors:Record<string,string>}>();
    expect(response.status).toBe(400);expect(body.fieldErrors.journal).toContain('40');expect(body.fieldErrors['caar.q1_today_intent']).toContain('15');expect(body.fieldErrors.goal_reflections).toBeTruthy();
  });
  it('seeds a fresh migrated database and returns context',async()=>{
    const database=migratedDatabase();
    const response=await worker.fetch(new Request('https://fixture.test/api/context'),{...baseEnv(database),APP_MODE:'fixture'} as never);
    const body=await response.json<{historySummary?:{days:number};error?:string}>();
    expect({status:response.status,error:body.error,days:body.historySummary?.days}).toEqual({status:200,error:undefined,days:67});
    expect({events:database.prepare('SELECT COUNT(*) count FROM events').get()?.count,patterns:database.prepare('SELECT COUNT(*) count FROM patterns').get()?.count,chunks:database.prepare('SELECT COUNT(*) count FROM source_chunks').get()?.count,appointments:database.prepare('SELECT COUNT(*) count FROM council_appointments').get()?.count}).toEqual({events:96,patterns:3,chunks:18,appointments:3});
  });
  it('keeps Cloudflare retrieval separate from deterministic dual-grounded synthesis',async()=>{
    const database=migratedDatabase(),env={...baseEnv(database),APP_MODE:'cloudflare',AI:new CloudflareAiFixture(),VECTOR_INDEX:new VectorizeFixture(),INGESTION_ENABLED:'true',INGESTION_KEY:'fixture-ingestion-key'};
    const ingested=await worker.fetch(new Request('https://fixture.test/api/admin/ingest-vectors',{method:'POST',headers:{authorization:'Bearer fixture-ingestion-key'}}),env as never),ingestion=await ingested.json<{total:number}>();expect({status:ingested.status,total:ingestion.total}).toEqual({status:200,total:114});const cookie=ingested.headers.get('set-cookie')?.split(';')[0];expect(cookie).toBeTruthy();
    const memory=await worker.fetch(new Request('https://fixture.test/api/memory?q=pilot&limit=5',{headers:{cookie:cookie!}}),env as never),memoryBody=await memory.json<{retrievalMode:string;results:unknown[]}>();expect({mode:memoryBody.retrievalMode,results:memoryBody.results.length}).toEqual({mode:'workers-ai-bge768',results:5});
    const capped=await worker.fetch(new Request('https://fixture.test/api/memory?q=pilot&limit=99',{headers:{cookie:cookie!}}),env as never),cappedBody=await capped.json<{results:unknown[]}>();expect(cappedBody.results).toHaveLength(8);
    const consultation=await worker.fetch(new Request('https://fixture.test/api/council',{method:'POST',headers:{cookie:cookie!,'content-type':'application/json'},body:JSON.stringify({question:'What should I focus on in the next 45 minutes, and why?'})}),env as never),body=await consultation.json<{modelMode:string;retrieval:{provider:string};reports:{abstained:boolean;claims:{personalEvidenceIds:string[];advisorEvidenceIds:string[]}[]}[];validation:{dualGrounded:boolean};decision:{abstained:boolean;validatedReports:unknown[];personalEvidenceIds:string[];advisorEvidenceIds:string[]}}>();
    expect({status:consultation.status,mode:body.modelMode,provider:body.retrieval.provider,grounded:body.validation.dualGrounded,abstained:body.decision.abstained,validated:body.decision.validatedReports.length,personal:body.decision.personalEvidenceIds,advisor:body.decision.advisorEvidenceIds.sort()}).toEqual({status:200,mode:'deterministic-fallback',provider:'cloudflare-workers-ai-vectorize',grounded:true,abstained:false,validated:3,personal:['evt-64-adapt-success'],advisor:['epictetus-ench-01a','marcus-b4-03','suntzu-3-2']});
    for(const report of body.reports){expect(report.abstained).toBe(false);expect(report.claims[0]?.personalEvidenceIds).toEqual(['evt-64-adapt-success']);expect(report.claims[0]?.advisorEvidenceIds).toHaveLength(1)}
    expect(database.prepare("SELECT COUNT(*) count FROM events WHERE id='evt-64-adapt-success' AND user_id='demo-user'").get()?.count).toBe(1);expect(database.prepare("SELECT COUNT(*) count FROM source_chunks sc JOIN council_appointments ca ON ca.pack_id=sc.pack_id WHERE sc.id IN ('marcus-b4-03','epictetus-ench-01a','suntzu-3-2') AND ca.user_id='demo-user' AND ca.ended_at IS NULL").get()?.count).toBe(3);
  });
});
