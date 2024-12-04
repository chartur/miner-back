import { Transaction } from '@ton/ton';
import { TransactionEntity } from '../../../entites/transaction.entity';
import { fromNano } from 'ton';
import moment, { Moment } from 'moment';
import { validate as isUUID } from 'uuid';
import { UserEntity } from '../../../entites/user.entity';
import { InvoiceAction } from '../enums/invoice-action';
import { InvoiceEntity } from '../../../entites/invoice.entity';
import { WalletService } from '../../../routes/wallet/wallet.service';
import { BoostService } from '../../../routes/boost/boost.service';
import { WalletEntity } from '../../../entites/wallet.entity';
import { Markup } from 'telegraf';
import { BoostLevels } from '../enums/boost-levels';
import { TelegramClient } from '../../../clients/telegram.client';
import { TelegramHelper } from '../../../utils/telegram.helper';

export class ParsedTransaction {
  private _invoiceId?: string;
  private _user?: UserEntity;
  private _action?: InvoiceAction;
  private _invoice?: InvoiceEntity;

  constructor(
    private tx: Transaction,
    private walletService: WalletService,
    private boostService: BoostService,
    private telegramClient: TelegramClient,
  ) {
    this.init();
  }

  public get isValid(): boolean {
    return (
      !!this.invoiceId &&
      this.tx.outMessagesCount === 0 &&
      !!this.tx.inMessage.info.src
    );
  }

  public get amount(): number {
    return parseFloat(fromNano((this.tx.inMessage.info as any).value.coins));
  }

  public get hash(): string {
    return this.tx.hash().toString('base64');
  }

  public get lt(): string {
    return this.tx.lt.toString();
  }

  public get invoiceId(): string | undefined {
    return this._invoiceId;
  }

  public get user(): UserEntity | undefined {
    return this._user;
  }

  public attachInvoice(invoice: InvoiceEntity): void {
    this._invoice = invoice;
    this._user = invoice.user;
    this._action = invoice.action;
  }

  public async claim(now: Moment): Promise<WalletEntity> {
    return this.walletService.claimFunc(this.user, this.user.wallet, now);
  }

  public async activate(now: Moment): Promise<void> {
    if (this.user.lastBoost) {
      now = moment(this.user.lastBoost.boostExpirationDate);
    }
    return this.boostService
      .activate(this.user, this._invoice.action, now)
      .then((boost) => {
        return this.sendSuccessActivationMessage(boost.boostLevel);
      });
  }

  public async sendSuccessActivationMessage(
    boostLevel: BoostLevels,
  ): Promise<void> {
    const user = this.user;
    if (!user) {
      return;
    }
    const text = await TelegramHelper.getTranslationText(
      user.languageCode,
      `${boostLevel}-boost-activation`,
    );
    return this.telegramClient.sendMessage({
      chatId: user.tUserId,
      text: text,
      photoUrl: this.getBoostsActivationImage(boostLevel),
      buttons: Markup.inlineKeyboard([
        Markup.button.webApp('💸 Play', TelegramHelper.getAppUrl().toString()),
      ]),
    });
  }

  public getDataForSave(): Partial<TransactionEntity> {
    return {
      hash: this.hash,
      lt: this.lt,
      amountWithTon: this.amount,
      action: this._action,
      fee: parseFloat(fromNano(this.tx.totalFees.coins)),
      fromAddress: this.tx.inMessage.info.src.toString(),
      payload: this.invoiceId,
      paidAt: moment((this.tx.inMessage.info as any).createdAt * 1000).toDate(),
      user: this.user,
    };
  }

  private init(): void {
    if (
      this.tx.outMessagesCount > 0 ||
      !this.tx.inMessage.body.bits.length ||
      !this.tx.inMessage.info.src.toString()
    ) {
      return;
    }

    const payloadCeil = this.tx.inMessage.body.beginParse().clone();
    payloadCeil.loadUint(32);
    const payloadString = Buffer.from(payloadCeil.loadStringTail()).toString(
      'utf8',
    );
    if (isUUID(payloadString)) {
      this._invoiceId = payloadString;
    }
  }

  private getBoostsActivationImage(boost: BoostLevels): string {
    switch (boost) {
      case BoostLevels.MINI:
        return 'https://drive.google.com/uc?export=view&id=18rxuDL4Ztm5vG3A9a2umpRBcqTO0a5v8';
      case BoostLevels.MAJOR:
        return 'https://drive.google.com/uc?export=view&id=1woRzyrg3TDsA5jR6LQL-deZ9rv3VrLfl';
      case BoostLevels.MEGA:
        return 'https://drive.google.com/uc?export=view&id=18t-SIYH_CqMjz-EEGJQSx7p3H6Eh4Sph';
    }
  }
}
