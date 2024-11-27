import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CompleteTaskDto {
  @ApiProperty({
    example: 'terte-qe1324-qer-erqwerqw-22432',
    description: 'The task UUID',
    required: true,
  })
  @IsString()
  taskId: string;
}
