export type VectorMatch={id:string;score?:number;metadata?:Record<string,string|number|boolean>};
export type VectorQueryResult={matches:VectorMatch[]};
export interface VectorQueryLane { query(vector:number[],options:{topK:number;returnMetadata:'all';filter:Record<string,string>}):Promise<VectorQueryResult> }

export async function retrievePersonal(index:VectorQueryLane,vector:number[],userId:string,topK=8){
  return index.query(vector,{topK,returnMetadata:'all',filter:{corpus_kind:'personal',user_id:userId}});
}

export async function retrieveAdvisor(index:VectorQueryLane,vector:number[],advisorId:string,packVersion:string,topK=6){
  return index.query(vector,{topK,returnMetadata:'all',filter:{corpus_kind:'advisor',advisor_id:advisorId,pack_version:packVersion}});
}

export class EmbeddingConfigurationError extends Error { override name='EmbeddingConfigurationError' }
type EmbeddingResponse={data:Array<{embedding:number[]}>};
const isEmbeddingResponse=(value:unknown):value is EmbeddingResponse=>{
  if(!value||typeof value!=='object'||!('data' in value))return false;
  const data:unknown=value.data;
  if(!Array.isArray(data)||data.length===0)return false;const first:unknown=data[0];
  if(!first||typeof first!=='object'||!('embedding' in first))return false;const embedding:unknown=first.embedding;
  return Array.isArray(embedding)&&embedding.every((item:unknown)=>typeof item==='number');
};

export async function createEmbedding(text:string,apiKey?:string):Promise<number[]> {
  if(!apiKey)throw new EmbeddingConfigurationError('OPENAI_API_KEY is required for embeddings.');
  if(!text||text.length>8000)throw new Error('INVALID_EMBEDDING_INPUT');
  const response=await fetch('https://api.openai.com/v1/embeddings',{method:'POST',headers:{authorization:`Bearer ${apiKey}`,'content-type':'application/json'},body:JSON.stringify({model:'text-embedding-3-large',dimensions:1536,input:text})});
  if(!response.ok)throw new Error(`EMBEDDING_REQUEST_FAILED_${response.status}`);
  const value:unknown=await response.json();
  if(!isEmbeddingResponse(value))throw new Error('INVALID_EMBEDDING_RESPONSE');
  return value.data[0]!.embedding;
}
