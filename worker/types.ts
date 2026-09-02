import { z } from 'zod';

export const EvidenceRefSchema = z.object({ id:z.string(), lane:z.enum(['personal','advisor']), relevance:z.string().min(8), retrievalScore:z.number().min(0).max(1) });
export const ClaimSchema = z.object({ text:z.string().max(1200), claimType:z.enum(['personalized_recommendation','doctrine_interpretation','uncertainty']), supportRelationship:z.enum(['direct','applied']), personalEvidenceIds:z.array(z.string()).max(12), advisorEvidenceIds:z.array(z.string()).max(8) });
export const AdvisorReportSchema = z.object({
  advisorId:z.string(), questionInterpreted:z.string().max(600), evidence:z.array(EvidenceRefSchema).max(20), claims:z.array(ClaimSchema).max(8),
  recommendation:z.string().max(1600), personalEvidenceThatChangedAdvice:z.array(z.string()).max(12), uncertainty:z.string().max(800), confidence:z.number().min(0).max(1),
  reasoning:z.string().max(1800).optional(), confidenceRationale:z.string().max(800).optional(), disagreement:z.string().max(800).optional(), counterevidenceIds:z.array(z.string()).max(8).optional(),
  abstained:z.boolean(), abstentionReason:z.string()
});
export type AdvisorReport = z.infer<typeof AdvisorReportSchema>;

export type TimelineEvent = { id:string; occurredAt:string; type:string; subjectId:string; valence:'positive'|'negative'|'neutral'; magnitude:number; text:string; tags:string[] };
export type Pattern = { id:string; name:string; assertion:string; status:'active'|'rejected'; confidence:number; windowStart:string; windowEnd:string; algorithmVersion:string; supportingIds:string[]; contradictoryIds:string[] };
export type SourceChunk = { id:string; advisorId:string; packId:string; packVersion:string; locator:string; text:string; canonicalHash:string; retrievalScore:number; retrievalProvider?:'cloudflare-bge-cosine' };
export type EvidenceBundle = { question:string; goals:string[]; constraints:TimelineEvent[]; history:TimelineEvent[]; priorAdvice:TimelineEvent[]; outcomes:TimelineEvent[]; adaptations:TimelineEvent[]; patterns:Pattern[]; sourceByAdvisor:Record<string,SourceChunk[]> };
