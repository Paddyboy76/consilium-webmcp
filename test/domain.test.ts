import { describe,expect,it } from 'vitest';
import { buildEvidenceBundle,buildSyntheticHistory,fixtureReports,inferPatterns,SOURCE_CHUNKS,synthesize,validateReport } from '../worker/domain';

const question='I have 45 minutes before work. What should I actually focus on today, and why?';

describe('longitudinal intelligence',()=>{
  it('derives supported, contradicted, and temporally changing patterns from over 60 days',()=>{
    const history=buildSyntheticHistory(),patterns=inferPatterns(history);
    expect((Date.parse(history.at(-1)!.occurredAt)-Date.parse(history[0]!.occurredAt))/86400000).toBeGreaterThanOrEqual(60);
    const overload=patterns.find(p=>p.id==='pat-overload-v1')!;
    expect(overload.supportingIds.length).toBeGreaterThan(3);expect(overload.contradictoryIds.length).toBeGreaterThan(1);expect(overload.confidence).toBeLessThan(1);
    const falsePattern=patterns.find(p=>p.id==='pat-morning-always-v1')!;
    expect(falsePattern.status).toBe('rejected');expect(falsePattern.contradictoryIds.length).toBeGreaterThan(0);
    const adaptation=patterns.find(p=>p.id==='pat-adaptation-v1')!;
    expect(adaptation.status).toBe('active');expect(Date.parse(adaptation.windowStart)).toBeGreaterThan(Date.parse(history[0]!.occurredAt));
  });

  it('preserves recommendation response and success/failure outcome history',()=>{
    const history=buildSyntheticHistory();
    expect(history.some(e=>e.tags.includes('rejected'))).toBe(true);
    expect(history.some(e=>e.tags.includes('recommendation-outcome')&&e.valence==='negative')).toBe(true);
    expect(history.some(e=>e.tags.includes('recommendation-outcome')&&e.valence==='positive')).toBe(true);
  });

  it('changes advice when only causal history changes',()=>{
    const normal=synthesize(buildEvidenceBundle(question,buildSyntheticHistory()),fixtureReports(buildEvidenceBundle(question,buildSyntheticHistory())));
    const changedBundle=buildEvidenceBundle(question,buildSyntheticHistory('adaptation-removed'));
    const changed=synthesize(changedBundle,fixtureReports(changedBundle));
    expect(changed.recommendation).not.toBe(normal.recommendation);
    expect(changed.recommendation).toContain('rebuild');
  });

  it('does not change advice for irrelevant memory',()=>{
    const baseline=buildEvidenceBundle(question,buildSyntheticHistory());const irrelevant=buildEvidenceBundle(question,buildSyntheticHistory('irrelevant-added'));
    expect(synthesize(irrelevant,fixtureReports(irrelevant)).recommendation).toBe(synthesize(baseline,fixtureReports(baseline)).recommendation);
  });
});

describe('dual-grounding and source fidelity',()=>{
  it('requires both evidence lanes for every personalized claim',()=>{
    const bundle=buildEvidenceBundle(question,buildSyntheticHistory());const reports=fixtureReports(bundle);
    for(const report of reports){expect(validateReport(report,bundle)).toEqual({valid:true,errors:[]});for(const claim of report.claims){expect(claim.personalEvidenceIds.length).toBeGreaterThan(0);expect(claim.advisorEvidenceIds.length).toBeGreaterThan(0)}}
  });

  it('fails closed on invented personal citations and cross-advisor contamination',()=>{
    const bundle=buildEvidenceBundle(question,buildSyntheticHistory());const report=structuredClone(fixtureReports(bundle)[0]!);
    report.claims[0]!.personalEvidenceIds=['invented'];report.claims[0]!.advisorEvidenceIds=['epictetus-ench-01a'];
    const validation=validateReport(report,bundle);expect(validation.valid).toBe(false);expect(validation.errors).toContain('UNKNOWN_PERSONAL_EVIDENCE');expect(validation.errors).toContain('CROSS_ADVISOR_OR_UNKNOWN_SOURCE');
    expect(synthesize(bundle,[report]).abstained).toBe(true);
  });

  it('renders canonical excerpts and locators from the owned source lane',()=>{
    const bundle=buildEvidenceBundle(question,buildSyntheticHistory());
    for(const report of fixtureReports(bundle)) for(const claim of report.claims) for(const id of claim.advisorEvidenceIds){
      const canonical=SOURCE_CHUNKS.find(c=>c.id===id);expect(canonical).toBeDefined();expect(canonical!.advisorId).toBe(report.advisorId);expect(canonical!.locator.length).toBeGreaterThan(4);expect(canonical!.text.length).toBeGreaterThan(20);
    }
  });

  it('holds forbidden doctrine drift boundaries',()=>{
    const reports=fixtureReports(buildEvidenceBundle(question,buildSyntheticHistory()));
    const prose=reports.map(r=>r.recommendation).join(' ').toLowerCase();
    for(const forbidden of ['therapy','guarantee','manipulate','suppress emotion']) expect(prose).not.toContain(forbidden);
  });
});
