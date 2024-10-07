import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Language } from '../enums/language';
import { Transform } from 'class-transformer';

export class TelegramUserDto {
  @ApiProperty({ example: 10989243, description: 'User telegram id' })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: 'John',
    description: 'User telegram first name',
    required: true,
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    example: 'Smith',
    description: 'User telegram last name',
    required: true,
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    example: Language.EN,
    description: 'User telegram language',
    required: true,
  })
  @Transform((prop) =>
    Object.values(Language).includes(prop.value) ? prop.value : Language.EN,
  )
  @IsEnum(Language)
  language_code: string;

  @ApiProperty({
    example: true,
    description: 'Allow to receive pm message',
    required: true,
  })
  @IsBoolean()
  @IsOptional()
  allows_write_to_pm: boolean;
}
