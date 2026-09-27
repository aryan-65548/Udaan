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
  language: z.enum(['en', 'hi', 'gu']).default('en'),
});

export const updateAssessmentSchema = z.object({
  locationId: z.string().uuid('Invalid location ID').optional(),
  businessCategoryId: z.string().uuid('Invalid business category ID').optional(),
  language: z.enum(['en', 'hi', 'gu']).optional(),
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
}).superRefine((data, ctx) => {
  if (data.inputType === 'NUMBER' && data.valueNumber !== undefined && data.valueNumber !== null) {
    const num = Number(data.valueNumber);
    if (isNaN(num) || !isFinite(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Value must be a valid, finite number for inputType NUMBER',
        path: ['valueNumber'],
      });
    } else if (num < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Numerical values cannot be negative',
        path: ['valueNumber'],
      });
    }
  }
});

const profileObjectInputSchema = z.object({
  questionText: z.string().optional().nullable(),
  inputType: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'DATE', 'JSON']).optional(),
  value: z.any(),
  source: z.enum(['USER', 'AI', 'SYSTEM']).optional(),
}).superRefine((data, ctx) => {
  if (data.inputType !== undefined && data.value !== null && data.value !== undefined) {
    switch (data.inputType) {
      case 'TEXT':
      case 'SELECT':
      case 'DATE':
        if (typeof data.value !== 'string') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Value must be a string for inputType ${data.inputType}`,
            path: ['value'],
          });
        }
        break;
      case 'NUMBER':
        if (typeof data.value !== 'number' || Number.isNaN(data.value) || !Number.isFinite(data.value) || data.value < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Value must be a non-negative, finite number for inputType NUMBER',
            path: ['value'],
          });
        }
        break;
      case 'BOOLEAN':
        if (typeof data.value !== 'boolean') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Value must be a boolean for inputType BOOLEAN',
            path: ['value'],
          });
        }
        break;
      case 'MULTI_SELECT':
        if (typeof data.value !== 'object' && typeof data.value !== 'string') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Value must be an array, object, or string for inputType MULTI_SELECT',
            path: ['value'],
          });
        }
        break;
      case 'JSON':
        if (typeof data.value !== 'object') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Value must be an object or array for inputType JSON',
            path: ['value'],
          });
        }
        break;
    }
  }
});

export const patchProfileInputsSchema = z.record(
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    profileObjectInputSchema,
    z.null(),
  ])
);
