import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasksTable1732103531640 implements MigrationInterface {
  name = 'CreateTasksTable1732103531640';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "profit" integer NOT NULL, "link" character varying, "icon" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users_completed_tasks_tasks" ("usersId" bigint NOT NULL, "tasksId" integer NOT NULL, CONSTRAINT "PK_0cefa0cae8e7088cb2a0c1df0f6" PRIMARY KEY ("usersId", "tasksId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a78050bd596f40c7ce970ae756" ON "users_completed_tasks_tasks" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4e897e6437ad48928be5932c61" ON "users_completed_tasks_tasks" ("tasksId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "tibCoins" bigint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_completed_tasks_tasks" ADD CONSTRAINT "FK_a78050bd596f40c7ce970ae7568" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
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
      `ALTER TABLE "users_completed_tasks_tasks" DROP CONSTRAINT "FK_a78050bd596f40c7ce970ae7568"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`,
    );
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "tibCoins"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4e897e6437ad48928be5932c61"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a78050bd596f40c7ce970ae756"`,
    );
    await queryRunner.query(`DROP TABLE "users_completed_tasks_tasks"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
