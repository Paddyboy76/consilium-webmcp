import { describe,expect,it } from 'vitest';
import { authorizeCommit, equivalentActionText, selectProposalTarget } from '../worker/proposals';

describe('proposal authorization',()=>{
  const pending={id:'proposal-1',sessionId:'session-a',status:'pending' as const,text:'Send three invitations'};
  it('allows exactly one transition for the owning session',()=>{const first=authorizeCommit(pending,'session-a');expect(first.ok).toBe(true);if(first.ok)expect(authorizeCommit(first.next,'session-a')).toEqual({ok:false,code:'ALREADY_COMMITTED_OR_INVALID'})});
  it('does not reveal or commit another session proposal',()=>expect(authorizeCommit(pending,'session-b')).toEqual({ok:false,code:'SESSION_MISMATCH'}));
  it('fails closed for absent proposals',()=>expect(authorizeCommit(null,'session-a')).toEqual({ok:false,code:'PROPOSAL_NOT_FOUND'}));
});

describe('proposal targeting and duplicate guard',()=>{
  const missions=[
    {id:'physical',title:'Go for a walk',why:'Restore energy',areaCode:'PHY'},
    {id:'social',title:'Call Mum when I have room to be present',why:'Family care through dementia and the house sale',areaCode:'SOC'},
    {id:'vocational',title:'Ask a potential client about the audit',why:'Test the studio offer',areaCode:'VOC'}
  ];
  it('selects the relevant owned goal instead of array position',()=>{expect(selectProposalTarget('Ask my brother to own the solicitor paperwork for Mum’s house sale.',missions)?.id).toBe('social');expect(selectProposalTarget('Send Priya the accessibility audit message.',missions)?.id).toBe('vocational')});
  it('recognizes equivalent family-paperwork actions without conflating Mum contact',()=>{expect(equivalentActionText('Ask my brother to take the solicitor paperwork.','Have a family member own one house-sale paperwork task.')).toBe(true);expect(equivalentActionText('Call Mum when I have room to be present.','Ask my brother to take the solicitor paperwork.')).toBe(false)});
});
