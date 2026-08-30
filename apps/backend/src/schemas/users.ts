import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{9,14}$/;

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  phone: z.string().regex(phoneRegex, 'Invalid phone format').max(15).optional(),
  preferredLanguage: z.enum(['en', 'hi', 'gu']).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});
