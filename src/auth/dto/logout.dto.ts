import { z } from 'zod';

export const LogoutDto = z.object({
  accessToken: z.string().nonempty(),
  refreshToken: z.string().nonempty(),
});

export type LogoutDto = z.infer<typeof LogoutDto>;
