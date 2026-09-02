export const EMBEDDING_MODEL='@cf/baai/bge-base-en-v1.5';
export const EMBEDDING_DIMENSIONS=768;
export const EMBEDDING_REQUEST_BATCH_SIZE=100;
// Production ingestion is intentionally bounded even though each Workers AI request is chunked.
export const MAX_EMBEDDING_BATCH_SIZE=1000;
export const MAX_FILTER_BYTES=1800;
export const VECTOR_PIPELINE_VERSION='bge768-v2';

export type VectorMatch={id:string;score?:number;metadata?:Record<string,unknown>};
export type VectorQueryResult={matches:VectorMatch[]};
export interface VectorQueryLane { query(vector:number[],options:{topK:number;returnMetadata:'all';filter:Record<string,string>}):Promise<VectorQueryResult> }
export interface Embedder { readonly kind:'workers-ai-production'|'deterministic-test-fixture'; readonly dimensions:number; embed(text:string):Promise<number[]> }
export interface WorkersAiBinding { run(model:typeof EMBEDDING_MODEL,input:{text:string[]}):Promise<unknown> }

const assertFilterSize=(filter:Record<string,string>)=>{const bytes=new TextEncoder().encode(JSON.stringify(filter)).byteLength;if(bytes>MAX_FILTER_BYTES)throw new Error('VECTOR_FILTER_TOO_LARGE');return filter};
export async function retrievePersonal(index:VectorQueryLane,vector:number[],userId:string,topK=8){
  return index.query(vector,{topK,returnMetadata:'all',filter:assertFilterSize({corpus_kind:'personal',user_id:userId,pipeline_version:VECTOR_PIPELINE_VERSION})});
}
export async function retrieveAdvisor(index:VectorQueryLane,vector:number[],advisorId:string,packVersion:string,topK=6){
  return index.query(vector,{topK,returnMetadata:'all',filter:assertFilterSize({corpus_kind:'advisor',advisor_id:advisorId,pack_version:packVersion,pipeline_version:VECTOR_PIPELINE_VERSION})});
}

const embeddingFrom=(value:unknown)=>{
  if(!value||typeof value!=='object'||!('data' in value)||!Array.isArray(value.data)||!Array.isArray(value.data[0])||!value.data[0].every((item:unknown)=>typeof item==='number'))throw new Error('INVALID_EMBEDDING_RESPONSE');
  const vector=value.data[0];if(vector.length!==EMBEDDING_DIMENSIONS)throw new Error('INVALID_EMBEDDING_DIMENSIONS');return vector;
};
const embeddingsFrom=(value:unknown,expectedRows:number)=>{
  if(!value||typeof value!=='object'||!('data' in value)||!Array.isArray(value.data)||value.data.length!==expectedRows||!value.data.every(row=>Array.isArray(row)&&row.length===EMBEDDING_DIMENSIONS&&row.every((item:unknown)=>typeof item==='number')))throw new Error('INVALID_EMBEDDING_RESPONSE');
  return value.data as number[][];
};

export class WorkersAiEmbedder implements Embedder {
  readonly kind='workers-ai-production' as const;readonly dimensions=EMBEDDING_DIMENSIONS;
  constructor(private readonly ai:WorkersAiBinding){}
  async embed(text:string){if(!text||text.length>4000)throw new Error('INVALID_EMBEDDING_INPUT');return embeddingFrom(await this.ai.run(EMBEDDING_MODEL,{text:[text]}))}
  async embedMany(texts:string[]){
    if(!texts.length||texts.length>MAX_EMBEDDING_BATCH_SIZE||texts.some(text=>!text||text.length>4000))throw new Error('INVALID_EMBEDDING_BATCH');
    const vectors:number[][]=[];
    for(let start=0;start<texts.length;start+=EMBEDDING_REQUEST_BATCH_SIZE){const chunk=texts.slice(start,start+EMBEDDING_REQUEST_BATCH_SIZE);vectors.push(...embeddingsFrom(await this.ai.run(EMBEDDING_MODEL,{text:chunk}),chunk.length))}
    return vectors;
  }
}

export class DeterministicFixtureEmbedder implements Embedder {
  readonly kind='deterministic-test-fixture' as const;readonly dimensions=EMBEDDING_DIMENSIONS;
  embed(text:string){const vector=Array.from({length:EMBEDDING_DIMENSIONS},(_,index)=>(((text.charCodeAt(index%Math.max(1,text.length))||0)*(index+17))%997)/997);return Promise.resolve(vector)}
}

export function vectorMetadata(input:{corpusKind:'personal'|'advisor';userId?:string;advisorId?:string;packVersion?:string}){return {corpus_kind:input.corpusKind,user_id:input.userId??'',advisor_id:input.advisorId??'',pack_version:input.packVersion??'',pipeline_version:VECTOR_PIPELINE_VERSION}}
