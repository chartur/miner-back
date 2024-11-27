import { Injectable, Logger } from '@nestjs/common';
import { TaskWithStateDto } from '../../core/models/dto/response/task-with-state.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from '../../entites/task.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entites/user.entity';
import { CompleteTaskDto } from '../../core/models/dto/complete-task.dto';
import { CompleteTaskResponseDto } from '../../core/models/dto/response/complete-task.response.dto';
import BigDecimal from 'js-big-decimal';

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
    this.logger.log('[Task] get all tasks', {
      user,
    });

    const completedTaskIds = await this.userEntityRepository
      .findOne({
        where: {
          id: user.id,
        },
        relations: ['completedTasks'],
      })
      .then((user) => user.completedTasks.map((t) => t.id));

    console.log(completedTaskIds);
    return this.taskEntityRepository.find().then((result) => {
      return result.map((task) => ({
        ...task,
        isCompleted: completedTaskIds.includes(task.id),
      }));
    });
  }

  public async complete(
    user: UserEntity,
    body: CompleteTaskDto,
  ): Promise<CompleteTaskResponseDto> {
    this.logger.log('[Task] Complete specific task', {
      user,
      body,
    });

    const userEntity = await this.userEntityRepository.findOneOrFail({
      where: {
        id: user.id,
      },
      relations: {
        completedTasks: true,
        wallet: true,
      },
    });

    const task = await this.taskEntityRepository.findOneOrFail({
      where: {
        id: body.taskId,
      },
    });

    userEntity.wallet.tibCoins = new BigDecimal(userEntity.wallet.tibCoins)
      .add(new BigDecimal(task.profit))
      .getValue();
    userEntity.completedTasks.push(task);
    await this.userEntityRepository.save(userEntity, {  });

    return {
      total: userEntity.wallet.tibCoins,
      taskId: task.id,
    };
  }
}
