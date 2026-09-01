import { describe,expect,it } from 'vitest';
import { DeterministicFixtureEmbedder,EMBEDDING_DIMENSIONS,EMBEDDING_MODEL,retrieveAdvisor,retrievePersonal,WorkersAiEmbedder,type VectorQueryLane } from '../worker/retrieval';

class CapturingIndex implements VectorQueryLane {
  calls:unknown[]=[];
  query(_vector:number[],options:{topK:number;returnMetadata:'all';filter:Record<string,string>}){this.calls.push(options);return Promise.resolve({matches:[]})}
}

describe('retrieval lane isolation',()=>{
  it('filters personal retrieval before nearest-neighbor selection',async()=>{const index=new CapturingIndex();await retrievePersonal(index,[.1],'demo-user');expect(index.calls[0]).toEqual({topK:8,returnMetadata:'all',filter:{corpus_kind:'personal',user_id:'demo-user',pipeline_version:'bge768-v2'}})});
  it('filters advisor retrieval by both advisor and appointed pack version',async()=>{const index=new CapturingIndex();await retrieveAdvisor(index,[.1],'epictetus','pg10661-v1');expect(index.calls[0]).toEqual({topK:6,returnMetadata:'all',filter:{corpus_kind:'advisor',advisor_id:'epictetus',pack_version:'pg10661-v1',pipeline_version:'bge768-v2'}})});
  it('uses Workers AI 768-dimensional production embeddings',async()=>{let called='';const embedder=new WorkersAiEmbedder({run:(model)=>{called=model;return Promise.resolve({data:[Array(768).fill(.1)]})}});expect((await embedder.embed('bounded text')).length).toBe(EMBEDDING_DIMENSIONS);expect(called).toBe(EMBEDDING_MODEL);expect(embedder.kind).toBe('workers-ai-production')});
  it('labels deterministic vectors as test fixtures',async()=>{const fixture=new DeterministicFixtureEmbedder();expect(fixture.kind).toBe('deterministic-test-fixture');expect((await fixture.embed('test')).length).toBe(768)});
});
