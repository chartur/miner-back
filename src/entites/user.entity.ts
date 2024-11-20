import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinTable,
} from 'typeorm';

import { Language } from '../core/models/enums/language';
import { ApiProperty } from '@nestjs/swagger';
import { RefEntity } from './ref.entity';
import { WalletEntity } from './wallet.entity';
import { BoostEntity } from './boost.entity';
import { TransactionEntity } from './transaction.entity';
import { InvoiceEntity } from './invoice.entity';
import {
  CreateDateWithTimezone,
  UpdateDateWithTimezone,
} from '../core/decorators/action-date-columns';
import { Expose } from 'class-transformer';
import { TaskEntity } from './task.entity';

@Entity('users')
export class UserEntity {
  @ApiProperty({ example: '3', description: 'Internal ID of user' })
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @ApiProperty({ example: 2344326543, description: 'Telegram ID of user' })
  @Column({ unique: true, type: 'bigint' })
  tUserId: string;

  @ApiProperty({ example: 'John', description: 'First name of user' })
  @Column()
  firstName: string;

  @ApiProperty({ example: 'Smith', description: 'Last name of user' })
  @Column()
  lastName: string;

  @ApiProperty({
    example: 'data://asdfaghfiuaydhsfjbakdf...',
    description: 'Telegram photo blob data of user',
  })
  @Column({ nullable: true, type: 'text' })
  photoUrl?: string;

  @ApiProperty({
    example: Language.EN,
    description: 'Telegram based language code of user',
  })
  @Column({ type: 'enum', enum: Language, default: Language.EN })
  languageCode: Language;

  @ApiProperty({
    example: WalletEntity,
    description: 'The wallet of current user',
  })
  @OneToOne(() => WalletEntity, (wallet) => wallet.user, {
    onDelete: 'CASCADE',
  })
  wallet: WalletEntity;

  @ApiProperty({
    example: [BoostEntity],
    description: 'The boosts list of current user',
  })
  @OneToMany(() => BoostEntity, (boost) => boost.user, { onDelete: 'CASCADE' })
  boosts: BoostEntity[];

  @ApiProperty({
    example: [RefEntity],
    description: 'Users list which current user invited',
  })
  @OneToMany(() => RefEntity, (ref) => ref.referrer, { onDelete: 'CASCADE' })
  referrals: RefEntity[];

  @ApiProperty({
    example: RefEntity,
    description: 'The user who referred current user',
  })
  @OneToOne(() => RefEntity, (ref) => ref.referral)
  referrer?: RefEntity;

  @ApiProperty({
    example: [TransactionEntity],
    description: 'User transactions list',
  })
  @OneToMany(() => TransactionEntity, (type) => type.user)
  transactions: TransactionEntity[];

  @ApiProperty({
    example: [InvoiceEntity],
    description: 'User created invoices',
  })
  @OneToMany(() => InvoiceEntity, (type) => type.user, { onDelete: 'CASCADE' })
  invoices: InvoiceEntity[];

  @ApiProperty({
    example: [UserEntity],
    description: 'Users that completed the current task',
  })
  @ManyToMany(() => TaskEntity, (user) => user.completedBy)
  @JoinTable()
  completedTasks: TaskEntity[];

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

  @ApiProperty({
    example: BoostEntity,
    description: 'The boost of current user',
  })
  @Expose()
  public get boost(): BoostEntity | null {
    return this.boosts?.[0] || null;
  }

  public get lastBoost(): BoostEntity | null {
    return this.boosts.length ? this.boosts[this.boosts.length - 1] : null;
  }

  public set boost(boost: BoostEntity) {
    this.boosts.push(boost);
  }
}
