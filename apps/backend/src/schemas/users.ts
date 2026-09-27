import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{9,14}$/;

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  phone: z.string().regex(phoneRegex, 'Invalid phone format').max(15).optional().or(z.literal('')),
  preferredLanguage: z.enum(['en', 'hi', 'gu']).optional(),
  businessName: z.string().max(200).optional().or(z.literal('')),
  businessCategory: z.string().max(100).optional().or(z.literal('')),
  operatingState: z.string().max(100).optional().or(z.literal('')),
  operatingDistrict: z.string().max(100).optional().or(z.literal('')),
  experienceLevel: z.enum(['BEGINNER', 'SOME_EXPERIENCE', 'EXPERIENCED', '']).optional().or(z.literal('')),
  businessBackground: z.string().max(2000).optional().or(z.literal('')),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(72).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});
