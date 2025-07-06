import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { AddLiquidityIntention } from './intentions/add-liquidity';
import { AddLiquiditySingleSideIntention } from './intentions/add-liquidity-single-side';
import { ClaimAllRewardsIntention } from './intentions/claim-all-rewards';
import { ClaimRewardsIntention } from './intentions/claim-rewards';
import { RemoveLiquidityIntention } from './intentions/remove-liquidity';
import { SwapIntention } from './intentions/swap';
import {
  AddLiquidityIntentionData,
  AddLiquiditySingleSideIntentionData,
  ClaimAllRewardsIntentionData,
  ClaimRewardsIntentionData,
  RemoveLiquidityIntentionData,
  SwapIntentionData,
  MMTDEXIntentionData,
  TransactionSubType,
  UnstakeXSuiIntentionData,
  StakeXSuiIntentionData,
} from './types';
import { StakeXSuiIntention } from './intentions/stake-xsui';
import { UnstakeXSuiIntention } from './intentions/unstake-xsui';

export type MMTDEXIntention =
  | AddLiquidityIntention
  | AddLiquiditySingleSideIntention
  | ClaimRewardsIntention
  | ClaimAllRewardsIntention
  | RemoveLiquidityIntention
  | SwapIntention
  | StakeXSuiIntention
  | UnstakeXSuiIntention;

export class MMTDEXAppHelper implements IAppHelperInternal<MMTDEXIntentionData> {
  application = 'mmt-dex';

  supportSDK = '@mysten/sui' as const;

  async deserialize(
    input: SuiSignTransactionBlockInput & {
      network: SuiNetworks;
      suiClient: SuiClient;
      account: WalletAccount;
      transaction: Transaction;
      appContext: MMTDEXIntentionData;
    },
  ): Promise<{
    txType: TransactionType;
    txSubType: TransactionSubType;
    intentionData: MMTDEXIntentionData;
  }> {
    const { appContext } = input;
    return {
      txType: TransactionType.Other,
      txSubType: appContext.action,
      intentionData: appContext,
    };
  }

  async build(input: {
    intentionData: MMTDEXIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    let intention: MMTDEXIntention;
    switch (input.txSubType) {
      case TransactionSubType.Swap:
        intention = SwapIntention.fromData(input.intentionData as SwapIntentionData);
        break;
      case TransactionSubType.AddLiquidity:
        intention = AddLiquidityIntention.fromData(input.intentionData as AddLiquidityIntentionData);
        break;
      case TransactionSubType.AddLiquiditySingleSide:
        intention = AddLiquiditySingleSideIntention.fromData(
          input.intentionData as AddLiquiditySingleSideIntentionData,
        );
        break;
      case TransactionSubType.ClaimRewards:
        intention = ClaimRewardsIntention.fromData(input.intentionData as ClaimRewardsIntentionData);
        break;
      case TransactionSubType.ClaimAllRewards:
        intention = ClaimAllRewardsIntention.fromData(input.intentionData as ClaimAllRewardsIntentionData);
        break;
      case TransactionSubType.RemoveLiquidity:
        intention = RemoveLiquidityIntention.fromData(input.intentionData as RemoveLiquidityIntentionData);
        break;
      case TransactionSubType.StakeXSui:
        intention = StakeXSuiIntention.fromData(input.intentionData as StakeXSuiIntentionData);
        break;
      case TransactionSubType.UnstakeXSui:
        intention = UnstakeXSuiIntention.fromData(input.intentionData as UnstakeXSuiIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ suiClient: input.suiClient });
  }
}
