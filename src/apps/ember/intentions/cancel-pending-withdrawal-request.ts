import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';

import { getEmberSDK } from '../config';
import {
  SuiNetworks,
  TransactionSubType,
  EmberIntentionData,
  CancelPendingWithdrawalRequestIntentionData,
} from '../types';

export class CancelPendingWithdrawalRequest extends BaseIntention<EmberIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.DepositAsset;

  constructor(public readonly data: EmberIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    console.log(this.data);

    const sdk = getEmberSDK(network, account);
    const { vaultID, sequenceNumber } = this.data as CancelPendingWithdrawalRequestIntentionData;
    const tx = await sdk.cancelPendingWithdrawalRequest(vaultID, sequenceNumber, {
      returnTxb: true,
      sender: account.address,
    });
    return tx as unknown as Transaction;
  }

  static fromData(data: EmberIntentionData) {
    return new CancelPendingWithdrawalRequest(data);
  }
}
