import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { PsmInIntention } from './intentions/psmIn';
import { PsmOutIntention } from './intentions/psmOut';
import { Decoder } from './decoder';
import { TransactionSubType } from './types';
import { PsmIntentionData } from './api/psm';
import { BorrowIntention } from './intentions/borrow';
import { WithdrawIntention } from './intentions/withdraw';
import { RepayIntention } from './intentions/repay';
import { CloseIntention } from './intentions/close';
import { BorrowIntentionData } from './api/lending';
import { WithdrawIntentionData } from './api/withdraw';
import { RepayIntentionData } from './api/repay';
import { CloseIntentionData } from './api/close';
import { SBUCKClaimIntentionData, SBUCKDepositIntentionData, SBUCKUnstakeIntentionData, SBUCKWithdrawIntentionData } from './api/sbuck';
import { SBUCKClaimIntention, SBUCKDepositIntention, SBUCKUnstakeIntention, SBUCKWithdrawIntention } from './intentions/sbuck';

export type BucketIntention = PsmInIntention
  | PsmOutIntention
  | BorrowIntention
  | WithdrawIntention
  | RepayIntention
  | CloseIntention
  | SBUCKDepositIntention
  | SBUCKWithdrawIntention
  | SBUCKUnstakeIntention
  | SBUCKClaimIntention;

export type BucketIntentionData = PsmIntentionData
  | BorrowIntentionData
  | WithdrawIntentionData
  | RepayIntentionData
  | CloseIntentionData
  | SBUCKDepositIntentionData
  | SBUCKWithdrawIntention
  | SBUCKUnstakeIntentionData
  | SBUCKClaimIntentionData;

export class BucketHelper implements IAppHelperInternal<BucketIntentionData> {
  application = 'bucket';

  supportSDK = '@mysten/sui' as const;

  // TODO: Please refer to the documentation and move the `action` and `txbParams` params into the `appContext` structure.
  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: BucketIntentionData }> {
    console.log('Bucket helper deserialize input: ', input);
    const { transaction } = input;
    const decoder = new Decoder(transaction);
    const result = decoder.decode();
    return {
      txType: TransactionType.Other,
      txSubType: result.type,
      intentionData: result.intentionData,
    };
  }

  async build(input: {
    intentionData: BucketIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { suiClient, account, network } = input;

    let intention: BucketIntention;
    switch (input.txSubType) {
      case TransactionSubType.PsmIn:
        intention = PsmInIntention.fromData(input.intentionData as PsmIntentionData);
        break;
      case TransactionSubType.PsmOut:
        intention = PsmOutIntention.fromData(input.intentionData as PsmIntentionData);
        break;
      case TransactionSubType.Borrow:
        intention = BorrowIntention.fromData(input.intentionData as BorrowIntentionData);
        break;
      case TransactionSubType.Withdraw:
        intention = WithdrawIntention.fromData(input.intentionData as WithdrawIntentionData);
        break;
      case TransactionSubType.Repay:
        intention = RepayIntention.fromData(input.intentionData as RepayIntentionData);
        break;
      case TransactionSubType.Close:
        intention = CloseIntention.fromData(input.intentionData as CloseIntentionData);
        break;
      case TransactionSubType.SBUCKDeposit:
        intention = SBUCKDepositIntention.fromData(input.intentionData as SBUCKDepositIntentionData);
        break;
      case TransactionSubType.SBUCKUnstake:
        intention = SBUCKUnstakeIntention.fromData(input.intentionData as SBUCKUnstakeIntentionData);
        break;
      case TransactionSubType.SBUCKWithdraw:
        intention = SBUCKWithdrawIntention.fromData(input.intentionData as SBUCKWithdrawIntentionData);
        break;
      case TransactionSubType.SBUCKClaim:
        intention = SBUCKClaimIntention.fromData(input.intentionData as SBUCKClaimIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }

    return intention.build({ suiClient, account, network });
  }
}
