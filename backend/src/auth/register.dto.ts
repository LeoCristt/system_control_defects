import { UserRole } from '../users/user.entity';

export class RegisterDto {
  username: string;
  password: string;
  role?: UserRole;
}
