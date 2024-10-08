import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';

import config from '../config';
import { TransactionSubType } from '../types';

export interface ClaimTicketIntentionData {
  ticketId: string;
}

export class ClaimTicketIntention extends BaseIntentionLegacy<ClaimTicketIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Stake;

  constructor(public readonly data: ClaimTicketIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    console.log(input);
    const tx = new TransactionBlock();
    const { ticketId } = this.data;
    tx.moveCall({
      target: `${config.packageId}::native_pool::burn_ticket`,
      arguments: [tx.object(config.poolObjectId), tx.object(config.systemStateObjectId), tx.object(ticketId)],
    });
    return tx;
  }

  static fromData(data: ClaimTicketIntentionData) {
    return new ClaimTicketIntention(data);
  }
}
