import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { Exclude } from 'class-transformer';
import {
  CreateDateWithTimezone,
  UpdateDateWithTimezone,
} from '../core/decorators/action-date-columns';

@Entity('refs')
export class RefEntity {
  @ApiProperty({
    type: 'string',
    example: '465',
    description: 'Reference entity unique id',
  })
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @ApiProperty({
    type: 'string',
    example: '590903',
    description: 'The user who sent link of referral',
  })
  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  referrer: UserEntity;

  @ApiProperty({
    type: 'string',
    example: '590903',
    description: 'The user who joined by sent referral link',
  })
  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  referral: UserEntity;

  @ApiProperty({
    type: 'int',
    example: 5,
    description: 'Received revenue with Ton',
    default: 0,
  })
  @Column({ type: 'float', default: 0 })
  revenueWithTon: number;

  @ApiProperty({
    type: 'int',
    example: 3000000,
    description:
      'The nonoton that came from referral user but is not claimed yet',
    default: 0,
  })
  @Column({ type: 'float', default: 0 })
  @Exclude()
  nonClaimedRevenue: number;

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'Creation date',
  })
  @CreateDateWithTimezone()
  createdAt: Date;

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'Last edit date of user',
  })
  @UpdateDateWithTimezone()
  updatedAt: Date;
}
