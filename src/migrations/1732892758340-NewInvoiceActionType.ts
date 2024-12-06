import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewInvoiceActionType1732892758340 implements MigrationInterface {
  name = 'NewInvoiceActionType1732892758340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."transactions_action_enum" RENAME TO "transactions_action_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_action_enum" AS ENUM('1', '2', '3', '4')`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "action" TYPE "public"."transactions_action_enum" USING "action"::"text"::"public"."transactions_action_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."transactions_action_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."invoices_action_enum" RENAME TO "invoices_action_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invoices_action_enum" AS ENUM('1', '2', '3', '4')`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ALTER COLUMN "action" TYPE "public"."invoices_action_enum" USING "action"::"text"::"public"."invoices_action_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."invoices_action_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."invoices_action_enum_old" AS ENUM('1', '2', '3')`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ALTER COLUMN "action" TYPE "public"."invoices_action_enum_old" USING "action"::"text"::"public"."invoices_action_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."invoices_action_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."invoices_action_enum_old" RENAME TO "invoices_action_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_action_enum_old" AS ENUM('1', '2', '3')`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "action" TYPE "public"."transactions_action_enum_old" USING "action"::"text"::"public"."transactions_action_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."transactions_action_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."transactions_action_enum_old" RENAME TO "transactions_action_enum"`,
    );
  }
}
