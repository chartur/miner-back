import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BoostLevels } from '../enums/boost-levels';

export class ActivateBoostDto {
  @ApiProperty({
    example: BoostLevels.MAJOR,
    description: 'The type of boost that user want to activate',
    required: true,
  })
  @IsEnum(BoostLevels)
  boostType: BoostLevels;
}
