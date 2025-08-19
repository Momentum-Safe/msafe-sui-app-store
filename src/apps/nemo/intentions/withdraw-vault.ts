import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Vaults } from '@nemoprotocol/vaults-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { TransactionSubType, WithdrawVaultIntentionData } from '../types';

export class WithdrawVaultIntention extends BaseIntention<WithdrawVaultIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.VaultWithdraw;

  constructor(public readonly data: WithdrawVaultIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { suiClient, account } = input;
    const vault = Vaults.createSDK({
      client: suiClient,
    });
    const tx = new Transaction();
    await vault.withdraw(this.data, account.address, tx);
    return tx;
  }

  static fromData(data: WithdrawVaultIntentionData) {
    return new WithdrawVaultIntention(data);
  }
}
