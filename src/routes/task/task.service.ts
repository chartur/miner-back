import { Injectable, Logger } from '@nestjs/common';
import { TaskWithStateDto } from '../../core/models/dto/response/task-with-state.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from '../../entites/task.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entites/user.entity';

@Injectable()
export class TaskService {
  private logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(TaskEntity)
    private taskEntityRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private userEntityRepository: Repository<UserEntity>,
  ) {}

  public async getAllTasks(user: UserEntity): Promise<TaskWithStateDto[]> {
    const completedTaskIds = await this.userEntityRepository
      .findOne({
        where: {
          id: user.id,
        },
        relations: ['completedTasks'],
      })
      .then((user) => user.completedTasks.map((t) => t.id));

    return this.taskEntityRepository.find().then((result) => {
      return result.map((task) => ({
        ...task,
        isCompleted: completedTaskIds.includes(task.id),
      }));
    });
  }
}
