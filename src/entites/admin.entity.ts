import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { UpdateDateWithTimezone } from '../core/decorators/action-date-columns';

@Entity('admins')
export class AdminEntity {
  @ApiProperty({ example: '3', description: 'Internal ID of admin' })
  @PrimaryGeneratedColumn('increment')
  id: string;

  @ApiProperty({
    example: 'test@test.com',
    description: 'The Email of admin',
  })
  @Column()
  email: string;

  @ApiProperty({
    example: '12323kdnjkafha',
    description: 'The password of admin',
  })
  @Column()
  password: string;

  @ApiProperty({
    example: 'John Smith',
    description: 'First and last name of admin',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'data://asdfaghfiuaydhsfjbakdf...',
    description: 'Telegram photo blob data of admin',
  })
  @Column({ nullable: true, type: 'text' })
  photoUrl?: string;

  @ApiProperty({
    example: '2011-10-05T14:48:00.000Z',
    description: 'Last edit date of user',
  })
  @UpdateDateWithTimezone()
  updatedAt: Date;
}
