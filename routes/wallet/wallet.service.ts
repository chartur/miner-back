import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { WalletEntity } from '../../entites/wallet.entity';
import { UserEntity } from '../../entites/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import {
  boostLevelValues,
  periodWithSeconds,
  tonByNonoton,
} from '../../core/constants/boost-level-values';
import { BoostLevels } from '../../core/models/enums/boost-levels';
import { BoostEntity } from '../../entites/boost.entity';

@Injectable()
export class WalletService {
  private logger: Logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(WalletEntity)
    private walletEntityRepository: Repository<WalletEntity>,
    @InjectRepository(BoostEntity)
    private boostEntityRepository: Repository<BoostEntity>,
  ) {}

  public async getMyWallet(authUser: UserEntity): Promise<WalletEntity> {
    this.logger.log('[Wallet] get my wallet', {
      authUser,
    });
    return this.walletEntityRepository.findOne({
      where: {
        user: {
          id: authUser.id,
        },
      },
    });
  }

  public async claim(authUser: UserEntity): Promise<WalletEntity> {
    const wallet = await this.walletEntityRepository.findOne({
      where: {
        user: {
          id: authUser.id,
        },
      },
    });

    const now = moment();
    if (!wallet.lastClaimDateTime) {
      wallet.lastClaimDateTime = now.toDate();
      return this.walletEntityRepository.save(wallet);
    }

    if (
      wallet.lastClaimDateTime &&
      now.diff(moment(wallet.lastClaimDateTime), 'hours') < 5
    ) {
      throw new HttpException(
        {
          message: 'you can not claim your profit before 5 hours',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let amount = 0;
    let seconds = periodWithSeconds;
    const walletLastClaimedDate = moment(wallet.lastClaimDateTime);
    const boost = await this.boostEntityRepository.findOne({
      where: {
        user: {
          id: authUser.id,
        },
      },
    });
    if (boost) {
      const boostLevel = boost.boostLevel;
      const boostValues = boostLevelValues[boostLevel];
      const boostExpirationMoment = moment(boost.boostExpirationDate);
      if (boostExpirationMoment.isBefore(now)) {
        const boostSeconds = boostExpirationMoment.diff(
          walletLastClaimedDate,
          'seconds',
        );
        amount = boostValues.amountPerSecond * boostSeconds;
        seconds -= boostSeconds;
      } else {
        amount = boostValues.amountPerSecond * seconds;
      }
    } else {
      const boostValues = boostLevelValues[BoostLevels.USUAL];
      amount = boostValues.amountPerSecond * seconds;
    }

    wallet.lastClaimDateTime = now.toDate();
    const tonValue = amount / tonByNonoton + wallet.tons;
    wallet.tons = Number(tonValue.toFixed(7));
    return this.walletEntityRepository.save(wallet);
  }
}
