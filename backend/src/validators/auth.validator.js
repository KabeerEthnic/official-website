import { z } from 'zod';

const email = z.string().trim().toLowerCase().email().max(200);

/**
 * Length is the control that actually matters for password strength; a
 * 10-character minimum with no composition rules follows current NIST advice.
 */
const password = z
  .string()
  .min(10, 'Use at least 10 characters')
  .max(200, 'Passwords cannot be longer than 200 characters');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Tell us your name').max(80),
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password').max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: password,
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{6,20}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
});
