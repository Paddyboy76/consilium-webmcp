export const OPERATING_LIMITS={maxCouncillors:3,personalTopK:8,advisorTopK:6,maxBodyBytes:8192,maxQuestionChars:600,maxSpecialistClaims:8,maxConsultationsPerHour:6,consultationTimeoutMs:25000,configuredCpuMs:30000,configuredSubrequests:40,expectedGoldenJourneySubrequests:18} as const;

export async function withConsultationTimeout<T>(operation:(signal:AbortSignal)=>Promise<T>,parentSignal?:AbortSignal){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort('CONSULTATION_TIMEOUT'),OPERATING_LIMITS.consultationTimeoutMs);
  const cancel=()=>controller.abort('CLIENT_CANCELLED');parentSignal?.addEventListener('abort',cancel,{once:true});
  try{return await operation(controller.signal)}finally{clearTimeout(timeout);parentSignal?.removeEventListener('abort',cancel)}
}
