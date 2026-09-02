import { readFileSync } from 'node:fs';
import { DatabaseSync, type StatementSync } from 'node:sqlite';
import { describe,expect,it } from 'vitest';
import worker from '../worker/index';

class Statement { private values:unknown[]=[]; constructor(private inner:StatementSync,readonly reads:boolean){} bind(...values:unknown[]){this.values=values;return this} run(){const value=this.inner.run(...this.values as never[]);return Promise.resolve({success:true,meta:{changes:Number(value.changes)},results:[]})} first<T>(){return Promise.resolve(this.inner.get(...this.values as never[]) as T|null)} all<T>(){return Promise.resolve({success:true,meta:{changes:0},results:this.inner.all(...this.values as never[]) as T[]})} }
class D1 { constructor(private db:DatabaseSync){} prepare(sql:string){return new Statement(this.db.prepare(sql),/^\s*SELECT\b/i.test(sql))} async batch(items:Statement[]){const results=[];for(const item of items)results.push(item.reads?await item.all():await item.run());return results} }
const setup=()=>{const db=new DatabaseSync(':memory:');for(const file of ['0001_initial.sql','0002_hardening.sql','0003_recovery_product.sql','0004_structured_reflection.sql','0005_exact_life_domains.sql','0006_pass5_journal_commit.sql'])db.exec(readFileSync(`migrations/${file}`,'utf8'));const env={DB:new D1(db),APP_MODE:'fixture',MODEL_CONFIG_VERSION:'council-v1',PIPELINE_VERSION:'1f5efdc1c1ef895b221f8dba3ab9c6b64139eb4265eb33a154ba560aa761109f',CONSULTATION_LIMIT_PER_HOUR:'6',SESSION_KEY_VERSION:'k1',SESSION_SIGNING_KEY:'test-only-signing-secret-at-least-32-bytes',ASSETS:{fetch:()=>Promise.resolve(new Response('asset'))}};return {db,env}};

describe('Pass 5 complete human and WebMCP loop',()=>{
  it('persists linked journal and status, then commits one proposal into visible Today state',async()=>{
    const {env}=setup(),initial=await worker.fetch(new Request('https://fixture.test/api/product'),env as never),cookie=initial.headers.get('set-cookie')!.split(';')[0]!,product=await initial.json<{areas:{id:string}[];missions:{id:string;area_id:string;horizon:string}[]}>(),goal=product.missions.find(m=>m.horizon==='today')!,call=(path:string,input:unknown)=>worker.fetch(new Request(`https://fixture.test${path}`,{method:'POST',headers:{cookie,'content-type':'application/json'},body:JSON.stringify(input)}),env as never);
    const journal=await call('/api/journal',{areaId:goal.area_id,missionId:goal.id,mood:'reflective',body:'The protected block worked because the phone stayed outside the room.'});expect(journal.status).toBe(201);
    const progress=await call('/api/progress',{missionId:goal.id,result:'partial',progress:72,statusAfter:'paused',note:'Paused deliberately after capturing useful evidence.'});expect(progress.status).toBe(201);
    const target=product.missions.find(m=>m.horizon==='today'&&m.id!==goal.id)!;const proposalResponse=await call('/api/proposals',{text:'Send one plain pilot invitation before polishing.',rationale:'Smallest reversible test.',targetMissionId:target.id});expect(proposalResponse.status).toBe(200);const proposal=await proposalResponse.json<{proposalId:string}>();
    const before=await (await worker.fetch(new Request('https://fixture.test/api/context',{headers:{cookie}}),env as never)).json<{actions:unknown[]}>();expect(before.actions).toHaveLength(0);
    const committed=await call('/api/actions/commit',{proposal_id:proposal.proposalId}),commitBody=await committed.json<{missionId:string;visibleIn:string[]}>();expect(committed.status).toBe(200);expect(commitBody.visibleIn).toEqual(['today','missions','morning_brief','audit']);
    expect((await call('/api/actions/commit',{proposal_id:proposal.proposalId})).status).toBe(409);
    const state=await (await worker.fetch(new Request('https://fixture.test/api/product',{headers:{cookie}}),env as never)).json<{journalEntries:{mission_id:string}[];missions:{id:string;horizon:string;status:string}[]}>();expect(state.journalEntries[0]?.mission_id).toBe(goal.id);expect(state.missions.find(m=>m.id===goal.id)?.status).toBe('paused');expect(state.missions.find(m=>m.id===commitBody.missionId)).toMatchObject({horizon:'today',status:'active'});
  });
});
