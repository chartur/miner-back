import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingsEntity } from '../../entites/settings.entity';
import { Repository } from 'typeorm';
import { ParsedTransaction } from '../../core/models/classes/parsed-transaction';
import { SettingsTransactionDetails } from '../../core/models/interfaces/settings-transaction-details';

@Injectable()
export class SettingsService implements OnModuleInit {
  private logger = new Logger(SettingsService.name);
  private _settings: SettingsEntity;

  constructor(
    @InjectRepository(SettingsEntity)
    private settingsEntityRepository: Repository<SettingsEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.init();
  }

  public async updateLastTransaction(
    tx: ParsedTransaction,
  ): Promise<SettingsEntity> {
    this.logger.log('[SettingsService] update last transaction', {
      lastTransactionHash: tx.hash,
      lastTransactionLT: tx.lt,
    });

    try {
      this._settings = await this.settingsEntityRepository.save({
        ...this._settings,
        lastTransactionHash: tx.hash,
        lastTransactionLT: tx.lt,
      });
      return this._settings;
    } catch (error) {
      this.logger.log('[SettingsService] Failure: update last transaction', {
        error,
        lastTransactionHash: tx.hash,
        lastTransactionLT: tx.lt,
      });
    }
  }

  public get lastTransactionDetails(): SettingsTransactionDetails | null {
    if (
      !this._settings.lastTransactionHash ||
      !this._settings.lastTransactionLT
    ) {
      return null;
    }

    return {
      hash: this._settings.lastTransactionHash,
      lt: this._settings.lastTransactionLT,
    };
  }

  private async init(): Promise<void> {
    this._settings = await this.settingsEntityRepository.findOne({
      where: {},
    });
    if (!this._settings) {
      this._settings = await this.settingsEntityRepository.save({});
    }
  }
}
