import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

import config from '../config';
import { TransactionSubType } from '../types';

export interface UnStakeIntentionData {
  amount: number;
}

export class UnStakeIntention extends CoreBaseIntention<UnStakeIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Stake;

  constructor(public readonly data: UnStakeIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    console.log(input);
    const tx = new TransactionBlock();
    const { amount } = this.data;
    const coins = (
      await input.suiClient.getAllCoins({
        owner: input.account.address,
        limit: 100,
      })
    ).data;
    const [primaryCoin, ...mergeCoins] = coins.filter(
      (coin) => coin.coinType.split('::')[0] === config.certType.split('::')[0],
    );

    const primaryCoinInput = tx.object(primaryCoin.coinObjectId);
    if (mergeCoins.length) {
      tx.mergeCoins(
        primaryCoinInput,
        mergeCoins.map((coin) => tx.object(coin.coinObjectId)),
      );
    }
    const coin = tx.splitCoins(tx.object(primaryCoin.coinObjectId), [tx.pure(amount)]);

    tx.moveCall({
      target: `${config.packageId}::native_pool::unstake`,
      arguments: [
        tx.object(config.poolObjectId),
        tx.object(config.metadataObjectId),
        tx.object(config.systemStateObjectId),
        coin,
      ],
    });
    return tx;
  }

  static fromData(data: UnStakeIntentionData) {
    return new UnStakeIntention(data);
  }
}
