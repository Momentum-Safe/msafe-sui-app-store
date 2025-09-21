import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { getEmberSDK } from '../config';
import { SuiNetworks, TransactionSubType, EmberIntentionData, RedeemSharesIntentionData } from '../types';

export class RedeemShares extends BaseIntention<EmberIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.DepositAsset;

  constructor(public readonly data: EmberIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    console.log(this.data);

    const sdk = getEmberSDK(network, account);
    const { vaultID, numShares } = this.data as RedeemSharesIntentionData;
    const tx = await sdk.redeemShares(vaultID, numShares, { returnTxb: true, sender: account.address });
    return tx as unknown as Transaction;
  }

  static fromData(data: EmberIntentionData) {
    return new RedeemShares(data);
  }
}
