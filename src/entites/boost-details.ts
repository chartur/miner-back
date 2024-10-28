import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BoostLevels } from '../core/models/enums/boost-levels';

@Entity('boost_details')
export class BoostDetails {
  @ApiProperty({ example: 3, description: 'Internal ID of boosts' })
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @ApiProperty({
    example: BoostLevels.MINI,
    description: 'Boost level name',
  })
  @Column({
    type: 'enum',
    enum: BoostLevels,
    default: BoostLevels.USUAL,
    unique: true,
  })
  name: BoostLevels;

  @ApiProperty({
    example: 3,
    description: 'Boost activation price with tones',
  })
  @Column({ nullable: false, type: 'float' })
  price: number;

  @ApiProperty({
    example: 6200,
    description: 'Boost claim count',
  })
  @Column({ nullable: false, type: 'int', default: 0 })
  perClaim: number;

  @ApiProperty({
    example: 300000,
    description: 'Boost claim count in period (10 days)',
  })
  @Column({ nullable: false, type: 'int' })
  perPeriodClaim: number;

  @ApiProperty({
    example: 0.3,
    description: 'Boost revenue with tones per period (10 days)',
  })
  @Column({ nullable: false, type: 'float' })
  perPeriodTonRevenue: number;

  @ApiProperty({
    example: 0.346,
    description: 'Boost revenue with nonotones per second',
  })
  @Column({ nullable: false, type: 'float' })
  perSecondNonotonRevenue: number;

  @ApiProperty({
    example: 0.5,
    description: 'Boost ref cashback revenue with percentage',
  })
  @Column({ nullable: false, type: 'float' })
  refCashback: number;

  @ApiProperty({
    example: 2,
    description: 'Print process with provided count',
  })
  @Column({ nullable: false, type: 'int' })
  processorCount: number;
}
