import { MigrationInterface, QueryRunner } from 'typeorm';

export class TasksTableUUID1732717575962 implements MigrationInterface {
  name = 'TasksTableUUID1732717575962';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" DROP CONSTRAINT "FK_4e897e6437ad48928be5932c61a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" DROP CONSTRAINT "PK_0cefa0cae8e7088cb2a0c1df0f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" ADD CONSTRAINT "PK_a78050bd596f40c7ce970ae7568" PRIMARY KEY ("usersId")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4e897e6437ad48928be5932c61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" DROP COLUMN "tasksId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" ADD "tasksId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" DROP CONSTRAINT "PK_a78050bd596f40c7ce970ae7568"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" ADD CONSTRAINT "PK_0cefa0cae8e7088cb2a0c1df0f6" PRIMARY KEY ("usersId", "tasksId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4e897e6437ad48928be5932c61" ON "users_completed_tasks_tasks" ("tasksId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" ADD CONSTRAINT "FK_4e897e6437ad48928be5932c61a" FOREIGN KEY ("tasksId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" DROP CONSTRAINT "FK_4e897e6437ad48928be5932c61a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4e897e6437ad48928be5932c61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" DROP CONSTRAINT "PK_0cefa0cae8e7088cb2a0c1df0f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" ADD CONSTRAINT "PK_a78050bd596f40c7ce970ae7568" PRIMARY KEY ("usersId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" DROP COLUMN "tasksId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" ADD "tasksId" integer NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4e897e6437ad48928be5932c61" ON "users_completed_tasks_tasks" ("tasksId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" DROP CONSTRAINT "PK_a78050bd596f40c7ce970ae7568"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" ADD CONSTRAINT "PK_0cefa0cae8e7088cb2a0c1df0f6" PRIMARY KEY ("tasksId", "usersId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" ADD CONSTRAINT "FK_4e897e6437ad48928be5932c61a" FOREIGN KEY ("tasksId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
