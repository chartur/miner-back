import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserSettingsTableAndUserDeleteCascades1732886932139
  implements MigrationInterface
{
  name = 'CreateUserSettingsTableAndUserDeleteCascades1732886932139';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refs" DROP CONSTRAINT "FK_ba66a5dd38f52d1607db14d3f5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refs" DROP CONSTRAINT "FK_cb76b16173d3a1c925dcfe8c5f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "boosts" DROP CONSTRAINT "FK_f7460e6f5e6df9ad8b4f1266e0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_settings" ("id" BIGSERIAL NOT NULL, "claimNotificationEnabled" boolean NOT NULL DEFAULT false, "claimNotificationExpiration" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" bigint, CONSTRAINT "REL_986a2b6d3c05eb4091bb8066f7" UNIQUE ("userId"), CONSTRAINT "PK_00f004f5922a0744d174530d639" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "refs" ADD CONSTRAINT "FK_cb76b16173d3a1c925dcfe8c5f7" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refs" ADD CONSTRAINT "FK_ba66a5dd38f52d1607db14d3f5d" FOREIGN KEY ("referralId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "boosts" ADD CONSTRAINT "FK_f7460e6f5e6df9ad8b4f1266e0c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "boosts" DROP CONSTRAINT "FK_f7460e6f5e6df9ad8b4f1266e0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refs" DROP CONSTRAINT "FK_ba66a5dd38f52d1607db14d3f5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refs" DROP CONSTRAINT "FK_cb76b16173d3a1c925dcfe8c5f7"`,
    );
    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "boosts" ADD CONSTRAINT "FK_f7460e6f5e6df9ad8b4f1266e0c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refs" ADD CONSTRAINT "FK_cb76b16173d3a1c925dcfe8c5f7" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refs" ADD CONSTRAINT "FK_ba66a5dd38f52d1607db14d3f5d" FOREIGN KEY ("referralId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
