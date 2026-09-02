import { z } from 'zod';

export const businessCategoryIdParamSchema = z.object({
  id: z.string().uuid('Invalid business category ID format'),
});
