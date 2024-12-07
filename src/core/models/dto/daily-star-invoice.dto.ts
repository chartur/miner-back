import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DailyStarInvoiceDto {
  @ApiProperty({
    example: 'asdfasd-qwerqw-afasdf23-adsfsfd',
    description: 'The id of the task',
    required: true,
  })
  @IsUUID()
  taskId: string;
}
