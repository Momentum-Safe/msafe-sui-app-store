import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient, ScallopQuery, ScallopTxBlock } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks, TransactionSubType } from '../../types';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface SplitVeScaIntentionData {
  targetVeScaKey: string;
  splitAmount: number;
}

export class SplitVeScaIntention extends ScallopCoreBaseIntention<SplitVeScaIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.MergeVeSca;

  constructor(public readonly data: SplitVeScaIntentionData) {
    super(data);
  }

  private async handleUnsubForKeys(
    tx: ScallopTxBlock,
    query: ScallopQuery,
    cb: (innerTx: ScallopTxBlock, targetVeScaKey: string, splitAmount: string) => void,
  ) {
    const { targetVeScaKey, splitAmount } = this.data;
    const targetObligation = await query.getBindedObligationId(targetVeScaKey);

    // Unstake
    if (targetObligation) {
      await tx.unstakeObligationQuick(targetObligation);
    }

    // run callback
    cb(tx, targetVeScaKey, splitAmount.toString());

    if (targetObligation) {
      await tx.stakeObligationWithVeScaQuick(targetObligation, undefined, targetVeScaKey);
    }
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    const {
      scallopClient,
      account: { address },
    } = input;

    const tx = scallopClient.builder.createTxBlock();
    tx.setSender(address);

    await this.handleUnsubForKeys(tx, scallopClient.query, (innerTx, targetVeScaKey, splitAmount) => {
      const newVeScaKey = innerTx.splitVeSca(targetVeScaKey, splitAmount.toString());
      innerTx.transferObjects([newVeScaKey], address);
    });

    return tx.txBlock;
  }

  static fromData(data: SplitVeScaIntentionData): SplitVeScaIntention {
    return new SplitVeScaIntention(data);
  }
}
