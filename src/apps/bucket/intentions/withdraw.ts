import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../types';
import { WithdrawIntentionData, getWithdrawTx } from '../api/withdraw';

export class WithdrawIntention extends BaseIntention<WithdrawIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.Withdraw;

  constructor(public readonly data: WithdrawIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const tx = await getWithdrawTx(this.data, account, network);
    return tx;
  }

  static fromData(data: WithdrawIntentionData) {
    return new WithdrawIntention(data);
  }
}
