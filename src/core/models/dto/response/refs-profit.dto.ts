import { UserEntity } from '../../../../entites/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class RefsProfitDto {
  @ApiProperty({
    example: [UserEntity],
    description: 'The referral users list',
  })
  users: Partial<UserEntity>[];

  @ApiProperty({
    example: '32000',
    description: 'Total amount came from referrals',
  })
  total: string;

  @ApiProperty({
    example: 5,
    description: 'All referral users count',
  })
  moreUsersCount: number;
}
