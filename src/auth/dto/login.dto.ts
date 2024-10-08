import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter correct email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export type LoginDto = z.infer<typeof LoginSchema>;
