import {describe,expect,it} from 'vitest';
import {buildEvidenceBundle,buildSyntheticHistory,fixtureReports,synthesize} from '../worker/domain';
import {selectPersonalEvidence} from '../worker/model';
import {validateReflection} from '../worker/reflection';

const laneIds=(question:string)=>{const bundle=buildEvidenceBundle(question,buildSyntheticHistory());return Object.fromEntries(['marcus-aurelius','epictetus','sun-tzu'].map(advisor=>[advisor,selectPersonalEvidence(bundle,advisor as 'marcus-aurelius'|'epictetus'|'sun-tzu').map(item=>item.id)]))};

describe('Pass 10 adversarial release invariants',()=>{
  it('uses exact, question-sensitive, advisor-owned personal lanes',()=>{
    const family=laneIds('Mum dementia house sale depression workload'),vocational=laneIds('Priya website message client workload');
    expect(family).toEqual({
      'marcus-aurelius':['evt-38-mum-missed','evt-21-house-finance','evt-07-mum-call','evt-18-house'],
      epictetus:['evt-38-mum-missed','evt-07-mum-call','evt-18-house','evt-20-depression','evt-24-urgent-counter'],
      'sun-tzu':['evt-20-depression','evt-24-urgent-counter']
    });
    expect(new Set(Object.values(family).map(ids=>ids.join('|'))).size).toBe(3);
    expect(Object.values(family).flat().some(id=>id.includes('priya')||id.includes('pilot'))).toBe(false);
    expect(vocational).toEqual({
      'marcus-aurelius':['evt-45-priya-draft','evt-58-focus','evt-52-meaning'],
      epictetus:['evt-45-priya-draft','evt-17-fail','evt-24-urgent-counter'],
      'sun-tzu':['evt-45-priya-draft','evt-58-focus','evt-17-fail','evt-64-adapt-success','evt-58-adapt-success','evt-24-urgent-counter']
    });
  });

  it('integrates three valid reports without selecting or concatenating one',()=>{
    const bundle=buildEvidenceBundle('Priya website message client workload',buildSyntheticHistory()),reports=fixtureReports(bundle),decision=synthesize(bundle,reports);
    expect(reports).toHaveLength(3);expect(decision.validatedReports).toHaveLength(3);
    for(const report of reports)expect(decision.recommendation).not.toBe(report.recommendation);
    expect(decision.recommendation).toMatch(/honest action|agency|conditions|protected block/i);
    expect(decision.disagreements).toMatch(/duty|agency|conditions/i);
    expect(decision.uncertainty).toMatch(/not certainty|cannot predict/i);
    expect(decision.recommendation).not.toContain(reports.map(report=>report.recommendation).join(' '));
  });

  it('accepts culturally neutral concise paraphrases without keyword policing',()=>{
    const result=validateReflection({journal:'Quiet work occupied the day, alongside a conversation I postponed and want to revisit carefully.',biometrics:{sleep_hours:7,energy_level:5,stress_level:6},caar:{q1_today_intent:'A call with my brother was the aim; paperwork took the available space.',q2_top_win:'The solicitor received a clear answer after a tense morning.',q3_top_failure:'Mum’s call remained unanswered as my energy narrowed.',q4_pattern_notice:'Family paperwork tends to crowd out contact; a calm hour has made space on other days.',q5_tomorrow_priority:'A gentle ten-minute call with Mum before opening the folder.',q6_if_then_plan:'At the sight of the folder, I pause and dial Mum before reading it.'},goal_reflections:[{goal_id:'goal',status:'missed',why_failed:'My available energy narrowed after the solicitor conversation.',adaptation:'Move the folder aside and make space for a short gentle call.'}]});
    expect(result.ok).toBe(true);
  });
});
