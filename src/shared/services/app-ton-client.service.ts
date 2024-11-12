import { Address, TonClient, Transaction } from '@ton/ton';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { TonClientParameters } from '@ton/ton';

export type AppTonClientParameters = TonClientParameters & {
  address: string;
};

@Injectable()
export class AppTonClient extends TonClient {
  private readonly _props: AppTonClientParameters;
  private readonly _address: Address;

  constructor(
    private httpService: HttpService,
    props: AppTonClientParameters,
  ) {
    super(props);
    this._props = props;
    this._address = Address.parse(this._props.address);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  getTransactions(opts: {
    limit: number;
    lt?: string;
    hash?: string;
    to_lt?: string;
    inclusive?: boolean;
    archival?: boolean;
  }): Promise<Transaction[]> {
    return super.getTransactions(this._address, opts);
  }
}
