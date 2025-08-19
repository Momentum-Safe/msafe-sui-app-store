import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { Vaults } from '@nemoprotocol/vaults-sdk';

import { BaseIntention } from '@/apps/interface/sui';

import { DepositVaultIntentionData, TransactionSubType } from '../types';

export class DepositVaultIntention extends BaseIntention<DepositVaultIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.VaultDeposit;

  constructor(public readonly data: DepositVaultIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { suiClient, account } = input;
    const vault = Vaults.createSDK({
      client: suiClient,
    });
    const tx = new Transaction();
    await vault.deposit(this.data, account.address, tx);
    return tx;
  }

  static fromData(data: DepositVaultIntentionData) {
    return new DepositVaultIntention(data);
  }
}
