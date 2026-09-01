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

class CloudflareAiFixture {run(_model:string,input:{text:string[]}){return Promise.resolve({data:input.text.map(()=>Array.from({length:768},()=>0.01))})}}
class VectorizeFixture {
  private ids:string[]=[];
  upsert(vectors:{id:string}[]){this.ids=vectors.map(vector=>vector.id);return Promise.resolve({mutationId:'fixture-mutation'})}
  query(_vector:number[],options:{filter:Record<string,string>}){const filter=options.filter;let ids:string[]=[];if(filter.corpus_kind==='personal')ids=['vec-evt-64-adapt-success'];else if(filter.advisor_id==='marcus-aurelius')ids=['vec-marcus-b4-03','vec-marcus-b2-15'];else if(filter.advisor_id==='epictetus')ids=['vec-epictetus-ench-01a','vec-epictetus-ench-01b'];else if(filter.advisor_id==='sun-tzu')ids=['vec-suntzu-3-2','vec-suntzu-1-18'];return Promise.resolve({matches:ids.filter(id=>this.ids.includes(id)).map(id=>({id,score:.9})),count:ids.length})}
}

const baseEnv=(database:DatabaseSync)=>({DB:new SqliteD1(database),MODEL_CONFIG_VERSION:'council-v1',PIPELINE_VERSION:'1f5efdc1c1ef895b221f8dba3ab9c6b64139eb4265eb33a154ba560aa761109f',CONSULTATION_LIMIT_PER_HOUR:'6',SESSION_KEY_VERSION:'k1',SESSION_SIGNING_KEY:'test-only-signing-secret-at-least-32-bytes',ASSETS:{fetch:()=>Promise.resolve(new Response('asset'))}});
const migratedDatabase=()=>{const database=new DatabaseSync(':memory:');database.exec(readFileSync('migrations/0001_initial.sql','utf8'));database.exec(readFileSync('migrations/0002_hardening.sql','utf8'));return database};

describe('first-request D1 seed',()=>{
  it('seeds a fresh migrated database and returns context',async()=>{
    const database=migratedDatabase();
    const response=await worker.fetch(new Request('https://fixture.test/api/context'),{...baseEnv(database),APP_MODE:'fixture'} as never);
    const body=await response.json<{historySummary?:{days:number};error?:string}>();
    expect({status:response.status,error:body.error,days:body.historySummary?.days}).toEqual({status:200,error:undefined,days:67});
    expect({events:database.prepare('SELECT COUNT(*) count FROM events').get()?.count,patterns:database.prepare('SELECT COUNT(*) count FROM patterns').get()?.count,chunks:database.prepare('SELECT COUNT(*) count FROM source_chunks').get()?.count,appointments:database.prepare('SELECT COUNT(*) count FROM council_appointments').get()?.count}).toEqual({events:96,patterns:3,chunks:6,appointments:3});
  });
  it('keeps Cloudflare retrieval separate from deterministic dual-grounded synthesis',async()=>{
    const database=migratedDatabase(),env={...baseEnv(database),APP_MODE:'cloudflare',AI:new CloudflareAiFixture(),VECTOR_INDEX:new VectorizeFixture(),INGESTION_ENABLED:'true',INGESTION_KEY:'fixture-ingestion-key'};
    const ingested=await worker.fetch(new Request('https://fixture.test/api/admin/ingest-vectors',{method:'POST',headers:{authorization:'Bearer fixture-ingestion-key'}}),env as never),ingestion=await ingested.json<{total:number}>();expect({status:ingested.status,total:ingestion.total}).toEqual({status:200,total:102});const cookie=ingested.headers.get('set-cookie')?.split(';')[0];expect(cookie).toBeTruthy();
    const memory=await worker.fetch(new Request('https://fixture.test/api/memory?q=protected%20pilot',{headers:{cookie:cookie!}}),env as never),memoryBody=await memory.json<{retrievalMode:string;results:unknown[]}>();expect({mode:memoryBody.retrievalMode,results:memoryBody.results.length}).toEqual({mode:'workers-ai-bge768',results:1});
    const consultation=await worker.fetch(new Request('https://fixture.test/api/council',{method:'POST',headers:{cookie:cookie!,'content-type':'application/json'},body:JSON.stringify({question:'What should I focus on today and why?'})}),env as never),body=await consultation.json<{modelMode:string;retrieval:{provider:string};validation:{dualGrounded:boolean};decision:{personalEvidenceIds:string[];advisorEvidenceIds:string[]}}>();
    expect({status:consultation.status,mode:body.modelMode,provider:body.retrieval.provider,grounded:body.validation.dualGrounded,personal:body.decision.personalEvidenceIds.length,advisor:body.decision.advisorEvidenceIds.length}).toEqual({status:200,mode:'deterministic-cloudflare-dual-grounded',provider:'cloudflare-workers-ai-vectorize',grounded:true,personal:1,advisor:3});
  });
});
