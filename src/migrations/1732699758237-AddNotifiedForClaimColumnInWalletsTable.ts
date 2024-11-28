import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotifiedForClaimColumnInWalletsTable1732699758237
  implements MigrationInterface
{
  name = 'AddNotifiedForClaimColumnInWalletsTable1732699758237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "notifiedForClaim" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP COLUMN "notifiedForClaim"`,
    );
  }
}
