import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import config from '../config';
import { TransactionSubType } from '../types';

export interface StakeIntentionData {
  amount: number;
}

export class StakeIntention extends BaseIntentionGrpc<StakeIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Stake;

  constructor(public readonly data: StakeIntentionData) {
    super(data);
  }

  async build(_input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const tx = new Transaction();
    const { amount } = this.data;
    const [coin] = tx.splitCoins(tx.gas, [amount]);
    tx.moveCall({
      target: `${config.packageId}::native_pool::stake`,
      arguments: [
        tx.object(config.poolObjectId),
        tx.object(config.metadataObjectId),
        tx.object(config.systemStateObjectId),
        coin,
      ],
    });
    return tx;
  }

  static fromData(data: StakeIntentionData) {
    return new StakeIntention(data);
  }
}
