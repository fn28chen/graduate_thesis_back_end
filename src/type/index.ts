import { Role } from 'src/enums/roles.enum';

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: Role;
}

export interface IUser {
  readonly user: User;
  readonly token: string;
}
