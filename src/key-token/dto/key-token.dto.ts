import { IsString } from 'class-validator';

export class KeyTokenDto {
  @IsString()
  refreshToken: string;

  @IsString()
  userId: number;

  createdAt: Date;
}
