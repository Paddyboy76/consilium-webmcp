import { describe,expect,it } from 'vitest';
import { issueSession,ownsSession,resolveSession,SESSION_TTL_SECONDS } from '../worker/session';

const TEST_ONLY_SIGNING_SECRET='test-only-session-signing-secret-at-least-32-bytes';
const keys={current:{version:'k1',secret:TEST_ONLY_SIGNING_SECRET}};
const requestWith=(cookie?:string,visibleHeader?:string)=>new Request('https://consilium.test/api/context',{headers:{...(cookie?{cookie}:{}),...(visibleHeader?{'X-Consilium-Session':visibleHeader}:{})}});
const tokenFrom=(setCookie:string)=>setCookie.split(';')[0]!;

describe('server-issued session ownership',()=>{
  it('issues a secure ownership cookie when omitted and ignores a visible forged header',async()=>{const resolved=await resolveSession(requestWith(undefined,'attacker-chosen'),keys,1000);expect(resolved.issued).toBe(true);expect(resolved.sessionId).not.toBe('attacker-chosen');expect(resolved.setCookie).toContain('HttpOnly');expect(resolved.setCookie).toContain('Secure');expect(resolved.setCookie).toContain('SameSite=Strict')});
  it('accepts a valid signed cookie but replaces an altered payload',async()=>{const issued=await issueSession(keys,1000),cookie=tokenFrom(issued.setCookie!);expect((await resolveSession(requestWith(cookie),keys,1001)).sessionId).toBe(issued.sessionId);const altered=cookie.replace(issued.sessionId,'00000000-0000-4000-8000-000000000000');const rejected=await resolveSession(requestWith(altered),keys,1001);expect(rejected.issued).toBe(true);expect(rejected.sessionId).not.toBe('00000000-0000-4000-8000-000000000000')});
  it('rejects expired and unsupported-version cookies',async()=>{const issued=await issueSession(keys,1000),cookie=tokenFrom(issued.setCookie!);expect((await resolveSession(requestWith(cookie),keys,1000+SESSION_TTL_SECONDS+1)).issued).toBe(true);expect((await resolveSession(requestWith(cookie.replace('=v1.','=v0.')),keys,1001)).issued).toBe(true)});
  it('accepts the previous key only during explicit rotation and issues only current-key cookies',async()=>{const oldKeys={current:{version:'k0',secret:'old-test-session-signing-secret-at-least-32-bytes'}},old=await issueSession(oldKeys,1000),rotated={current:{version:'k1',secret:TEST_ONLY_SIGNING_SECRET},previous:oldKeys.current};expect((await resolveSession(requestWith(tokenFrom(old.setCookie!)),rotated,1001)).sessionId).toBe(old.sessionId);expect((await resolveSession(requestWith(tokenFrom(old.setCookie!)),keys,1001)).issued).toBe(true);expect((await issueSession(rotated,1001)).setCookie).toContain('=v1.k1.')});
  it('prevents proposal and trace replay across sessions',async()=>{const first=await issueSession(keys,1000),second=await issueSession(keys,1000);expect(ownsSession(first.sessionId,second.sessionId)).toBe(false);expect(ownsSession(first.sessionId,first.sessionId)).toBe(true)});
});
