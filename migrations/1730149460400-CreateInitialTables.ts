import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1730149460400 implements MigrationInterface {
  name = 'CreateInitialTables1730149460400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "refs" ("id" BIGSERIAL NOT NULL, "revenueWithTon" double precision NOT NULL DEFAULT '0', "nonClaimedRevenue" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "referrerId" bigint, "referralId" bigint, CONSTRAINT "PK_27ddeeeb86cfb5057ad15746550" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "wallets" ("id" BIGSERIAL NOT NULL, "claimCount" integer NOT NULL DEFAULT '0', "tons" double precision NOT NULL DEFAULT '0', "nonotons" integer NOT NULL DEFAULT '0', "lastClaimDateTime" TIMESTAMP WITH TIME ZONE, "lastRefsClaimDateTime" TIMESTAMP WITH TIME ZONE DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" bigint, CONSTRAINT "REL_2ecdb33f23e9a6fc392025c0b9" UNIQUE ("userId"), CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "boosts" ("id" BIGSERIAL NOT NULL, "boostLevel" "public"."boosts_boostlevel_enum" NOT NULL DEFAULT 'usual', "boostActivationDate" TIMESTAMP WITH TIME ZONE, "boostExpirationDate" TIMESTAMP WITH TIME ZONE, "refPercent" double precision NOT NULL, "amountPerClaim" double precision NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" bigint, CONSTRAINT "REL_f7460e6f5e6df9ad8b4f1266e0" UNIQUE ("userId"), CONSTRAINT "PK_225335d93bbce36b48152a26b48" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" BIGSERIAL NOT NULL, "tUserId" bigint NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "photoUrl" text, "photoFileId" text, "languageCode" "public"."users_languagecode_enum" NOT NULL DEFAULT 'en', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d77cf35597b176bf85c571dcaf4" UNIQUE ("tUserId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "boost_details" ("id" SERIAL NOT NULL, "name" "public"."boost_details_name_enum" NOT NULL DEFAULT 'usual', "price" double precision NOT NULL, "perClaim" integer NOT NULL DEFAULT '0', "perPeriodClaim" integer NOT NULL, "perPeriodTonRevenue" double precision NOT NULL, "perSecondNonotonRevenue" double precision NOT NULL, "refCashback" double precision NOT NULL, "processorCount" integer NOT NULL, CONSTRAINT "UQ_8fb4c28aa51b8e7756e7af21187" UNIQUE ("name"), CONSTRAINT "PK_3429b54b5373563f8c45114718f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "refs" ADD CONSTRAINT "FK_cb76b16173d3a1c925dcfe8c5f7" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refs" ADD CONSTRAINT "FK_ba66a5dd38f52d1607db14d3f5d" FOREIGN KEY ("referralId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "boosts" ADD CONSTRAINT "FK_f7460e6f5e6df9ad8b4f1266e0c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "boosts" DROP CONSTRAINT "FK_f7460e6f5e6df9ad8b4f1266e0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refs" DROP CONSTRAINT "FK_ba66a5dd38f52d1607db14d3f5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refs" DROP CONSTRAINT "FK_cb76b16173d3a1c925dcfe8c5f7"`,
    );
    await queryRunner.query(`DROP TABLE "boost_details"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "boosts"`);
    await queryRunner.query(`DROP TABLE "wallets"`);
    await queryRunner.query(`DROP TABLE "refs"`);
  }
}
