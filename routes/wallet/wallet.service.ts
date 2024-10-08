import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { WalletEntity } from '../../entites/wallet.entity';
import { UserEntity } from '../../entites/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import * as numeral from 'numeral';
import {
  boostLevelValues,
  periodWithSeconds,
  tonByNonoton,
  unsubscribedClaimCount,
} from '../../core/constants/boost-level-values';
import { BoostLevels } from '../../core/models/enums/boost-levels';
import { BoostEntity } from '../../entites/boost.entity';
import { TelegramService } from '../../shared/services/telegram.service';
import { HttpFailureActionTypes } from '../../core/models/enums/http-failure-action-types';
import { GetCurrencyRateDtoResponse } from '../../core/models/dto/response/get-currency-rate.dto.response';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WalletService {
  private logger: Logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(WalletEntity)
    private walletEntityRepository: Repository<WalletEntity>,
    @InjectRepository(BoostEntity)
    private boostEntityRepository: Repository<BoostEntity>,
    private telegramService: TelegramService,
    private httpService: HttpService,
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

    if (wallet.claimCount >= unsubscribedClaimCount) {
      const isSubscribed =
        await this.telegramService.isUserSubscribedToCommunityChannel(
          authUser.tUserId,
        );
      if (!isSubscribed) {
        throw new HttpException(
          {
            action: HttpFailureActionTypes.NEED_TO_SUBSCRIBE_CHANNEL,
            message:
              'To continue claim you profit you need to be subscribed our community channel',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

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
          action: HttpFailureActionTypes.CLAIM_BEFORE_EXPECTED_TIME,
          message: 'You can not claim your profit before 5 hours',
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

    wallet.claimCount++;
    wallet.lastClaimDateTime = now.toDate();
    const tonValue = amount / tonByNonoton + wallet.tons;
    wallet.tons = Number(numeral(tonValue).format('0.0000'));
    return this.walletEntityRepository.save(wallet);
  }

  public getRates(): Promise<GetCurrencyRateDtoResponse | { error: string }> {
    return firstValueFrom(
      this.httpService.get<GetCurrencyRateDtoResponse>(
        process.env.GET_CURRENCY_RATE_LINK,
      ),
    ).then((res) => res.data);
  }
}
