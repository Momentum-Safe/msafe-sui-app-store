import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock, TransactionObjectInput } from '@mysten/sui.js/transactions';
import { normalizeStructTag } from '@mysten/sui.js/utils';

// eslint-disable-next-line import/no-cycle
import { DeepBookTxBuilder } from './txbuilder';
import { ScallopUtils } from '../../models';

type ConstructorParams = {
  client: SuiClient;
  currentAddress: string;
  scallopUtils: ScallopUtils;
  accountCap?: string;
};

type CoinType = 'sui' | 'wusdc' | 'wusdt' | 'usdc';
type SwapParams = {
  tx: TransactionBlock;
  tokenObjectIn: TransactionObjectInput;
  baseCoinName: CoinType;
  quoteCoinName: CoinType;
};

export class DeepBookSwap {
  private suiClient: SuiClient;

  private scallopUtils: ScallopUtils;

  private _clientOrderId = 0;

  private _accountCap?: string;

  private currentAddress: string;

  constructor({ client, currentAddress, accountCap, scallopUtils }: ConstructorParams) {
    this.currentAddress = currentAddress;
    this.suiClient = client;
    this._accountCap = accountCap;
    this.scallopUtils = scallopUtils;
  }

  private get clientOrderId() {
    const id = this._clientOrderId;
    this._clientOrderId++;
    return id;
  }

  private async accountCap(tx: TransactionBlock) {
    if (this._accountCap) {
      return this._accountCap;
    }

    try {
      const { data: accountCapsResponse } = await this.suiClient.getOwnedObjects({
        owner: this.currentAddress,
        filter: {
          StructType: normalizeStructTag('0xdee9::custodian_v2::AccountCap'),
        },
        limit: 1,
      });

      if (accountCapsResponse.length === 0 || !accountCapsResponse[0].data) {
        // create new accountCap
        const accountCap = DeepBookTxBuilder.createAccount(tx);
        return accountCap;
      }
      return {
        objectId: accountCapsResponse[0].data.objectId,
        version: accountCapsResponse[0].data.version,
        digest: accountCapsResponse[0].data.digest,
      };
    } catch (e) {
      throw new Error('Failed to create account cap');
    }
  }

  public async swapToken({ tokenObjectIn, baseCoinName, quoteCoinName, tx }: SwapParams) {
    const accountCap = await this.accountCap(tx);
    return {
      swapResult: DeepBookTxBuilder.swap(
        tx,
        tokenObjectIn,
        baseCoinName,
        quoteCoinName,
        this.clientOrderId,
        accountCap,
        this.scallopUtils,
      ),
      accountCap,
    };
  }
}
