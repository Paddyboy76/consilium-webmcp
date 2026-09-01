import { Agent } from '@openai/agents';
import { z } from 'zod';
import { AdvisorReportSchema } from './types';
import type { AdvisorReport, EvidenceBundle } from './types';
import { fixtureReports } from './domain';

export type ModelMode='fixture'|'openai';

export function createAgentGraph(){
  const specialists=['marcus-aurelius','epictetus','sun-tzu'].map(advisorId=>new Agent({
    name:`Councillor: ${advisorId}`,
    model:'gpt-5.6-terra',
    instructions:`You are the ${advisorId} councillor. Use only supplied canonical passages from your appointed source pack and supplied personal evidence. Every substantive claim needs IDs from both lanes. Abstain on insufficient evidence.`,
    outputType:AdvisorReportSchema
  }));
  const chair=new Agent({
    name:'Consilium Council Chair',model:'gpt-5.6-sol',
    instructions:'Invoke only appointed councillors. Synthesize only reports already marked valid by the application. Preserve disagreement and uncertainty.',
    tools:specialists.map(agent=>agent.asTool({toolName:`consult_${agent.name.split(': ')[1]}`,toolDescription:'Obtain a distinct evidence-bounded councillor report.'})),
    outputType:z.object({recommendation:z.string(),uncertainty:z.string(),advisorIds:z.array(z.string())})
  });
  return {chair,specialists};
}

export class ModelConfigurationError extends Error { override name='ModelConfigurationError'; }

export function runCouncillors(mode:ModelMode,bundle:EvidenceBundle,apiKey?:string):Promise<AdvisorReport[]> {
  if(mode==='fixture') return Promise.resolve(fixtureReports(bundle));
  if(!apiKey) return Promise.reject(new ModelConfigurationError('OPENAI_API_KEY is required in openai mode; fixture output is never substituted.'));
  // Construction is compatibility-tested without a paid call. Live execution remains
  // deliberately blocked until an authorized Worker secret and T3 test are available.
  createAgentGraph();
  return Promise.reject(new ModelConfigurationError('Live OpenAI execution is not authorized for this build.'));
}
