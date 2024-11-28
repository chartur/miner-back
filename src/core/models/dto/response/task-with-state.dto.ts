import { TaskEntity } from '../../../../entites/task.entity';

export class TaskWithStateDto extends TaskEntity {
  isCompleted: boolean;
}
