import {
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TelegramUserDto } from './telegram-user.dto';

export class SyncUserDto {
  @ApiProperty({
    example: 'afc6a3774831fe3561ae2851d6e312703cf4a2d0a8524740ab1b9c21796ac',
    description: 'The token created for auth validation',
    required: true,
  })
  @IsString()
  hash: string;

  @ApiProperty({
    example: {
      allows_write_to_pm: true,
      first_name: 'John Smith',
      id: 234231241234,
      language_code: 'ru',
      last_name: '',
    },
    description: 'App launch request query id',
    required: true,
  })
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => TelegramUserDto)
  user: TelegramUserDto;
}
