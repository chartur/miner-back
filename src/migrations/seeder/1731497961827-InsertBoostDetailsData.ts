import { MigrationInterface, QueryRunner } from 'typeorm';
import { BoostLevels } from '../../core/models/enums/boost-levels';
import { BoostDetails } from '../../entites/boost-details';

export class InsertBoostDetailsData1731497961827 implements MigrationInterface {
  name = 'InsertBoostDetailsData1731497961827';

  private boostLevelValues = {
    [BoostLevels.USUAL]: {
      name: BoostLevels.USUAL,
      perClaim: 6250,
      perPeriodClaim: 300000,
      perPeriodTonRevenue: 0.3,
      perSecondNonotonRevenue: 0.347,
      refCashback: 0.5,
      price: 0,
      processorCount: 1,
    },
    [BoostLevels.MINI]: {
      name: BoostLevels.MINI,
      perClaim: 72915,
      perPeriodClaim: 3456000,
      perPeriodTonRevenue: 3.456,
      perSecondNonotonRevenue: 4.05,
      refCashback: 1,
      price: 3,
      processorCount: 2,
    },
    [BoostLevels.MAJOR]: {
      name: BoostLevels.MAJOR,
      perClaim: 118750,
      perPeriodClaim: 5700000,
      perPeriodTonRevenue: 5.7,
      perSecondNonotonRevenue: 6.59,
      refCashback: 1.3,
      price: 5,
      processorCount: 3,
    },
    [BoostLevels.MEGA]: {
      name: BoostLevels.MEGA,
      perClaim: 225000,
      perPeriodClaim: 10800000,
      perPeriodTonRevenue: 10.8,
      perSecondNonotonRevenue: 12.5,
      refCashback: 1.6,
      price: 10,
      processorCount: 4,
    },
  };
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.manager.getRepository(BoostDetails);
    const entities: BoostDetails[] = repo.create(
      Object.values(this.boostLevelValues) as BoostDetails[],
    );
    await repo.save(entities);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE boost_details;`);
  }
}
