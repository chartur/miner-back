import { BoostLevels } from '../models/enums/boost-levels';

export const boostLevelValues = {
  [BoostLevels.USUAL]: {
    perClaim: 6250,
    perPeriod: 300000,
    perPeriodAmount: 0.3,
    amountPerSecond: 0.347,
    refCashback: 0.5,
  },
  [BoostLevels.MINI]: {
    perClaim: 72915,
    perPeriod: 3456000,
    perPeriodAmount: 3.456,
    amountPerSecond: 4.05,
    refCashback: 1,
  },
  [BoostLevels.MAJOR]: {
    perClaim: 118750,
    perPeriod: 5700000,
    perPeriodAmount: 5.7,
    amountPerSecond: 6.59,
    refCashback: 1.2,
  },
  [BoostLevels.MEGA]: {
    perClaim: 225000,
    perPeriod: 10800000,
    perPeriodAmount: 10.8,
    amountPerSecond: 12.5,
    refCashback: 1.6,
  },
};

export const periodWithSeconds = 18000;

export const tonByNonoton = 1000000;

export const unsubscribedClaimCount = 3;
