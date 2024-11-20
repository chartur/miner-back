import { MigrationInterface, QueryRunner } from 'typeorm';
import { TaskEntity } from '../../entites/task.entity';

export class InsertTasksData1732103634415 implements MigrationInterface {
  public tasks: any = [
    {
      title: 'Join community',
      description:
        'Connect directly with our community on Telegram! Get instant notifications, chat with like-minded individuals, and be the first to know about exciting news and updates.',
      profit: 1000,
      link: process.env.TELEGRAM_COMMUNITY_CHANNEL_LINK,
      icon: './assets/tasks/icon-telegram.png',
    },
    {
      title: 'Subscribe channel',
      description:
        'Stay updated and inspired! Subscribe to our YouTube channel for the latest videos, tutorials, and exclusive content tailored just for you!',
      profit: 750,
      link: 'https://www.youtube.com',
      icon: './assets/tasks/icon-youtube.png',
    },
    {
      name: 'X',
      title: 'Follow us on X',
      description:
        'Join our community on X for real-time updates, insights, and conversations! Follow us to stay connected and never miss out on the latest buzz.',
      isComplete: false,
      profit: 500,
      link: 'https://x.com/',
      icon: './assets/tasks/icon-x.png',
    },
    {
      title: 'Follow us on instagram',
      description:
        'Follow us on instagram to stay connected and never miss out on the latest updates',
      isComplete: true,
      profit: 500,
      link: 'https://www.instagram.com/',
      icon: './assets/tasks/icon-instagram.png',
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.manager.getRepository(TaskEntity);
    const entities: TaskEntity[] = repo.create(this.tasks);
    await repo.save(entities);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE ${TaskEntity.name}`);
  }
}
