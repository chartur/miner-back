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
import { UserEntity } from './user.entity';

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
  @OneToOne(() => UserEntity, (user) => user.wallet, { lazy: true })
  user: Promise<UserEntity>;

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

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'Last claim datetime',
  })
  @Column({ nullable: true, type: 'timestamp with time zone' })
  lastClaimDateTime: Date;

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
