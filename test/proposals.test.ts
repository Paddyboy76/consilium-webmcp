import { describe,expect,it } from 'vitest';
import { authorizeCommit } from '../worker/proposals';

describe('proposal authorization',()=>{
  const pending={id:'proposal-1',sessionId:'session-a',status:'pending' as const,text:'Send three invitations'};
  it('allows exactly one transition for the owning session',()=>{const first=authorizeCommit(pending,'session-a');expect(first.ok).toBe(true);if(first.ok)expect(authorizeCommit(first.next,'session-a')).toEqual({ok:false,code:'ALREADY_COMMITTED_OR_INVALID'})});
  it('does not reveal or commit another session proposal',()=>expect(authorizeCommit(pending,'session-b')).toEqual({ok:false,code:'SESSION_MISMATCH'}));
  it('fails closed for absent proposals',()=>expect(authorizeCommit(null,'session-a')).toEqual({ok:false,code:'PROPOSAL_NOT_FOUND'}));
});
