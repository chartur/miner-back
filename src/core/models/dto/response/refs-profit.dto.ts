import { UserEntity } from '../../../../entites/user.entity';

export class RefsProfitDto {
  users: Partial<UserEntity>[];
  total: string;
  moreUsersCount: number;
}
