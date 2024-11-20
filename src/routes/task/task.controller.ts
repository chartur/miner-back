import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { AuthUser } from '../../core/decorators/auth-user';
import { UserEntity } from '../../entites/user.entity';
import { TaskWithStateDto } from '../../core/models/dto/response/task-with-state.dto';

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
}
