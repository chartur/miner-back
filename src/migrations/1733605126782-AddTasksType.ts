import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTasksType1733605126782 implements MigrationInterface {
  name = 'AddTasksType1733605126782';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_action_enum" AS ENUM('0', '1', '3')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "action" "public"."tasks_action_enum" NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "details" json`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "details"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "action"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_action_enum"`);
  }
}
