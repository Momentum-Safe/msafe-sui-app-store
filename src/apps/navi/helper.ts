import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { MSafeAppHelper } from '@/apps/interface';

import { ClaimRewardIntention, ClaimRewardIntentionData } from './intentions/claim-reward';
import { EntryBorrowIntention, EntryBorrowIntentionData } from './intentions/entry-borrow';
import { EntryDepositIntention, EntryDepositIntentionData } from './intentions/entry-deposit';
import { EntryRepayIntention, EntryRepayIntentionData } from './intentions/entry-repay';
import { EntryWithdrawIntention, EntryWithdrawIntentionData } from './intentions/entry-withdraw';
import { TransactionSubType } from './types';

export type NAVIIntention =
  | EntryDepositIntention
  | EntryBorrowIntention
  | EntryRepayIntention
  | EntryWithdrawIntention
  | ClaimRewardIntention;

export type NAVIIntentionData =
  | EntryDepositIntentionData
  | EntryBorrowIntentionData
  | EntryRepayIntentionData
  | EntryWithdrawIntentionData
  | ClaimRewardIntentionData;

export class NAVIAppHelper implements MSafeAppHelper<NAVIIntentionData> {
  application = 'navi';

  deserialize(): Promise<{ txType: TransactionType; txSubType: string; intentionData: NAVIIntentionData }> {
    throw new Error('MSafe core transaction intention should be build from API');
  }

  async build(input: {
    intentionData: NAVIIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    let intention: NAVIIntention;
    switch (input.txSubType) {
      case TransactionSubType.EntryDeposit:
        intention = EntryDepositIntention.fromData(input.intentionData as EntryDepositIntentionData);
        break;
      case TransactionSubType.EntryBorrow:
        intention = EntryBorrowIntention.fromData(input.intentionData as EntryBorrowIntentionData);
        break;
      case TransactionSubType.EntryRepay:
        intention = EntryRepayIntention.fromData(input.intentionData as EntryRepayIntentionData);
        break;
      case TransactionSubType.EntryWithdraw:
        intention = EntryWithdrawIntention.fromData(input.intentionData as EntryWithdrawIntentionData);
        break;
      case TransactionSubType.ClaimReward:
        intention = ClaimRewardIntention.fromData(input.intentionData as ClaimRewardIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ suiClient, account });
  }
}
