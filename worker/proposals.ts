export type ProposalState={id:string;sessionId:string;status:'pending'|'committed'|'cancelled'|'superseded';text:string};
export type CommitDecision={ok:true;next:ProposalState}|{ok:false;code:'PROPOSAL_NOT_FOUND'|'SESSION_MISMATCH'|'ALREADY_COMMITTED_OR_INVALID'};
export type MissionTarget={id:string;title:string;why:string;areaCode:string};

const STOP=new Set(['a','an','and','as','at','before','for','from','i','in','into','my','of','on','one','the','then','this','to','tomorrow','with']);
const words=(value:string)=>new Set(value.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(word=>word.length>1&&!STOP.has(word)).map(word=>word.endsWith('s')&&word.length>4?word.slice(0,-1):word));
const has=(tokens:Set<string>,values:string[])=>values.some(value=>tokens.has(value));
const recipient=(tokens:Set<string>)=>has(tokens,['brother'])||(tokens.has('family')&&tokens.has('member'))?'family-helper':has(tokens,['mum','mother'])?'mum':has(tokens,['client'])?'client':has(tokens,['priya'])?'priya':null;
const operation=(tokens:Set<string>)=>has(tokens,['call','phone','ring'])?'call':has(tokens,['message','send','contact'])?'message':has(tokens,['own','take','handle','delegate'])||tokens.has('ask')&&recipient(tokens)==='family-helper'?'delegate':null;
const familyPaperworkDelegation=(tokens:Set<string>)=>operation(tokens)==='delegate'&&recipient(tokens)==='family-helper'&&(has(tokens,['paperwork','solicitor'])||tokens.has('estate')&&tokens.has('agent'));
export function equivalentActionText(left:string,right:string){const a=words(left),b=words(right);if(!a.size||!b.size)return false;const normalized=(tokens:Set<string>)=>[...tokens].sort().join(' ');if(normalized(a)===normalized(b))return true;const sameRecipient=recipient(a)===recipient(b),sameOperation=operation(a)===operation(b),overlap=[...a].filter(word=>b.has(word)).length,union=new Set([...a,...b]).size;if(sameRecipient&&sameOperation&&(overlap/union>=.72||(Math.min(a.size,b.size)>=4&&overlap/Math.min(a.size,b.size)>=.86)))return true;return familyPaperworkDelegation(a)&&familyPaperworkDelegation(b)}
const AREA_TERMS:Record<string,string[]>={PHY:['walk','sleep','body','energy','exercise','physical','recovery'],MNT:['focus','stress','mental','notification','depression','attention'],SPR:['choice','meaning','value','grief','spiritual','purpose'],SOC:['mum','mother','brother','family','call','relationship','love','care','house'],FIN:['money','bill','sale','solicitor','subscription','financial','cost'],VOC:['work','client','audit','website','email','career','studio']};
export function selectProposalTarget(text:string,missions:MissionTarget[]){const query=words(text);const ranked=missions.map((mission,index)=>{const missionWords=words(`${mission.title} ${mission.why}`),lexical=[...query].filter(word=>missionWords.has(word)).length*4,area=(AREA_TERMS[mission.areaCode]??[]).filter(word=>query.has(word)).length*3;return {mission,score:lexical+area,index}}).sort((a,b)=>b.score-a.score||a.index-b.index);return ranked[0]&&ranked[0].score>0?ranked[0].mission:null}

export function authorizeCommit(proposal:ProposalState|null,requestingSession:string):CommitDecision{
  if(!proposal)return {ok:false,code:'PROPOSAL_NOT_FOUND'};
  if(proposal.sessionId!==requestingSession)return {ok:false,code:'SESSION_MISMATCH'};
  if(proposal.status!=='pending')return {ok:false,code:'ALREADY_COMMITTED_OR_INVALID'};
  return {ok:true,next:{...proposal,status:'committed'}};
}
