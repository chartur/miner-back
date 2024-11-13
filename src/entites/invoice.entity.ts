import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import {
  CreateDateWithTimezone,
  UpdateDateWithTimezone,
} from '../core/decorators/action-date-columns';
import { InvoiceAction } from '../core/models/enums/invoice-action';

@Entity('invoices')
export class InvoiceEntity {
  @ApiProperty({
    example: 'asdfa-asdfasdf-werwetq',
    description: 'Internal ID of transaction',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: UserEntity,
    description: 'The owner user of the boost',
  })
  @ManyToOne(() => UserEntity, (user) => user.invoices, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @ApiProperty({
    example: '0.003',
    description: 'The payment amount with ton',
  })
  @Column({ nullable: false, type: 'float' })
  amount: number;

  @ApiProperty({
    example: 'Thank you for proceed the purchase for Mini Boost',
    description: 'The description which prepared the invoice for',
  })
  @Column({ nullable: true, type: 'text' })
  details: string;

  @ApiProperty({
    example: InvoiceAction.BOOS_MEGA,
    description: 'The invoice created for',
  })
  @Column({ nullable: false, type: 'enum', enum: InvoiceAction })
  action: InvoiceAction;

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'Expiration datetime',
  })
  @Column({
    nullable: false,
    type: 'timestamp with time zone',
    default: () => "(now() + '00:03:00'::interval)",
  })
  expirationDateTime: Date;

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
