import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from '../../entites/transaction.entity';
import { AppTonClient } from '../../shared/services/app-ton-client.service';
import { Repository, In, DataSource } from 'typeorm';
import { Transaction } from '@ton/ton';
import { sleep } from '../../utils/sleep';
import { AxiosError } from 'axios';
import { ParsedTransaction } from '../models/classes/parsed-transaction';
import { GetTransactionsDto } from '../models/interfaces/get-transaction-dto';
import { SettingsService } from '../../shared/services/settings.service';
import { InvoiceEntity } from '../../entites/invoice.entity';
import { WalletService } from '../../routes/wallet/wallet.service';
import { UserEntity } from '../../entites/user.entity';
import moment from 'moment';
import { BoostService } from '../../routes/boost/boost.service';
import { TelegramClient } from '../../clients/telegram.client';
import { MasterInstance } from "pm2-master-process";

@Injectable()
export class TransactionsCron {
  private logger = new Logger(TransactionsCron.name);
  static isJobRunning: boolean = false;

  constructor(
    @InjectRepository(TransactionEntity)
    private transactionEntityRepository: Repository<TransactionEntity>,
    @InjectRepository(InvoiceEntity)
    private invoiceEntityRepository: Repository<InvoiceEntity>,
    @InjectRepository(UserEntity)
    private userEntityRepository: Repository<UserEntity>,
    private dataSource: DataSource,
    private appTonClient: AppTonClient,
    private settingsService: SettingsService,
    private walletService: WalletService,
    private boostService: BoostService,
    private telegramClient: TelegramClient,
  ) {}

  @Cron('*/3 * * * *')
  // @Cron(CronExpression.EVERY_5_SECONDS)
  @MasterInstance()
  async handleCron(): Promise<void> {
    if (TransactionsCron.isJobRunning) {
      this.logger.log(
        '[TransactionsCron] Previous job is still running, skipping this run.',
      );
      return;
    }
    this.logger.log('[TransactionsCron] start');

    TransactionsCron.isJobRunning = true;

    try {
      const lastTransactionDetails =
        await this.settingsService.lastTransactionDetails;
      const transactions: ParsedTransaction[] = await this.getTransactions({
        lastTransactionLT: lastTransactionDetails?.lt,
        lastTransactionHash: lastTransactionDetails?.hash,
        limit: 20,
        transactionsMap: [],
      });

      if (transactions.length > 0) {
        const invoiceTransactionMap: {
          [invoiceId: string]: ParsedTransaction;
        } = transactions.reduce((accumulator, tx) => {
          accumulator[tx.invoiceId] = tx;
          return accumulator;
        }, {});

        const invoiceEntities = await this.invoiceEntityRepository.find({
          where: {
            id: In(Object.keys(invoiceTransactionMap)),
          },
          relations: {
            user: {
              wallet: true,
              boosts: true,
            },
          },
        });

        if (!invoiceEntities.length) {
          this.logger.log(
            '[TransactionCron] There are no any transactions to proceed',
          );
          if (transactions.length > 0) {
            const lastTransaction = transactions[transactions.length - 1];
            await this.settingsService.updateLastTransaction(lastTransaction);
          }
          return;
        }

        const cronDataMap: { [invoiceId: string]: ParsedTransaction } =
          invoiceEntities.reduce((accumulator, inv) => {
            const tx = invoiceTransactionMap[inv.id];
            if (tx.amount === inv.amount) {
              tx.attachInvoice(inv);
              accumulator[inv.id] = tx;
            }
            return accumulator;
          }, {});

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
          const transactionsData = Object.values(cronDataMap).map(
            (transaction) => {
              const entity = this.transactionEntityRepository.create(
                transaction.getDataForSave(),
              );
              entity.user = transaction.user;
              return entity;
            },
          );

          this.logger.log(
            '[TransactionCron] new transactions in process to be handled',
            {
              transactions: transactionsData,
            },
          );

          await this.transactionEntityRepository.save(transactionsData);

          const transactions = Object.values(cronDataMap);
          const now = moment();
          await Promise.all(
            transactions.map((transaction) => transaction.claim(now)),
          );
          await Promise.all(
            transactions.map((transaction) => transaction.activate(now)),
          );

          await this.invoiceEntityRepository.delete({
            id: In(Object.keys(cronDataMap)),
          });
          const lastTransaction = transactions[transactions.length - 1];
          await this.settingsService.updateLastTransaction(lastTransaction);

          await queryRunner.commitTransaction();
        } catch (error) {
          this.logger.error(
            '[TransactionCron] Can not save transactions in DB',
            {
              error,
            },
          );
          await queryRunner.rollbackTransaction();
        } finally {
          await queryRunner.release();
        }
      } else {
        this.logger.log(
          '[TransactionCron] There are no any transactions to proceed',
        );
      }
    } catch (error) {
      this.logger.error('[TransactionCron] Handler error', {
        error,
      });
    } finally {
      TransactionsCron.isJobRunning = false;
    }
  }

  private async getTransactions(
    dto: GetTransactionsDto,
  ): Promise<ParsedTransaction[]> {
    const {
      limit,
      lastTransactionLT,
      lastTransactionHash,
      fromLT,
      transactionsMap,
    } = dto;
    try {
      const transactions: Transaction[] =
        await this.appTonClient.getTransactions({
          limit,
          to_lt: lastTransactionLT,
          lt: fromLT,
          hash: lastTransactionHash,
          archival: true,
        });
      const filteredTransactions = transactions
        .reverse()
        .map(
          (tx) =>
            new ParsedTransaction(
              tx,
              this.walletService,
              this.boostService,
              this.telegramClient,
            ),
        )
        .filter((tx) => tx.isValid);
      transactionsMap.unshift(...filteredTransactions);

      if (transactions.length === limit) {
        await sleep(3000);
        return await this.getTransactions({
          limit,
          transactionsMap,
          lastTransactionLT,
          lastTransactionHash: transactions[limit - 1]
            .hash()
            .toString('base64'),
          fromLT: transactions[limit - 1].lt.toString(),
        });
      }
      return transactionsMap;
    } catch (error) {
      if (error instanceof AxiosError && error.status === 500) {
        this.logger.log('[TransactionsCron] recalled to get transactions', {
          dto: {
            ...dto,
            transactionsMap: undefined,
          },
          error: {
            code: error.status,
            message: error.message,
          },
        });
        await sleep(3000);
        return await this.getTransactions(dto);
      }
      this.logger.error('[TransactionsCron] get transactions failure', {
        error,
      });
      return [];
    }
  }
}
