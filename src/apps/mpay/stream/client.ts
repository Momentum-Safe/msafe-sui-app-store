import { SuiClient } from '@mysten/sui.js/dist/cjs/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SUI_TYPE_ARG, normalizeStructTag, normalizeSuiAddress } from '@mysten/sui.js/utils';
import { WalletAccount } from '@mysten/wallet-standard';

import { MPayHelper } from './helper';
import { PagedStreamListIterator } from './query';
import { Stream } from './Stream';
import { MPayBuilder } from '../builder/MPayBuilder';
import { Env, EnvConfigOptions, Globals } from '../common';
import { InvalidInputError } from '../error/InvalidInputError';
import { SanityError } from '../error/SanityError';
import { getCoinsWithAmount } from '../sui/iterator/coin';
import { isSameCoinType } from '../sui/utils';
import { StreamFilterStatus } from '../types/backend';
import {
  CreateStreamInfo,
  IMPayClient,
  IPagedStreamListIterator,
  IncomingStreamQuery,
  OutgoingStreamQuery,
} from '../types/client';
import {
  CoinRequest,
  CoinRequestResponse,
  GAS_OBJECT_SPEC,
  IMSafeAccount,
  ISingleWallet,
  IWallet,
  WalletType,
} from '../types/wallet';

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

export class MSafeSingleWallet {
  constructor(private account: WalletAccount) {}

  async address(): Promise<string> {
    return this.account.address;
  }
}

export class SingleWalletAdapter implements IWallet {
  constructor(
    private readonly singleWallet: ISingleWallet,
    private readonly suiClient: SuiClient,
  ) {}

  get type() {
    return WalletType.single;
  }

  async address() {
    return this.singleWallet.address();
  }

  async requestCoins(reqs: CoinRequest[]): Promise<CoinRequestResponse[]> {
    return Promise.all(reqs.map((req) => this.requestCoin(req)));
  }

  async requestCoin(req: CoinRequest): Promise<CoinRequestResponse> {
    if (isSameCoinType(req.coinType, SUI_TYPE_ARG)) {
      return {
        primaryCoin: GAS_OBJECT_SPEC,
      };
    }
    if (req.amount <= 0) {
      throw new InvalidInputError('Invalid coin request', 'coinAmount', req.amount);
    }
    const coins = await getCoinsWithAmount(this.suiClient, await this.address(), req.amount, req.coinType);
    if (coins.length === 0) {
      throw new SanityError('no coins available');
    }
    return {
      primaryCoin: coins[0].coinObjectId,
      mergedCoins: coins.slice(1).map((coin) => coin.coinObjectId),
    };
  }
}

export class MPayClient implements IMPayClient {
  public readonly globals: Globals;

  public readonly helper: MPayHelper;

  constructor(env: Env, options?: EnvConfigOptions) {
    this.globals = Globals.new(env, options);
    this.helper = new MPayHelper(this.globals);
  }

  connectSingleWallet(wallet: ISingleWallet) {
    const adapter = new SingleWalletAdapter(wallet, this.globals.suiClient);
    this.globals.connectWallet(adapter);
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
