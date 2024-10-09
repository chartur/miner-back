import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entites/user.entity';
import { Repository } from 'typeorm';
import { RefEntity } from '../../entites/ref.entity';
import { RefsProfitDto } from '../../core/models/dto/response/refs-profit.dto';
import * as moment from 'moment';

@Injectable()
export class RefsService {
  private logger: Logger = new Logger(RefsService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userEntityRepository: Repository<UserEntity>,
    @InjectRepository(RefEntity)
    private refEntityRepository: Repository<RefEntity>,
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

  public getMyRefs(userId: string): Promise<RefEntity[]> {
    this.logger.log('[Refs] get user refs', {
      userId,
    });

    return this.refEntityRepository.find({
      where: {
        referrer: {
          id: userId,
        },
      },
      relations: ['referral'],
    });
  }

  public async getRefsProfit(user: UserEntity): Promise<RefsProfitDto> {
    this.logger.log('[Refs] get my profit', {
      user,
    });

    const now = moment();
    const lastClaimDate = moment(user.wallet.lastRefsClaimDateTime);
    if (lastClaimDate.add(1, 'weeks').isAfter(now)) {
      throw new BadRequestException();
    }

    const { total } = await this.refEntityRepository
      .createQueryBuilder('refs')
      .select('SUM(refs.nonClaimedRevenue) as total')
      .where('refs.referrerId = :userId', { userId: user.id })
      .getRawOne<{ total }>();

    if (total == 0) {
      throw new BadRequestException();
    }

    const users = await this.refEntityRepository
      .createQueryBuilder('refs')
      .leftJoinAndSelect('refs.referral', 'referral')
      .addSelect('referral.photoUrl', 'photoUrl')
      .addSelect('referral.firstName', 'firstName')
      .addSelect('referral.lastName', 'lastName')
      .addSelect('COUNT(*) OVER()', 'totalCount')
      .orderBy('RANDOM()') // Use RAND() for MySQL
      .limit(3)
      .where('refs.referrerId = :userId', { userId: user.id })
      .getRawMany<Partial<UserEntity & { totalCount: number }>>();

    const moreUsersCount =
      users.length > 0 ? Number(users[0].totalCount) - users.length : 0;
    return { total, users, moreUsersCount } as any;
  }
}
