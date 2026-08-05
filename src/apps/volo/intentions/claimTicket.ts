import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntentionGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import config from '../config';
import { TransactionSubType } from '../types';

export interface ClaimTicketIntentionData {
  ticketId: string;
}

export class ClaimTicketIntention extends BaseIntentionGrpc<ClaimTicketIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.ClaimTicket;

  constructor(public readonly data: ClaimTicketIntentionData) {
    super(data);
  }

  async build(_input: {
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const tx = new Transaction();
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
