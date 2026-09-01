import { describe,expect,it } from 'vitest';
import { buildEvidenceBundle,buildSyntheticHistory } from '../worker/domain';
import { OPERATING_LIMITS,withConsultationTimeout } from '../worker/limits';

describe('bounded consultation operation',()=>{
  it('caps appointed councillors and retrieval/output configuration',()=>{const bundle=buildEvidenceBundle('question',buildSyntheticHistory(),['marcus-aurelius','epictetus','sun-tzu','unapproved-fourth']);expect(Object.keys(bundle.sourceByAdvisor)).toHaveLength(OPERATING_LIMITS.maxCouncillors);expect(OPERATING_LIMITS.personalTopK).toBe(8);expect(OPERATING_LIMITS.advisorTopK).toBe(6);expect(OPERATING_LIMITS.configuredSubrequests).toBeLessThanOrEqual(40)});
  it('propagates client cancellation to a consultation operation',async()=>{const parent=new AbortController();const result=withConsultationTimeout(signal=>new Promise<string>(resolve=>{signal.addEventListener('abort',()=>resolve(String(signal.reason)),{once:true})}),parent.signal);parent.abort();await expect(result).resolves.toBe('CLIENT_CANCELLED')});
});
