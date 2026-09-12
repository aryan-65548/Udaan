import { z } from 'zod';

export const startAiSessionSchema = z.object({
  // any configuration for starting session, usually empty
});

export const aiMessageSchema = z.object({
  content: z.string().min(1),
});

export const aiResponseSchema = z.object({
  sessionId: z.string(),
  status: z.enum(['QUESTIONING', 'ANALYZING', 'COMPLETED', 'FAILED']),
  message: z.string().optional(),
  report: z.record(z.any()).optional(), // Based on AI engine contract
});
