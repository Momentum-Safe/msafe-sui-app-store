import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { LockClaimIntentionData, getLockClaimTx } from '../api';
import { TransactionSubType } from '../types';

export class LockClaimIntention extends BaseIntention<LockClaimIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.LockClaim;

  constructor(public readonly data: LockClaimIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const tx = await getLockClaimTx(this.data, account, network);
    return tx;
  }

  static fromData(data: LockClaimIntentionData) {
    return new LockClaimIntention(data);
  }
}
