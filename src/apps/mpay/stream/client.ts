import { TransactionBlock } from '@mysten/sui.js/transactions';
import { normalizeStructTag, normalizeSuiAddress } from '@mysten/sui.js/utils';

import { MPayHelper } from './helper';
import { PagedStreamListIterator } from './query';
import { Stream } from './Stream';
import { MPayBuilder } from '../builder/MPayBuilder';
import { Globals, Env, EnvConfigOptions } from '../common';
import { StreamFilterStatus } from '../types/backend';
import {
  IMPayClient,
  CreateStreamInfo,
  IncomingStreamQuery,
  IPagedStreamListIterator,
  OutgoingStreamQuery,
} from '../types/client';
import { CoinRequest, CoinRequestResponse, IWallet, WalletType, IMSafeAccount } from '../types/wallet';

export class MSafeAccountAdapter implements IWallet {
  constructor(private readonly msafe: IMSafeAccount) {}

  get type() {
    return WalletType.msafe;
  }

  async address() {
    return this.msafe.address();
  }

  async requestCoins(reqs: CoinRequest[]): Promise<CoinRequestResponse[]> {
    return this.msafe.requestCoins(reqs);
  }
}

export class MPayClient implements IMPayClient {
  public readonly globals: Globals;

  public readonly helper: MPayHelper;

  constructor(env: Env, options?: EnvConfigOptions) {
    this.globals = Globals.new(env, options);
    this.helper = new MPayHelper(this.globals);
  }

  connectMSafeAccount(msafe: IMSafeAccount) {
    const adapter = new MSafeAccountAdapter(msafe);
    this.globals.connectWallet(adapter);
  }

  async createStream(info: CreateStreamInfo): Promise<TransactionBlock> {
    return this.builder().createStreams(info);
  }

  async getStream(streamId: string) {
    return Stream.new(this.globals, streamId);
  }

  async getIncomingStreams(query?: IncomingStreamQuery, pageSize = 10): Promise<IPagedStreamListIterator> {
    return PagedStreamListIterator.newIncoming({
      globals: this.globals,
      query,
      pageSize,
    });
  }

  async getOutgoingStreams(query?: OutgoingStreamQuery, pageSize = 10): Promise<IPagedStreamListIterator> {
    return PagedStreamListIterator.newOutgoing({
      globals: this.globals,
      query,
      pageSize,
    });
  }

  async getCoinTypesForStreamFilter(): Promise<string[]> {
    const address = await this.wallet.address();
    const coinTypes = await this.globals.backend.getAllCoinTypes(address);
    return coinTypes.map((coinType) => normalizeStructTag(coinType));
  }

  async getRecipientsForStreamFilter(options?: StreamFilterStatus): Promise<string[]> {
    const address = await this.wallet.address();
    const recipients = await this.globals.backend.getAllRecipients(address, options);
    return recipients.map((recipient) => normalizeSuiAddress(recipient));
  }

  async getCreatorsForStreamFilter(options?: StreamFilterStatus): Promise<string[]> {
    const address = await this.wallet.address();
    const creators = await this.globals.backend.getAllSenders(address, options);
    return creators.map((creator) => normalizeSuiAddress(creator));
  }

  get wallet() {
    return this.globals.wallet;
  }

  private builder() {
    return new MPayBuilder(this.globals);
  }
}
