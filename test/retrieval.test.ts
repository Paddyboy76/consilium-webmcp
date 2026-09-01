import { describe,expect,it } from 'vitest';
import { createEmbedding,EmbeddingConfigurationError,retrieveAdvisor,retrievePersonal,type VectorQueryLane } from '../worker/retrieval';

class CapturingIndex implements VectorQueryLane {
  calls:unknown[]=[];
  query(_vector:number[],options:{topK:number;returnMetadata:'all';filter:Record<string,string>}){this.calls.push(options);return Promise.resolve({matches:[]})}
}

describe('retrieval lane isolation',()=>{
  it('filters personal retrieval before nearest-neighbor selection',async()=>{const index=new CapturingIndex();await retrievePersonal(index,[.1],'demo-user');expect(index.calls[0]).toEqual({topK:8,returnMetadata:'all',filter:{corpus_kind:'personal',user_id:'demo-user'}})});
  it('filters advisor retrieval by both advisor and appointed pack version',async()=>{const index=new CapturingIndex();await retrieveAdvisor(index,[.1],'epictetus','pg10661-v1');expect(index.calls[0]).toEqual({topK:6,returnMetadata:'all',filter:{corpus_kind:'advisor',advisor_id:'epictetus',pack_version:'pg10661-v1'}})});
  it('never generates embeddings without explicit application credential',async()=>{await expect(createEmbedding('bounded text')).rejects.toBeInstanceOf(EmbeddingConfigurationError)});
});
