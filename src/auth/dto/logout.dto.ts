import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LogoutDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
