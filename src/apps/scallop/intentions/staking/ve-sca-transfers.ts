import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiNetworks, TransactionSubType } from '../../types';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

export interface TransferVeScaKeysIntentionData {
  veScaKeys: {
    objectId: string;
    version: string;
    digest: string;
  }[];
}

export class TransferVeScaKeysIntention extends ScallopCoreBaseIntention<TransferVeScaKeysIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.MergeVeSca;

  constructor(public readonly data: TransferVeScaKeysIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    const {
      scallopClient,
      account: { address: sender },
    } = input;

    const tx = scallopClient.builder.createTxBlock();
    tx.setSender(sender);

    const { veScaKeys } = this.data;

    tx.transferObjects(
      veScaKeys.map((t) => tx.objectRef(t)),
      tx.pure.address(sender),
    );

    return tx.txBlock;
  }

  static fromData(data: TransferVeScaKeysIntentionData): TransferVeScaKeysIntention {
    return new TransferVeScaKeysIntention(data);
  }
}
