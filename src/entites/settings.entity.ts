import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateWithTimezone,
  UpdateDateWithTimezone,
} from '../core/decorators/action-date-columns';

@Entity('settings')
export class SettingsEntity {
  @ApiProperty({
    example: 1,
    description: 'The unique id',
  })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({
    example: '23194u82480913=',
    description: 'The last transaction hash proceed by corn job',
  })
  @Column({ type: 'text', nullable: true })
  lastTransactionHash: string;

  @ApiProperty({
    example: '23194u8248091',
    description: 'The last transaction LT proceed by corn job',
  })
  @Column({ type: 'text', nullable: true })
  lastTransactionLT: string;

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
