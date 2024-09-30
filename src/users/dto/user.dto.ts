import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from 'src/enums/roles.enum';

export class UserDTO {
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;

  @IsNotEmpty()
  @IsString()
  readonly role: Role;
}
