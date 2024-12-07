import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { TaskWithStateDto } from '../../core/models/dto/response/task-with-state.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from '../../entites/task.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entites/user.entity';
import { CompleteTaskDto } from '../../core/models/dto/complete-task.dto';
import { CompleteTaskResponseDto } from '../../core/models/dto/response/complete-task.response.dto';
import BigDecimal from 'js-big-decimal';
import { DailyStarInvoiceDto } from '../../core/models/dto/daily-star-invoice.dto';
import { LinkResponseDto } from '../../core/models/dto/response/link.response.dto';
import { InvoiceEntity } from '../../entites/invoice.entity';
import { ConfigService } from '@nestjs/config';
import { InvoiceAction } from '../../core/models/enums/invoice-action';
import { TelegramHelper } from '../../utils/telegram.helper';
import { StarInvoiceTaskDetails } from '../../core/models/interfaces/task-details/star-invoice-task.details';
import { TelegramClient } from '../../clients/telegram.client';
import { TaskCompleteProps } from '../../core/models/interfaces/invoice-props/task-complete.props';

@Injectable()
export class TaskService {
  private logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(TaskEntity)
    private taskEntityRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private userEntityRepository: Repository<UserEntity>,
    @InjectRepository(InvoiceEntity)
    private invoiceEntityRepository: Repository<InvoiceEntity>,
    private configService: ConfigService,
    private telegramClient: TelegramClient,
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

    return this.taskEntityRepository.find().then((result) => {
      return (
        result
          .map((task) => ({
            ...task,
            isCompleted: completedTaskIds.includes(task.id),
          }))
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          .sort((a, b) => a.isCompleted - b.isCompleted)
      );
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

    const sameTaskCompletedCount = await this.userEntityRepository
      .createQueryBuilder('user')
      .innerJoin('user.completedTasks', 'task')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('task.id = :taskId', { taskId: body.taskId })
      .getCount();

    if (sameTaskCompletedCount > 0) {
      throw new BadRequestException('You have already completed the task!');
    }

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
    await this.userEntityRepository.save(userEntity);

    return {
      total: userEntity.wallet.tibCoins,
      taskId: task.id,
    };
  }

  public async starInvoice(
    user: UserEntity,
    body: DailyStarInvoiceDto,
  ): Promise<LinkResponseDto> {
    this.logger.log('[Task] Create invoice', {
      user,
      body,
    });

    const task = await this.taskEntityRepository.findOneOrFail({
      where: {
        id: body.taskId,
      },
    });
    const details = task.details as StarInvoiceTaskDetails;
    await this.invoiceEntityRepository.delete({
      user,
      action: InvoiceAction.DAILY_STAR_INVOICE,
    });
    const [title, description] = await Promise.all([
      TelegramHelper.getTranslationText(
        user.languageCode,
        'daily-invoice-task-title',
        { rewards: task.profit.toString() },
      ),
      TelegramHelper.getTranslationText(
        user.languageCode,
        'daily-invoice-task-description',
        { amount: details.amount.toString(), rewards: task.profit.toString() },
      ),
    ]);
    const props = { taskId: task.id } as TaskCompleteProps;
    const invoice = await this.invoiceEntityRepository.save({
      amount: details.amount,
      action: InvoiceAction.DAILY_STAR_INVOICE,
      details: description,
      props,
      user,
    });
    const link = await this.telegramClient.createStarsInvoiceLink(
      title,
      invoice,
    );
    return {
      link,
    };
  }

  public async dailyStarInvoiceTaskComplete(
    invoice: InvoiceEntity,
  ): Promise<void> {
    const user = invoice.user;
    const props = invoice.props as TaskCompleteProps;
    const task = await this.taskEntityRepository.findOne({
      where: {
        id: props.taskId,
      },
    });
    user.wallet.tibCoins += task.profit;
    await this.userEntityRepository.save(user);
    await this.invoiceEntityRepository.remove(invoice);
  }
}
