import { readFileSync } from 'node:fs';
import { DatabaseSync, type StatementSync } from 'node:sqlite';
import { describe,expect,it } from 'vitest';
import worker from '../worker/index';

class SqliteStatement {
  private parameters:string[]=[];
  constructor(private readonly statement:StatementSync){}
  bind(...parameters:unknown[]){this.parameters=parameters.map(String);return this}
  run(){const result=this.statement.run(...this.parameters);return Promise.resolve({success:true,meta:{changes:Number(result.changes)},results:[]})}
  first<T>(){return Promise.resolve(this.statement.get(...this.parameters) as T|null)}
  all<T>(){return Promise.resolve({success:true,meta:{changes:0},results:this.statement.all(...this.parameters) as T[]})}
}

class SqliteD1 {
  constructor(private readonly database:DatabaseSync){}
  prepare(sql:string){return new SqliteStatement(this.database.prepare(sql))}
  async batch(statements:SqliteStatement[]){const results=[];for(const statement of statements)results.push(await statement.run());return results}
}

describe('first-request D1 seed',()=>{
  it('seeds a fresh migrated database and returns context',async()=>{
    const database=new DatabaseSync(':memory:');
    database.exec(readFileSync('migrations/0001_initial.sql','utf8'));database.exec(readFileSync('migrations/0002_hardening.sql','utf8'));
    const response=await worker.fetch(new Request('https://fixture.test/api/context'),{DB:new SqliteD1(database),APP_MODE:'fixture',MODEL_CONFIG_VERSION:'council-v1',PIPELINE_VERSION:'1f5efdc1c1ef895b221f8dba3ab9c6b64139eb4265eb33a154ba560aa761109f',CONSULTATION_LIMIT_PER_HOUR:'6',SESSION_KEY_VERSION:'k1',SESSION_SIGNING_KEY:'test-only-signing-secret-at-least-32-bytes',ASSETS:{fetch:()=>Promise.resolve(new Response('asset'))}} as never);
    const body=await response.json<{historySummary?:{days:number};error?:string}>();
    expect({status:response.status,error:body.error,days:body.historySummary?.days}).toEqual({status:200,error:undefined,days:67});
    expect({events:database.prepare('SELECT COUNT(*) count FROM events').get()?.count,patterns:database.prepare('SELECT COUNT(*) count FROM patterns').get()?.count,chunks:database.prepare('SELECT COUNT(*) count FROM source_chunks').get()?.count,appointments:database.prepare('SELECT COUNT(*) count FROM council_appointments').get()?.count}).toEqual({events:96,patterns:3,chunks:6,appointments:3});
  });
});
