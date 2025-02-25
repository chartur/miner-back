import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../entites/user.entity';
import { DataSource, Repository } from 'typeorm';
import { RefEntity } from '../../../entites/ref.entity';
import { RefsProfitDto } from '../../../core/models/dto/response/refs-profit.dto';
import moment from 'moment';
import { WalletEntity } from '../../../entites/wallet.entity';
import BigDecimal from 'js-big-decimal';
import { MyRefsDto } from '../../../core/models/dto/response/my-refs.dto';

@Injectable()
export class RefsService {
  private logger: Logger = new Logger(RefsService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userEntityRepository: Repository<UserEntity>,
    @InjectRepository(RefEntity)
    private refEntityRepository: Repository<RefEntity>,
    @InjectRepository(WalletEntity)
    private walletEntityRepository: Repository<WalletEntity>,
    private dataSource: DataSource,
  ) {}

  public async create(
    referralUser: UserEntity,
    refId: string,
  ): Promise<RefEntity> {
    this.logger.log('[Refs] create ref', {
      referralUser,
      refId,
    });

    if (!refId) {
      throw new BadRequestException();
    }

    const referrerUser = await this.userEntityRepository.findOneOrFail({
      where: {
        tUserId: refId,
      },
    });

    const ref = this.refEntityRepository.create({
      referrer: referrerUser,
      referral: referralUser,
    });

    return this.refEntityRepository.save(ref);
  }

  public async getMyRefs(userId: string): Promise<MyRefsDto> {
    this.logger.log('[Refs] get user refs', {
      userId,
    });

    let total = new BigDecimal(0);

    const refs = await this.refEntityRepository.find({
      where: {
        referrer: {
          id: userId,
        },
      },
      relations: ['referral'],
    });

    refs.forEach((ref) => {
      const bigDecimalValue = new BigDecimal(ref.revenueWithTon)
        .round(6)
        .stripTrailingZero();
      ref.revenueWithTon = parseFloat(bigDecimalValue.getValue());
      total = total.add(bigDecimalValue);
    });

    return {
      refs,
      totalRevenue: total.getValue(),
    };
  }

  public async getRefsProfit(user: UserEntity): Promise<RefsProfitDto> {
    this.logger.log('[Refs] get my profit', {
      user,
    });

    const now = moment();
    const wallet = await this.walletEntityRepository.findOneOrFail({
      where: {
        user: {
          id: user.id,
        },
      },
    });
    const lastClaimDate = moment(wallet.lastRefsClaimDateTime);
    if (lastClaimDate.add(3, 'days').isAfter(now)) {
      throw new BadRequestException();
    }

    const { total } = await this.refEntityRepository
      .createQueryBuilder('refs')
      .select('SUM(refs.nonClaimedRevenue) / 1000000 as total')
      .where('refs.referrerId = :userId', { userId: user.id })
      .getRawOne<{ total }>();

    if (!total) {
      throw new BadRequestException();
    }

    const parsedTotal = new BigDecimal(total)
      .round(6)
      .stripTrailingZero()
      .getValue();

    const users = await this.refEntityRepository
      .createQueryBuilder('refs')
      .leftJoinAndSelect('refs.referral', 'referral')
      .select([
        'referral.photoUrl as "photoUrl"',
        'referral.firstName as "firstName"',
        'referral.lastName as "lastName"',
        'COUNT(*) OVER() as "totalCount"',
      ])
      .orderBy('RANDOM()')
      .limit(3)
      .where('refs.referrerId = :userId', { userId: user.id })
      .getRawMany<Partial<UserEntity & { totalCount: number }>>();

    const moreUsersCount =
      users.length > 0 ? Number(users[0].totalCount) - users.length : 0;

    return {
      total: parsedTotal,
      users,
      moreUsersCount,
    };
  }

  public async collectRefsProfit(authUser: UserEntity): Promise<WalletEntity> {
    this.logger.log('[Refs] collect profit came from refs', {
      authUser,
    });

    let wallet = await this.walletEntityRepository.findOneOrFail({
      where: {
        user: {
          id: authUser.id,
        },
      },
    });
    const now = moment();
    const lastClaimDate = moment(wallet.lastRefsClaimDateTime);

    if (lastClaimDate.add(3, 'days').isAfter(now)) {
      throw new BadRequestException();
    }

    const { total } = await this.refEntityRepository
      .createQueryBuilder('refs')
      .select('SUM(refs.nonClaimedRevenue) as total')
      .where('refs.referrerId = :userId', { userId: authUser.id })
      .getRawOne<{ total }>();

    if (!total) {
      throw new BadRequestException();
    }

    await this.dataSource.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager
          .getRepository(RefEntity)
          .createQueryBuilder()
          .update(RefEntity)
          .set({
            revenueWithTon: () =>
              'revenueWithTon + (nonClaimedRevenue / 1000000)',
            nonClaimedRevenue: 0,
          })
          .where('referrerId = :userId', { userId: authUser.id })
          .execute();

        const tonString = new BigDecimal(total / 1000000)
          .round(6)
          .stripTrailingZero()
          .getValue();
        wallet.tons += parseFloat(tonString);
        wallet.lastRefsClaimDateTime = now.toDate();
        wallet = await transactionalEntityManager
          .getRepository(WalletEntity)
          .save(wallet);
      },
    );

    return wallet;
  }
}
