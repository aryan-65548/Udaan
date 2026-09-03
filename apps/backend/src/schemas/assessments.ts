import { z } from 'zod';

export const assessmentIdParamSchema = z.object({
  id: z.string().uuid('Invalid assessment ID format'),
});

export const inputKeyParamSchema = z.object({
  id: z.string().uuid('Invalid assessment ID format'),
  inputKey: z.string().min(1, 'Input key is required').max(100),
});

export const createAssessmentSchema = z.object({
  locationId: z.string().uuid('Invalid location ID'),
  businessCategoryId: z.string().uuid('Invalid business category ID'),
  language: z.string().min(2).max(10).default('en'),
});

export const updateAssessmentSchema = z.object({
  locationId: z.string().uuid('Invalid location ID').optional(),
  businessCategoryId: z.string().uuid('Invalid business category ID').optional(),
  language: z.string().min(2).max(10).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const putAssessmentInputSchema = z.object({
  questionText: z.string().optional().nullable(),
  inputType: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'DATE', 'JSON']),
  valueText: z.string().optional().nullable(),
  valueNumber: z.union([z.number(), z.string()]).optional().nullable(),
  valueBoolean: z.boolean().optional().nullable(),
  valueJson: z.any().optional().nullable(),
  source: z.enum(['USER', 'AI', 'SYSTEM']).default('USER'),
});

export const patchProfileInputsSchema = z.record(
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({
      questionText: z.string().optional(),
      inputType: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'DATE', 'JSON']).optional(),
      value: z.any(),
      source: z.enum(['USER', 'AI', 'SYSTEM']).optional(),
    }),
    z.null(),
  ])
);
