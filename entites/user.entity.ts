import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Language } from '../core/models/enums/language';
import { ApiProperty } from '@nestjs/swagger';
import { RefEntity } from './ref.entity';

@Entity('users')
export class UserEntity {
  @ApiProperty({ example: 3, description: 'Internal ID of user' })
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
    example: 'https://api.telegram.com/file/sdfadsf.png',
    description: 'Telegram photo url of user',
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
    example: [RefEntity],
    description: 'Users list which current user invited',
  })
  @OneToMany(() => RefEntity, (ref) => ref.referrer)
  references: RefEntity[];

  @ApiProperty({
    example: RefEntity,
    description: 'The user who referred current user',
  })
  @OneToOne(() => RefEntity, (ref) => ref.referral)
  referrer?: RefEntity;

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
