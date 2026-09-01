const encoder=new TextEncoder();
const COOKIE_NAME='consilium_session';
export const SESSION_VERSION='v1';
export const SESSION_TTL_SECONDS=24*60*60;
export type SessionKeys={current:{version:string;secret:string};previous?:{version:string;secret:string}};

const base64url=(bytes:Uint8Array)=>{
  let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
  return btoa(binary).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
};
const sign=async(payload:string,secret:string)=>{
  const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(payload))));
};
const safeEqual=(left:string,right:string)=>{
  if(left.length!==right.length)return false;let different=0;
  for(let index=0;index<left.length;index++)different|=left.charCodeAt(index)^right.charCodeAt(index);
  return different===0;
};
const parseCookies=(header:string|null)=>Object.fromEntries((header??'').split(';').map(part=>part.trim()).filter(Boolean).map(part=>{const split=part.indexOf('=');return split<0?[part,'']:[part.slice(0,split),part.slice(split+1)]}));

export type SessionResolution={sessionId:string;setCookie?:string;issued:boolean};

export async function issueSession(keys:SessionKeys,nowSeconds=Math.floor(Date.now()/1000)):Promise<SessionResolution>{
  if(keys.current.secret.length<32||!/^k[0-9]+$/.test(keys.current.version))throw new Error('SESSION_CONFIGURATION_ERROR');
  const sessionId=crypto.randomUUID(),expires=nowSeconds+SESSION_TTL_SECONDS,payload=`${SESSION_VERSION}.${keys.current.version}.${expires}.${sessionId}`,signature=await sign(payload,keys.current.secret);
  return {sessionId,issued:true,setCookie:`${COOKIE_NAME}=${payload}.${signature}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Strict`};
}

export async function resolveSession(request:Request,keys:SessionKeys,nowSeconds=Math.floor(Date.now()/1000)):Promise<SessionResolution>{
  if(keys.current.secret.length<32)throw new Error('SESSION_CONFIGURATION_ERROR');
  const token=parseCookies(request.headers.get('cookie'))[COOKIE_NAME];
  if(!token)return issueSession(keys,nowSeconds);
  const parts=token.split('.');if(parts.length!==5)return issueSession(keys,nowSeconds);
  const [version,keyVersion,expiresText,sessionId,signature]=parts,expires=Number(expiresText),key=keyVersion===keys.current.version?keys.current:keyVersion===keys.previous?.version?keys.previous:undefined;
  if(version!==SESSION_VERSION||!key||!Number.isInteger(expires)||expires<=nowSeconds||expires>nowSeconds+SESSION_TTL_SECONDS||!sessionId||!signature||!/^[0-9a-f-]{36}$/.test(sessionId))return issueSession(keys,nowSeconds);
  const expected=await sign(`${version}.${keyVersion}.${expires}.${sessionId}`,key.secret);
  if(!safeEqual(signature,expected))return issueSession(keys,nowSeconds);
  return {sessionId,issued:false};
}

export function ownsSession(recordSessionId:string,requestSessionId:string){return recordSessionId===requestSessionId}
