import { z } from 'zod';

export const EvidenceRefSchema = z.object({ id:z.string(), lane:z.enum(['personal','advisor']), relevance:z.string().min(8) });
export const ClaimSchema = z.object({ text:z.string(), personalEvidenceIds:z.array(z.string()), advisorEvidenceIds:z.array(z.string()) });
export const AdvisorReportSchema = z.object({
  advisorId:z.string(), questionInterpreted:z.string(), evidence:z.array(EvidenceRefSchema), claims:z.array(ClaimSchema),
  recommendation:z.string(), personalEvidenceThatChangedAdvice:z.array(z.string()), uncertainty:z.string(), confidence:z.number().min(0).max(1),
  abstained:z.boolean(), abstentionReason:z.string()
});
export type AdvisorReport = z.infer<typeof AdvisorReportSchema>;

export type TimelineEvent = { id:string; occurredAt:string; type:string; subjectId:string; valence:'positive'|'negative'|'neutral'; magnitude:number; text:string; tags:string[] };
export type Pattern = { id:string; name:string; assertion:string; status:'active'|'rejected'; confidence:number; windowStart:string; windowEnd:string; algorithmVersion:string; supportingIds:string[]; contradictoryIds:string[] };
export type SourceChunk = { id:string; advisorId:string; packId:string; locator:string; text:string };
export type EvidenceBundle = { question:string; goals:string[]; constraints:TimelineEvent[]; history:TimelineEvent[]; priorAdvice:TimelineEvent[]; outcomes:TimelineEvent[]; adaptations:TimelineEvent[]; patterns:Pattern[]; sourceByAdvisor:Record<string,SourceChunk[]> };

