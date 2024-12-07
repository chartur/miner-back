import { Body, Controller, Get, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBasicAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { AuthUser } from '../../core/decorators/auth-user';
import { UserEntity } from '../../entites/user.entity';
import { TaskWithStateDto } from '../../core/models/dto/response/task-with-state.dto';
import { CompleteTaskDto } from '../../core/models/dto/complete-task.dto';
import { CompleteTaskResponseDto } from '../../core/models/dto/response/complete-task.response.dto';
import { DailyStarInvoiceDto } from "../../core/models/dto/daily-star-invoice.dto";
import { LinkResponseDto } from "../../core/models/dto/response/link.response.dto";

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @ApiResponse({
    status: 201,
    type: [TaskWithStateDto],
    description: 'The records successfully loaded.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  @Get('/')
  getAllTasks(@AuthUser() user: UserEntity): Promise<TaskWithStateDto[]> {
    return this.taskService.getAllTasks(user);
  }

  @ApiResponse({
    status: 201,
    type: CompleteTaskResponseDto,
    description: 'The records successfully loaded.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  @Put('/complete')
  complete(
    @AuthUser() user: UserEntity,
    @Body() body: CompleteTaskDto,
  ): Promise<CompleteTaskResponseDto> {
    return this.taskService.complete(user, body);
  }

  @ApiResponse({
    status: 201,
    type: CompleteTaskResponseDto,
    description: 'The records successfully loaded.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBasicAuth()
  @UseGuards(AuthGuard)
  @Post('/star-invoice')
  starInvoice(
    @AuthUser() user: UserEntity,
    @Body() body: DailyStarInvoiceDto,
  ): Promise<LinkResponseDto> {
    return this.taskService.starInvoice(user, body);
  }
}
