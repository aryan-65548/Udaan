import { z } from 'zod';

export const DEFAULT_VALIDATION_TASKS = [
  {
    taskKey: 'CUSTOMER_DEMAND',
    taskText: 'Verify local customer demand and target market size',
  },
  {
    taskKey: 'COMPETITOR_CHECK',
    taskText: 'Check nearby competitors and their existing offerings',
  },
  {
    taskKey: 'SUPPLIER_CHECK',
    taskText: 'Verify supplier availability and pricing terms',
  },
  {
    taskKey: 'LOCAL_PRICE_CHECK',
    taskText: 'Verify local selling price and prevailing market rates',
  },
  {
    taskKey: 'EQUIPMENT_CHECK',
    taskText: 'Confirm required equipment or infrastructure',
  },
  {
    taskKey: 'OPERATING_COST_CHECK',
    taskText: 'Confirm estimated operating costs including rent and utilities',
  },
] as const;

export const validationTaskIdParamSchema = z.object({
  id: z.string().uuid('Invalid assessment ID format'),
  taskId: z.string().uuid('Invalid task ID format'),
});

export const updateValidationTaskSchema = z
  .object({
    status: z.enum(['PENDING', 'COMPLETED', 'SKIPPED']).optional(),
    notes: z.string().nullable().optional(),
  })
  .refine((data) => data.status !== undefined || data.notes !== undefined, {
    message: 'At least one field (status or notes) must be provided for update',
  });
