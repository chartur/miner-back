import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateWithTimezone,
  UpdateDateWithTimezone,
} from '../core/decorators/action-date-columns';
import { UserEntity } from './user.entity';

@Entity('tasks')
export class TaskEntity {
  @ApiProperty({ example: 3, description: 'Internal ID of task' })
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @ApiProperty({ example: 'Join Channel', description: 'The title of task' })
  @Column({ nullable: false })
  title: string;

  @ApiProperty({
    example: 'you need to join our telegram channel',
    description: 'The description of task',
  })
  @Column({ nullable: false })
  description: string;

  @ApiProperty({
    example: 1000,
    description: 'The profit when complete the task',
  })
  @Column({ nullable: false })
  profit: number;

  @ApiProperty({
    example: 'https://instagram.com/@test_page',
    description: 'The link that user should go in',
  })
  @Column({ nullable: true })
  link: string;

  @ApiProperty({
    example: 'https://test.com/icon.png',
    description: 'The icon of the task',
  })
  @Column({ nullable: true })
  icon: string;

  @ApiProperty({
    example: [UserEntity],
    description: 'Users that completed the current task',
  })
  @ManyToMany(() => UserEntity, (user) => user.completedTasks)
  completedBy: UserEntity[];

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
