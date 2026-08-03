import { Transaction, TransactionObjectArgument } from '@mysten/sui/transactions';
import { TurbosSdk } from 'turbos-clmm-sdk';

import { deepbookConfig } from '../config';

type CoinData = {
  coinObjectId: string;
  balance: string;
  coinType: string;
}[];

export class SuiKit {
  constructor(public readonly turbosSdk: TurbosSdk) {}

  async getCoinsData(currentAddress: string, type: string, amount: number): Promise<CoinData> {
    const coinObjects: CoinData = [];
    let cursor: string | null | undefined;
    let hasNextPage = true;

    while (hasNextPage) {
      const coinFields = await this.turbosSdk.provider.core.listCoins({
        owner: currentAddress,
        coinType: type,
        cursor: cursor ?? undefined,
      });
      coinObjects.push(
        ...coinFields.objects.map((coin) => ({
          coinObjectId: coin.objectId,
          balance: coin.balance,
          coinType: coin.type,
        })),
      );
      hasNextPage = coinFields.hasNextPage;
      cursor = coinFields.cursor;
    }

    const resultCoinObjects: CoinData = [];
    let currentBalance = 0;
    coinObjects
      .sort((coinA, coinB) => Number(coinB.balance) - Number(coinA.balance))
      .some((object) => {
        if (currentBalance >= amount) {
          return true;
        }
        currentBalance += Number(object.balance);
        resultCoinObjects.push(object);
        return false;
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
      const [sendCoin] = txb.splitCoins(txb.gas, [txb.pure.u64(amount)]);
      return [sendCoin, undefined];
    }

    const mergeCoin = txb.object(coins[0]!.coinObjectId);
    if (coins.length > 1) {
      txb.mergeCoins(
        mergeCoin,
        coins.slice(1).map((coin) => txb.object(coin.coinObjectId)),
      );
    }

    const [sendCoin] = txb.splitCoins(mergeCoin, [txb.pure.u64(amount)]);
    return [sendCoin, mergeCoin];
  }

  isSuiCoinAddress(type: string) {
    return type.toLocaleLowerCase() === '0x2::sui::sui';
  }

  async IsAccountCap(currentAddress: string): Promise<string | undefined> {
    const ownedObjects = await this.turbosSdk.provider.core.listOwnedObjects({
      owner: currentAddress,
      type: `${deepbookConfig.PackageId}::custodian_v2::AccountCap`,
    });
    return ownedObjects.objects[0]?.objectId;
  }

  createAccount(txb: Transaction): TransactionObjectArgument {
    const [cap] = txb.moveCall({
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
