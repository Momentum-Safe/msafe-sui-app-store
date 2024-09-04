import { PaginatedCoins } from '@mysten/sui.js/client';
import { Transaction, TransactionObjectArgument } from '@mysten/sui.js/transactions';
import { TurbosSdk, unstable_getObjectId } from 'turbos-clmm-sdk';
import { deepbookConfig } from '../config';

type CoinData = PaginatedCoins['data'];

export class SuiKit {
  constructor(public readonly turbosSdk: TurbosSdk) {}

  async getCoinsData(currentAddress: string, type: string, amount: number): Promise<CoinData> {
    const coinObjects: CoinData = [];
    let coinFields: PaginatedCoins | undefined;
    do {
      coinFields = await this.turbosSdk.provider.getCoins({
        owner: currentAddress,
        coinType: type,
        cursor: coinFields?.nextCursor,
      });
      coinObjects.push(...coinFields.data);
    } while (coinFields.hasNextPage);

    const resultCoinObjects: CoinData = [];
    let currentBalance = 0;
    coinObjects
      .sort((coinA, coinB) => Number(coinB.balance) - Number(coinA.balance))
      .some((object) => {
        if (currentBalance >= amount) {
          return true;
        } else {
          currentBalance += Number(object.balance);
          resultCoinObjects.push(object);
          return false;
        }
      });
    return resultCoinObjects;
  }

  splitAndMergeCoin(
    coins: CoinData | undefined,
    amount: number,
    txb: Transaction,
  ): [TransactionObjectArgument | undefined, TransactionObjectArgument | undefined] {
    if (!coins || coins.length < 1) {
      return [undefined, undefined];
    }

    if (this.isSuiCoinAddress(coins[0]!.coinType)) {
      const [sendCoin] = txb.splitCoins(txb.gas, [txb.pure(amount)]);
      return [sendCoin, undefined];
    }

    const mergeCoin = txb.object(coins[0]!.coinObjectId);
    if (coins.length > 1) {
      txb.mergeCoins(
        mergeCoin,
        coins.slice(1).map((coin) => txb.object(coin.coinObjectId)),
      );
    }

    const [sendCoin] = txb.splitCoins(mergeCoin, [txb.pure(amount)]);
    return [sendCoin, mergeCoin];
  }

  isSuiCoinAddress(type: string) {
    return type.toLocaleLowerCase() === '0x2::sui::sui';
  }

  async IsAccountCap(currentAddress: string): Promise<string | undefined> {
    const dynamicFields = await this.turbosSdk.provider.getOwnedObjects({
      owner: currentAddress,
      options: { showContent: true, showType: true, showOwner: true },
      filter: {
        StructType: `${deepbookConfig.PackageId}::custodian_v2::AccountCap`,
      },
    });
    return dynamicFields.data[0]?.data ? unstable_getObjectId(dynamicFields.data[0].data) : undefined;
  }

  createAccount(txb: Transaction): TransactionObjectArgument {
    let [cap] = txb.moveCall({
      typeArguments: [],
      target: `${deepbookConfig.PackageId}::clob_v2::create_account`,
      arguments: [],
    });
    return cap;
  }

  zero(token: string, txb: Transaction): TransactionObjectArgument {
    return txb.moveCall({
      typeArguments: [token],
      target: `0x2::coin::zero`,
      arguments: [],
    });
  }
}
