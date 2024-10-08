import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BoostLevels } from '../core/models/enums/boost-levels';
import { UserEntity } from './user.entity';

@Entity('boosts')
export class BoostEntity {
  @ApiProperty({ example: '3', description: 'Internal ID of boosts' })
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @ApiProperty({
    example: UserEntity,
    description: 'The owner user of the boost',
  })
  @JoinColumn()
  @OneToOne(() => UserEntity, (user) => user.boost, { lazy: true })
  user: Promise<UserEntity>;

  @ApiProperty({
    example: BoostLevels.MINI,
    description: 'Activated Boost level',
  })
  @Column({ type: 'enum', enum: BoostLevels, default: BoostLevels.USUAL })
  boostLevel: BoostLevels;

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'Boost activation datetime',
  })
  @Column({ nullable: true, type: 'timestamp with time zone' })
  boostActivationDate: Date;

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'Boost expiration datetime',
  })
  @Column({ nullable: true, type: 'timestamp with time zone' })
  boostExpirationDate: Date;

  @ApiProperty({
    example: 1.5,
    description: 'The Percentage get from referral users',
  })
  @Column({ type: 'float' })
  refPercent: number;

  @ApiProperty({
    example: 72915,
    description: 'The amount per claim of boost',
  })
  @Column({ type: 'float' })
  amountPerClaim: number;

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'Creation date',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'Last edit date of user',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
