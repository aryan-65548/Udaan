import { z } from 'zod';

export const locationIdParamSchema = z.object({
  id: z.string().uuid('Invalid location ID format'),
});

export const stateIdParamSchema = z.object({
  stateId: z.string().uuid('Invalid state ID format'),
});

export const districtIdParamSchema = z.object({
  districtId: z.string().uuid('Invalid district ID format'),
});

export const blockIdParamSchema = z.object({
  blockId: z.string().uuid('Invalid block ID format'),
});
