import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { getEmberSDK } from '../config';
import { SuiNetworks, TransactionSubType, EmberIntentionData, MintSharesIntentionData } from '../types';

export class MintShares extends BaseIntention<EmberIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.MintShares;

  constructor(public readonly data: EmberIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    console.log(this.data);

    const sdk = getEmberSDK(network, account);
    const { vaultID, numShares } = this.data as MintSharesIntentionData;
    const tx = await sdk.depositAsset(vaultID, numShares, { returnTxb: true, sender: account.address });
    return tx as unknown as Transaction;
  }

  static fromData(data: EmberIntentionData) {
    return new MintShares(data);
  }
}
