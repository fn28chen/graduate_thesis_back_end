import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UserDto {
  @IsString()
  username: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;
}
