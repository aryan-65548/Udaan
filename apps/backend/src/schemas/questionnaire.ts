import { z } from 'zod';

export const infrastructureResponseSchema = z.object({
  road_transport: z.enum(['GOOD', 'AVERAGE', 'POOR', 'NOT_AVAILABLE']),
  electricity: z.enum(['GOOD', 'AVERAGE', 'POOR', 'NOT_AVAILABLE']),
  water: z.enum(['GOOD', 'AVERAGE', 'POOR', 'NOT_AVAILABLE']),
  connectivity: z.enum(['GOOD', 'AVERAGE', 'POOR', 'NOT_AVAILABLE']),
});

export const competitorEntrySchema = z.object({
  name: z.string().min(1, 'Competitor name or type is required'),
  distance: z.string().optional(),
  description: z.string().optional(),
});

export const competitorsResponseSchema = z
  .object({
    hasNoCompetitors: z.boolean().optional(),
    competitors: z.array(competitorEntrySchema).optional(),
  })
  .refine(
    (data) =>
      data.hasNoCompetitors === true || (data.competitors && data.competitors.length > 0),
    {
      message:
        'Must either list at least one competitor or check "I am not aware of any nearby competitors"',
    }
  );

export const seasonalConstraintsResponseSchema = z.object({
  constraints: z.array(z.string()).min(1, 'At least one seasonal option must be selected'),
  explanation: z.string().optional(),
  affectedMonths: z.array(z.string()).optional(),
});

export const localDemandResponseSchema = z.object({
  demandLevel: z.enum(['HIGH', 'MODERATE', 'LOW', 'NOT_SURE']),
  rationale: z.string().optional(),
});

export const customersMarketResponseSchema = z.object({
  customerGroups: z.array(z.string()).min(1, 'At least one customer group must be selected'),
  salesChannels: z.string().optional(),
});

export const businessRisksResponseSchema = z.object({
  challenges: z.array(z.string()).min(1, 'At least one business challenge must be selected'),
  supportNeeded: z.string().optional(),
});

export const questionnaireResponseItemSchema = z.object({
  questionCode: z.string().min(1),
  questionId: z.string().optional(),
  response: z.record(z.any()),
});

export const saveQuestionnaireResponsesSchema = z.object({
  responses: z.array(questionnaireResponseItemSchema).min(1, 'At least one response must be provided'),
});

export type SaveQuestionnaireResponsesInput = z.infer<typeof saveQuestionnaireResponsesSchema>;
