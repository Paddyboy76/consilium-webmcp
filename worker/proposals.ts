export type ProposalState={id:string;sessionId:string;status:'pending'|'committed'|'cancelled'|'superseded';text:string};
export type CommitDecision={ok:true;next:ProposalState}|{ok:false;code:'PROPOSAL_NOT_FOUND'|'SESSION_MISMATCH'|'ALREADY_COMMITTED_OR_INVALID'};

export function authorizeCommit(proposal:ProposalState|null,requestingSession:string):CommitDecision{
  if(!proposal)return {ok:false,code:'PROPOSAL_NOT_FOUND'};
  if(proposal.sessionId!==requestingSession)return {ok:false,code:'SESSION_MISMATCH'};
  if(proposal.status!=='pending')return {ok:false,code:'ALREADY_COMMITTED_OR_INVALID'};
  return {ok:true,next:{...proposal,status:'committed'}};
}
