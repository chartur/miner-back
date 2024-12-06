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

@Entity('user_settings')
export class UserSettingsEntity {
  @ApiProperty({ example: '3', description: 'Internal ID of config' })
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @ApiProperty({
    example: UserEntity,
    description: 'The owner user of the config',
  })
  @JoinColumn()
  @OneToOne(() => UserEntity, (user) => user.settings, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @ApiProperty({
    example: true,
    description: 'Claim notification enabled',
  })
  @Column({ nullable: false, default: false, type: 'boolean' })
  claimNotificationEnabled: boolean;

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'The Last claim datetime of refs profit',
  })
  @Column({
    nullable: true,
    type: 'timestamp with time zone',
  })
  claimNotificationExpiration?: Date;

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
