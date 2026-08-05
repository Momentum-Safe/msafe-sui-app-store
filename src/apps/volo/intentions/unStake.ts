import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import config from '../config';
import { TransactionSubType } from '../types';

export interface UnStakeIntentionData {
  amount: number;
}

export class UnStakeIntention extends BaseIntentionGrpc<UnStakeIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.UnStake;

  constructor(public readonly data: UnStakeIntentionData) {
    super(data);
  }

  async build(input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const tx = new Transaction();
    const { amount } = this.data;
    const coins = await input.suiGrpcClient.listCoins({
      owner: input.account.address,
      coinType: config.certType,
      limit: 100,
    });

    if (coins.objects.length === 0) {
      throw new Error('No cert coins found');
    }

    const [primaryCoin, ...mergeCoins] = coins.objects;
    const primaryCoinInput = tx.object(primaryCoin.objectId);
    if (mergeCoins.length) {
      tx.mergeCoins(
        primaryCoinInput,
        mergeCoins.map((coin) => tx.object(coin.objectId)),
      );
    }
    const [coin] = tx.splitCoins(tx.object(primaryCoin.objectId), [amount]);

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
