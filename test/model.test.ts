import { describe,expect,it } from 'vitest';
import { buildEvidenceBundle,buildSyntheticHistory } from '../worker/domain';
import { COUNCIL_ADVISORS,COUNCIL_JSON_SCHEMA,COUNCIL_MODEL,councilPrompt,hydrateStructuredCouncil,runWorkersAiCouncil } from '../worker/model';

const bundle=()=>buildEvidenceBundle('What smallest action should I take?',buildSyntheticHistory());
const interpretation=(advisor:string)=>({reasoning:`${advisor} weighs the favorable protected-work evidence against the genuine urgency counterexample before choosing a bounded action.`,recommendation:`Take one bounded action through the ${advisor} lens before doing more preparation.`,uncertainty:'The supplied personal history cannot predict whether another person will reply.',confidence:.76,confidenceRationale:'Repeated support exists, but the bounded history also contains counterevidence.',disagreement:`The ${advisor} explanation remains distinct from the other advisors even where the action overlaps.`});
const validRaw=()=>({reports:{'marcus-aurelius':interpretation('duty'),'epictetus':interpretation('agency'),'sun-tzu':interpretation('conditions')},synthesis:{recommendation:'Send one plain invitation before opening design tools.',resolution:'The council agrees on action while preserving three distinct explanations.',uncertainty:'A reply is not guaranteed by the supplied evidence.'}});

describe('Workers AI structured council boundary',()=>{
  it('uses one economical Cloudflare JSON-schema model call with the native schema shape',async()=>{let calls=0;const ai={run:(model:typeof COUNCIL_MODEL,input:Record<string,unknown>)=>{calls++;expect(model).toBe(COUNCIL_MODEL);expect(input.response_format).toEqual({type:'json_schema',json_schema:COUNCIL_JSON_SCHEMA});expect(COUNCIL_JSON_SCHEMA.properties.reports.required).toEqual(COUNCIL_ADVISORS);return Promise.resolve({response:validRaw()})}};const result=await runWorkersAiCouncil(ai,bundle());expect(calls).toBe(1);expect(result.reports).toHaveLength(3)});
  it('sends exact selected passages and events as untrusted data without exposing identifiers to generation',()=>{const prompt=JSON.stringify(councilPrompt(bundle()));expect(prompt).toContain('untrusted data');expect(prompt).toContain('Never emit evidence IDs');expect(prompt).toContain('finished the one client-outreach task I had chosen');expect(prompt).toContain('circumscribe the present time');expect(prompt).not.toContain('evt-64-adapt-success');expect(prompt).not.toContain('marcus-b4-03')});
  it('hydrates three distinct reports with retrieval-owned canonical support, counterevidence, and advisor sources',()=>{const selected=bundle(),result=hydrateStructuredCouncil(validRaw(),selected),personal=new Set(selected.history.map(item=>item.id));expect(new Set(result.reports.map(report=>report.recommendation)).size).toBe(3);for(const report of result.reports){const own=new Set(selected.sourceByAdvisor[report.advisorId]!.map(item=>item.id));expect(report.claims[0]!.personalEvidenceIds.every(id=>personal.has(id))).toBe(true);expect(report.counterevidenceIds?.every(id=>personal.has(id))).toBe(true);expect(report.claims[0]!.advisorEvidenceIds.every(id=>own.has(id))).toBe(true);expect(report.evidence.every(item=>item.relevance.startsWith('Retrieval-owned'))).toBe(true)}});
  it.each([
    ['invented personal ID',(raw:Record<string,unknown>)=>{(raw.reports as Record<string,Record<string,unknown>>)['marcus-aurelius']!.personalEvidenceIds=['invented-event']}],
    ['cross-advisor source ID',(raw:Record<string,unknown>)=>{(raw.reports as Record<string,Record<string,unknown>>).epictetus!.advisorEvidenceIds=['marcus-b4-03']}],
    ['unknown source ID',(raw:Record<string,unknown>)=>{(raw.reports as Record<string,Record<string,unknown>>)['sun-tzu']!.advisorEvidenceIds=['invented-source']}],
    ['unknown advisor',(raw:Record<string,unknown>)=>{(raw.reports as Record<string,unknown>).plato=interpretation('plato')}]
  ])('makes %s structurally impossible',(_label,mutate)=>{const raw=validRaw() as unknown as Record<string,unknown>;mutate(raw);expect(()=>hydrateStructuredCouncil(raw,bundle())).toThrow()});
  it.each([
    ['missing advisor',(raw:Record<string,unknown>)=>{delete (raw.reports as Record<string,unknown>).epictetus}],
    ['wrong advisor',(raw:Record<string,unknown>)=>{const reports=raw.reports as Record<string,unknown>;reports.plato=reports.epictetus;delete reports.epictetus}],
    ['duplicate-shaped advisor payload',(raw:Record<string,unknown>)=>{const reports=raw.reports as Record<string,unknown>;reports['epictetus-copy']=reports.epictetus}]
  ])('rejects a %s set',(_label,mutate)=>{const raw=validRaw() as unknown as Record<string,unknown>;mutate(raw);expect(()=>hydrateStructuredCouncil(raw,bundle())).toThrow()});
  it('rejects an appointed bundle with the wrong advisor set',()=>{const selected=bundle();delete selected.sourceByAdvisor.epictetus;expect(()=>hydrateStructuredCouncil(validRaw(),selected)).toThrow('AI_ADVISOR_SET_INVALID')});
});
