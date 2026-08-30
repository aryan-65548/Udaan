import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{9,14}$/;

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().regex(phoneRegex, 'Invalid phone format').max(15).optional(),
  password: z.string().min(1, 'Password is required').max(72, 'Password too long'),
  preferredLanguage: z.enum(['en', 'hi', 'gu']).default('en'),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email']
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email').optional(),
  phone: z.string().regex(phoneRegex, 'Invalid phone format').max(15).optional(),
  password: z.string().min(1, 'Password is required'),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email']
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const consentSchema = z.object({
  consentType: z.enum(['TERMS', 'PRIVACY', 'AI_ADVISORY']),
  version: z.string().min(1, 'Version is required'),
  granted: z.boolean(),
});
