import { describe,expect,it } from 'vitest';
import { buildEvidenceBundle,buildSyntheticHistory } from '../worker/domain';
import { createAgentGraph,ModelConfigurationError,runCouncillors } from '../worker/model';

describe('model boundary',()=>{
  it('constructs distinct specialists and a manager without a paid call',()=>{const graph=createAgentGraph();expect(graph.specialists).toHaveLength(3);expect(new Set(graph.specialists.map(a=>a.name)).size).toBe(3);expect(graph.chair.name).toContain('Chair')});
  it('fails closed instead of substituting fixtures in openai mode',async()=>{await expect(runCouncillors('openai',buildEvidenceBundle('question',buildSyntheticHistory()))).rejects.toBeInstanceOf(ModelConfigurationError)});
});
