import { readFileSync } from 'node:fs';
import { DatabaseSync, type StatementSync } from 'node:sqlite';
import { describe,expect,it } from 'vitest';
import worker from '../worker/index';
import { CAAR_FACT_TYPES, CANONICAL_CAAR, seedProduct } from '../worker/product';

class Statement {
  private values:unknown[]=[];
  constructor(private inner:StatementSync,readonly reads:boolean){}
  bind(...values:unknown[]){this.values=values;return this}
  run(){const value=this.inner.run(...this.values as never[]);return Promise.resolve({success:true,meta:{changes:Number(value.changes)},results:[]})}
  first<T>(){return Promise.resolve(this.inner.get(...this.values as never[]) as T|null)}
  all<T>(){return Promise.resolve({success:true,meta:{changes:0},results:this.inner.all(...this.values as never[]) as T[]})}
}
class D1 {
  constructor(private db:DatabaseSync){}
  prepare(sql:string){return new Statement(this.db.prepare(sql),/^\s*SELECT\b/i.test(sql))}
  async batch(items:Statement[]){const results=[];for(const item of items)results.push(item.reads?await item.all():await item.run());return results}
}
const migrated=()=>{const db=new DatabaseSync(':memory:');for(const file of ['0001_initial.sql','0002_hardening.sql','0003_recovery_product.sql','0004_structured_reflection.sql','0005_exact_life_domains.sql','0006_pass5_journal_commit.sql'])db.exec(readFileSync(`migrations/${file}`,'utf8'));return db};
const environment=(db:DatabaseSync)=>({DB:new D1(db),APP_MODE:'fixture',MODEL_CONFIG_VERSION:'council-v1',PIPELINE_VERSION:'1f5efdc1c1ef895b221f8dba3ab9c6b64139eb4265eb33a154ba560aa761109f',CONSULTATION_LIMIT_PER_HOUR:'6',SESSION_KEY_VERSION:'k1',SESSION_SIGNING_KEY:'test-only-signing-secret-at-least-32-bytes',ASSETS:{fetch:()=>Promise.resolve(new Response('asset'))}});

describe('Pass 7 natural demo content',()=>{
  it('serves natural seeded goals, updates, journal, history, and named council context',async()=>{
    const db=migrated(),env=environment(db),productResponse=await worker.fetch(new Request('https://fixture.test/api/product'),env as never),cookie=productResponse.headers.get('set-cookie')!.split(';')[0]!,product=await productResponse.json(),context=await (await worker.fetch(new Request('https://fixture.test/api/context',{headers:{cookie}}),env as never)).json(),council=await (await worker.fetch(new Request('https://fixture.test/api/council',{headers:{cookie}}),env as never)).json();
    const visible=JSON.stringify({product,context,council});
    for(const rejected of ['Review recurring costs for one useful cut','Write the value behind today’s hardest choice','Send one evidence-led pilot invitation'])expect(visible).not.toContain(rejected);
    for(const natural of ['Cancel one subscription I don’t use','Write down why this difficult choice matters to me','Ask one potential client if they’d try my accessibility audit','I kept finding tidy little jobs','What Consilium noticed','Marcus Aurelius','Epictetus','Sun Tzu'])expect(visible).toContain(natural);
  });

  it('reconciles exact canonical seed text without overwriting a user edit',async()=>{
    const db=migrated(),d1=new D1(db);db.exec("INSERT INTO users VALUES('demo-user','Maya Chen','2026-01-01'); INSERT INTO sessions VALUES('legacy','demo-user','2026-01-01','v2')");
    await seedProduct(d1 as never,'legacy');
    db.prepare("UPDATE missions SET title='My own changed title' WHERE id='legacy-physical-goal'").run();
    db.prepare("UPDATE missions SET title='Review recurring costs for one useful cut',why_text='One evidence-based adjustment is more useful than a vague austerity target.' WHERE id='legacy-financial-goal'").run();
    await seedProduct(d1 as never,'legacy');
    expect(db.prepare("SELECT title FROM missions WHERE id='legacy-physical-goal'").get()?.title).toBe('My own changed title');
    expect(db.prepare("SELECT title FROM missions WHERE id='legacy-financial-goal'").get()?.title).toBe('Cancel one subscription I don’t use');
  });

  it('reconciles only the known mislabelled reflection and preserves authored reflection text',async()=>{
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    const db=migrated(),d1=new D1(db);db.exec("INSERT INTO users VALUES('demo-user','Maya Chen','2026-01-01'); INSERT INTO sessions VALUES('legacy','demo-user','2026-01-01','v2')");await seedProduct(d1 as never,'legacy');const canonical=JSON.parse(String(db.prepare("SELECT caar_json FROM nightly_reflections WHERE id='legacy-maya-nightly'").get()?.caar_json));expect(canonical).toEqual(CANONICAL_CAAR);expect((db.prepare("SELECT fact_type,fact_text,source_key FROM reflection_facts WHERE reflection_id='legacy-maya-nightly' ORDER BY source_key").all() as {fact_type:string;fact_text:string;source_key:string}[]).map(row=>row.fact_type)).toEqual([...CAAR_FACT_TYPES]);db.prepare("UPDATE nightly_reflections SET caar_json='{"+`"q1_today_intent":"My authored reflection stays"`+"}' WHERE id='legacy-maya-nightly'").run();await seedProduct(d1 as never,'legacy');expect(db.prepare("SELECT caar_json FROM nightly_reflections WHERE id='legacy-maya-nightly'").get()?.caar_json).toContain('My authored reflection stays');
  });

  it('explains dashboard counts and council members instead of showing unexplained metrics',()=>{
    const script=readFileSync('web/app.js','utf8');
    for(const phrase of ['six goals for today and six longer-term projects','6 RECENT UPDATES','YOUR COUNCIL FOR THIS DEMO','Marcus Aurelius','Epictetus','Sun Tzu'])expect(script).toContain(phrase);
    for(const phrase of ['ACTIVE MISSIONS','PROGRESS SIGNALS','APPOINTED ADVISORS'])expect(script).not.toContain(phrase);
  });
});
