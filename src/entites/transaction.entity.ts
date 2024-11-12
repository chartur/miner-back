import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Generated,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import {
  CreateDateWithTimezone,
  UpdateDateWithTimezone,
} from '../core/decorators/action-date-columns';
import { InvoiceAction } from '../core/models/enums/invoice-action';

@Entity('transactions')
export class TransactionEntity {
  @ApiProperty({
    example: 'asdfa-asdfasdf-werwetq',
    description: 'Internal ID of transaction',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '2',
    description: 'The order of completed transactions',
  })
  @Column({ type: 'bigint' })
  @Generated('increment')
  order: string;

  @ApiProperty({
    example: UserEntity,
    description: 'The owner user of the boost',
  })
  @ManyToOne(() => UserEntity, (user) => user.transactions, {
    lazy: true,
  })
  user: Promise<UserEntity>;

  @ApiProperty({
    example: 'adsfadsfxzcvfhsdgasdf',
    description: 'The HASH token of transaction',
  })
  @Column({ nullable: false, type: 'text' })
  hash: string;

  @ApiProperty({
    example: '124193518358',
    description: 'The logical time transaction',
  })
  @Column({ nullable: false, type: 'text' })
  lt: string;

  @ApiProperty({
    example: '0.003',
    description: 'The payment amount with ton',
  })
  @Column({ nullable: false, type: 'float' })
  amountWithTon: number;

  @ApiProperty({
    example: '0.003',
    description: 'The payment fee with ton',
  })
  @Column({ nullable: false, type: 'float' })
  fee: number;

  @ApiProperty({
    example: '15487okldagk9012384hdjkfabhdjkf',
    description: 'Source address',
  })
  @Column({ nullable: false, type: 'text' })
  fromAddress: string;

  @ApiProperty({
    example: 'test payload',
    description: 'The payment payload',
  })
  @Column({ nullable: true, type: 'text' })
  payload: string;

  @ApiProperty({
    example: 'test payload',
    description: 'The payment description',
  })
  @Column({ nullable: true, type: 'text' })
  details: string;

  @ApiProperty({
    example: InvoiceAction.BOOS_MEGA,
    description: 'The transaction created for',
  })
  @Column({ nullable: false, type: 'enum', enum: InvoiceAction })
  action: InvoiceAction;

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'Transaction success datetime',
  })
  @Column({ type: 'timestamp with time zone' })
  paidAt: Date;

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'Creation date',
  })
  @CreateDateWithTimezone()
  createdAt: Date;

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'Last edit date',
  })
  @UpdateDateWithTimezone()
  updatedAt: Date;
}
