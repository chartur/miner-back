import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import {
  CreateDateWithTimezone,
  UpdateDateWithTimezone,
} from '../core/decorators/action-date-columns';

@Entity('wallets')
export class WalletEntity {
  @ApiProperty({ example: '3', description: 'Internal ID of wallet' })
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @ApiProperty({
    example: UserEntity,
    description: 'The owner user of the wallet',
  })
  @JoinColumn()
  @OneToOne(() => UserEntity, (user) => user.wallet, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @ApiProperty({
    example: 3,
    description: 'Claim count',
  })
  @Column({ default: 0 })
  claimCount: number;

  @ApiProperty({ example: 3, description: 'Tons count in wallet' })
  @Column({ default: 0, type: 'float' })
  tons: number;

  @ApiProperty({ example: 345000, description: 'Nonotons count in wallet' })
  @Column({ default: 0 })
  nonotons: number;

  @ApiProperty({ example: 345000, description: 'Tib coins count' })
  @Column({ default: 0, type: 'bigint' })
  tibCoins: string;

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'Last claim datetime',
  })
  @Column({ nullable: true, type: 'timestamp with time zone' })
  lastClaimDateTime: Date;

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'The Last claim datetime of refs profit',
  })
  @Column({
    nullable: true,
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastRefsClaimDateTime: Date;

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
