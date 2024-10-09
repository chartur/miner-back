import { UserEntity } from '../../../../entites/user.entity';

export class AuthUserDto {
  user: UserEntity;
  token: string;
}
