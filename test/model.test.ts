import { describe,expect,it } from 'vitest';
import { buildEvidenceBundle,buildSyntheticHistory } from '../worker/domain';
import { COUNCIL_JSON_SCHEMA,COUNCIL_MODEL,councilPrompt,hydrateStructuredCouncil,runWorkersAiCouncil } from '../worker/model';

const bundle=()=>buildEvidenceBundle('What smallest action should I take?',buildSyntheticHistory());
const validRaw=()=>({reports:Object.entries(bundle().sourceByAdvisor).map(([advisorId,sources])=>({advisorId,reasoning:'History favors one protected action, while the counterexample shows urgency can sometimes overcome overload.',recommendation:`Take one bounded action through the ${advisorId} lens.`,uncertainty:'Synthetic evidence cannot predict today.',confidence:.76,confidenceRationale:'Repeated support exists but the history is short.',disagreement:'This lens differs in its explanation, not the action.',personalEvidenceIds:['evt-64-adapt-success'],advisorEvidenceIds:[sources[0]!.id],counterevidenceIds:['evt-20-counter']})),synthesis:{recommendation:'Send one plain invitation before opening design tools.',resolution:'The council agrees on action but preserves distinct reasons.',uncertainty:'A reply is not guaranteed.'}});

describe('Workers AI structured council boundary',()=>{
  it('uses one economical Cloudflare JSON-schema model call',async()=>{let calls=0;const ai={run:(model:typeof COUNCIL_MODEL,input:Record<string,unknown>)=>{calls++;expect(model).toBe(COUNCIL_MODEL);expect(input.response_format).toEqual({type:'json_schema',json_schema:COUNCIL_JSON_SCHEMA});return Promise.resolve({response:validRaw()})}};const result=await runWorkersAiCouncil(ai,bundle());expect(calls).toBe(1);expect(result.reports).toHaveLength(3)});
  it('delimits canonical records as untrusted and denies mutation authority',()=>{const prompt=JSON.stringify(councilPrompt(bundle()));expect(prompt).toContain('untrusted data');expect(prompt).toContain('Never claim an action was applied');expect(prompt).toContain('evt-64-adapt-success')});
  it('hydrates known IDs into reports and preserves counterevidence',()=>{const result=hydrateStructuredCouncil(validRaw(),bundle());expect(result.reports.every(report=>report.evidence.some(e=>e.lane==='personal')&&report.evidence.some(e=>e.lane==='advisor'))).toBe(true);expect(result.reports.every(report=>report.counterevidenceIds?.includes('evt-20-counter'))).toBe(true)});
  it.each([
    ['personal',(raw:ReturnType<typeof validRaw>)=>raw.reports[0]!.personalEvidenceIds=['invented-event']],
    ['source',(raw:ReturnType<typeof validRaw>)=>raw.reports[0]!.advisorEvidenceIds=['epictetus-ench-01a']],
    ['advisor',(raw:ReturnType<typeof validRaw>)=>raw.reports[0]!.advisorId='invented-advisor']
  ])('fails closed on unknown or cross-owned %s IDs',(_label,mutate)=>{const raw=validRaw();mutate(raw);expect(()=>hydrateStructuredCouncil(raw,bundle())).toThrow(/AI_|invalid/i)});
});
