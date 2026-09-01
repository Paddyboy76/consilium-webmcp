import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { describe,expect,it } from 'vitest';

const migrate=()=>{const db=new DatabaseSync(':memory:');db.exec(readFileSync('migrations/0001_initial.sql','utf8'));db.exec(readFileSync('migrations/0002_hardening.sql','utf8'));db.exec("INSERT INTO users VALUES('demo-user','Maya','2026-09-01'); INSERT INTO sessions VALUES('session-a','demo-user','2026-09-01','v2'); INSERT INTO sessions VALUES('session-b','demo-user','2026-09-01','v2'); INSERT INTO proposals VALUES('proposal-00000000-0000-4000-8000-000000000000','session-a',NULL,'Send invitations','because','pending','2026-09-01',NULL)");return db};

const commit=(db:DatabaseSync,session:string,actionId:string,auditId:string)=>{
  db.exec('BEGIN IMMEDIATE');try{
    const updated=db.prepare("UPDATE proposals SET status='committed',committed_at='2026-09-01T10:00:00Z' WHERE id=? AND session_id=? AND status='pending'").run('proposal-00000000-0000-4000-8000-000000000000',session).changes;
    db.prepare("INSERT INTO actions(id,user_id,proposal_id,text,status,created_at) SELECT ?,'demo-user',id,text,'committed','2026-09-01T10:00:00Z' FROM proposals WHERE id=? AND session_id=? AND status='committed' ON CONFLICT(proposal_id) DO NOTHING").run(actionId,'proposal-00000000-0000-4000-8000-000000000000',session);
    db.prepare("INSERT INTO audit_events(id,session_id,event_type,subject_id,safe_detail_json,commit_proposal_id,created_at) SELECT ?,?,'action_committed',?,'{}',id,'2026-09-01T10:00:00Z' FROM proposals WHERE id=? AND session_id=? AND status='committed' ON CONFLICT(commit_proposal_id) DO NOTHING").run(auditId,session,actionId,'proposal-00000000-0000-4000-8000-000000000000',session);
    db.exec('COMMIT');return updated===1;
  }catch(error){db.exec('ROLLBACK');throw error}
};

describe('database-enforced atomic commit',()=>{
  it('leaves exactly one action and one commit audit under racing requests',async()=>{const db=migrate();const results=await Promise.all([Promise.resolve().then(()=>commit(db,'session-a','action-1','audit-1')),Promise.resolve().then(()=>commit(db,'session-a','action-2','audit-2'))]);expect(results.filter(Boolean)).toHaveLength(1);expect(db.prepare('SELECT COUNT(*) AS n FROM actions').get()).toEqual({n:1});expect(db.prepare("SELECT COUNT(*) AS n FROM audit_events WHERE event_type='action_committed'").get()).toEqual({n:1})});
  it('cannot commit another session proposal',()=>{const db=migrate();expect(commit(db,'session-b','action-x','audit-x')).toBe(false);expect(db.prepare('SELECT COUNT(*) AS n FROM actions').get()).toEqual({n:0});expect(db.prepare('SELECT COUNT(*) AS n FROM audit_events').get()).toEqual({n:0})});
});
