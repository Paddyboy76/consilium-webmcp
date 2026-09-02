import { DatabaseSync, type StatementSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { describe,expect,it } from 'vitest';
import worker from '../worker/index';

class SqliteStatement {
  private parameters:unknown[]=[];
  constructor(private readonly statement:StatementSync,readonly reads:boolean){}
  bind(...parameters:unknown[]){this.parameters=parameters;return this}
  run(){const result=this.statement.run(...this.parameters as never[]);return Promise.resolve({success:true,meta:{changes:Number(result.changes)},results:[]})}
  first<T>(){return Promise.resolve(this.statement.get(...this.parameters as never[]) as T|null)}
  all<T>(){return Promise.resolve({success:true,meta:{changes:0},results:this.statement.all(...this.parameters as never[]) as T[]})}
}
class SqliteD1 {
  constructor(private readonly database:DatabaseSync){}
  prepare(sql:string){return new SqliteStatement(this.database.prepare(sql),/^\s*SELECT\b/i.test(sql))}
  async batch(statements:SqliteStatement[]){const results=[];for(const statement of statements)results.push(statement.reads?await statement.all():await statement.run());return results}
}

const files=['0001_initial.sql','0002_hardening.sql','0003_recovery_product.sql','0004_structured_reflection.sql','0005_exact_life_domains.sql'];
const env=(database:DatabaseSync)=>({DB:new SqliteD1(database),APP_MODE:'fixture',MODEL_CONFIG_VERSION:'council-v1',PIPELINE_VERSION:'1f5efdc1c1ef895b221f8dba3ab9c6b64139eb4265eb33a154ba560aa761109f',CONSULTATION_LIMIT_PER_HOUR:'6',SESSION_KEY_VERSION:'k1',SESSION_SIGNING_KEY:'test-only-signing-secret-at-least-32-bytes',ASSETS:{fetch:()=>Promise.resolve(new Response('asset'))}});

describe('Pass 4 exact Consilium life domains',()=>{
  it('seeds all six canonical codes and a persisted mission/progress/reflection chain in each',async()=>{
    const database=new DatabaseSync(':memory:');for(const file of files)database.exec(readFileSync(`migrations/${file}`,'utf8'));
    const response=await worker.fetch(new Request('https://fixture.test/api/product'),env(database) as never),body=await response.json<{areas:{id:string;code:string;name:string;purpose:string}[]}>();
    expect(body.areas.map(area=>[area.code,area.name,area.purpose])).toEqual([
      ['PHY','Physical','Fuel, movement, and recovery for your body.'],['MNT','Mental','Mental resilience, focus, and emotional regulation.'],['SPR','Spiritual','Purpose, values, and inner alignment.'],['SOC','Social','Relationships, community, and social investment.'],['FIN','Financial','Earning, saving, investing, and financial freedom.'],['VOC','Vocational','Career, craft, skills, and professional growth.']
    ]);
    for(const area of body.areas){
      const linked=database.prepare('SELECT COUNT(DISTINCT m.id) missions,COUNT(DISTINCT p.id) progress,COUNT(DISTINCT r.id) reflections FROM missions m LEFT JOIN progress_logs p ON p.mission_id=m.id LEFT JOIN reflections r ON r.mission_id=m.id WHERE m.area_id=?').get(area.id) as {missions:number;progress:number;reflections:number};
      expect(linked,area.code).toEqual({missions:2,progress:1,reflections:1});
    }
  });

  it('upgrades an already-seeded four-area session additively and retains legacy history',async()=>{
    const database=new DatabaseSync(':memory:');for(const file of files.slice(0,4))database.exec(readFileSync(`migrations/${file}`,'utf8'));
    database.exec("INSERT INTO users VALUES('demo-user','Demo','2026-01-01'); INSERT INTO sessions VALUES('legacy','demo-user','2026-01-01','v1'); INSERT INTO life_areas VALUES('legacy-health','legacy','Health','old health','#0f0',1,'2026-01-01'),('legacy-relationships','legacy','Relationships','old social','#f0f',2,'2026-01-01'),('legacy-learning','legacy','Learning','old learning','#0ff',3,'2026-01-01'),('legacy-vocation','legacy','Vocation','old vocation','#f50',0,'2026-01-01'); INSERT INTO missions VALUES('legacy-writing','legacy','legacy-learning','project','Publish field notes','Turn learning into craft','quarterly','active',20,NULL,'2026-01-01'); INSERT INTO progress_logs VALUES('legacy-log','legacy','legacy-writing','progress',20,'Draft retained','2026-01-02'); INSERT INTO reflections VALUES('legacy-reflection','legacy','legacy-writing','A','B','C','D','E','F','G','2026-01-03')");
    database.exec(readFileSync('migrations/0005_exact_life_domains.sql','utf8'));
    const response=await worker.fetch(new Request('https://fixture.test/api/product',{headers:{cookie:'consilium_session=invalid'}}),env(database) as never);
    // Exercise the upgrader directly against the known legacy session after request-level schema proof.
    const {seedProduct}=await import('../worker/product');await seedProduct(new SqliteD1(database) as never,'legacy');
    expect(response.status).toBe(200);
    expect(database.prepare('SELECT code FROM life_areas WHERE session_id=? AND is_active=1 ORDER BY position').all('legacy').map(row=>row.code)).toEqual(['PHY','MNT','SPR','SOC','FIN','VOC']);
    expect(database.prepare("SELECT area_id FROM missions WHERE id='legacy-writing'").get()?.area_id).toBe('legacy-vocation');
    expect(database.prepare("SELECT COUNT(*) count FROM progress_logs WHERE id='legacy-log'").get()?.count).toBe(1);
    expect(database.prepare("SELECT COUNT(*) count FROM reflections WHERE id='legacy-reflection'").get()?.count).toBe(1);
    const archived=database.prepare("SELECT is_active,migration_json FROM life_areas WHERE id='legacy-learning'").get() as {is_active:number;migration_json:string};
    expect(archived.is_active).toBe(0);expect(archived.migration_json).toContain('records retained');
  });
});
