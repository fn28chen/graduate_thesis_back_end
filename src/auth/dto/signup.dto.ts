import { z } from 'zod';

export const SignUpSchema = z.object({
  username: z.string().max(20, { message: 'Name is too long' }),
  email: z.string().email({ message: 'Please enter correct email' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/, {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter and one number',
    }),
});

export type SignUpDto = z.infer<typeof SignUpSchema>;
