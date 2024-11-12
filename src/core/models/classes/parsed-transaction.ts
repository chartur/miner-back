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
import { TelegramService } from '../../../shared/services/telegram.service';
import { Markup } from 'telegraf';

export class ParsedTransaction {
  private _invoiceId?: string;
  private _user?: Promise<UserEntity>;
  private _action?: InvoiceAction;
  private _invoice?: InvoiceEntity;

  constructor(
    private tx: Transaction,
    private walletService: WalletService,
    private boostService: BoostService,
    private telegramService: TelegramService,
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

  public get user(): Promise<UserEntity> | undefined {
    return this._user;
  }

  public attachInvoice(invoice: InvoiceEntity): void {
    this._invoice = invoice;
    this._user = invoice.user;
    this._action = invoice.action;
  }

  public async claim(now: Moment): Promise<WalletEntity> {
    const user = await this._invoice.user;
    return this.walletService.claimFunc(user, user.wallet, now);
  }

  public async activate(now: Moment): Promise<void> {
    const user = await this._invoice.user;
    if (user.lastBoost) {
      now = moment(user.lastBoost.boostExpirationDate);
    }
    return this.boostService
      .activate(user, this._invoice.action, now)
      .then(() => {
        return this.sendSuccessActivationMessage();
      });
  }

  public async sendSuccessActivationMessage(): Promise<void> {
    const user = await this.user;
    return this.telegramService
      .sendMessage({
        chatId: user.tUserId,
        text: 'Your boost successfully activated. Please enjoy!',
        photoUrl:
          'https://cdn3d.iconscout.com/3d/premium/thumb/boost-marketing-3d-icon-download-in-png-blend-fbx-gltf-file-formats--financial-startup-launch-business-digital-pack-icons-8580010.png?f=webp',
        buttons: Markup.inlineKeyboard([
          Markup.button.webApp(
            '💸Play',
            this.telegramService.getAppUrl().toString(),
          ),
        ]),
      })
      .then();
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
}
