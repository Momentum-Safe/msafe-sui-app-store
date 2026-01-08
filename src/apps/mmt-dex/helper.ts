import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { AddLiquidityIntention } from './intentions/add-liquidity';
import { AddLiquiditySingleSideIntention } from './intentions/add-liquidity-single-side';
import { ClaimAllRewardsIntention } from './intentions/claim-all-rewards';
import { ClaimRewardAsIntention } from './intentions/claim-reward-as';
import { ClaimRewardsIntention } from './intentions/claim-rewards';
import { ManageLiquidityIntention } from './intentions/manage-liquidity';
import { ManageLiquiditySingleSideIntention } from './intentions/manage-liquidity-single-side';
import { RemoveLiquidityIntention } from './intentions/remove-liquidity';
import { StakeXSuiIntention } from './intentions/stake-xsui';
import { SwapIntention } from './intentions/swap';
import { UnstakeXSuiIntention } from './intentions/unstake-xsui';
import { BondVeMMTIntention } from './intentions/vemmt-bond';
import { ExtendVeMMTIntention } from './intentions/vemmt-extend';
import { MergeVeMMTIntention } from './intentions/vemmt-merge';
import { UnbondVeMMTIntention } from './intentions/vemmt-unbond';
import {
  AddLiquidityIntentionData,
  AddLiquiditySingleSideIntentionData,
  BondVeMMTIntentionData,
  ExtendVeMMTIntentionData,
  MergeVeMMTIntentionData,
  UnbondVeMMTIntentionData,
  ClaimAllRewardsIntentionData,
  ClaimRewardsIntentionData,
  RemoveLiquidityIntentionData,
  SwapIntentionData,
  MMTDEXIntentionData,
  TransactionSubType,
  UnstakeXSuiIntentionData,
  StakeXSuiIntentionData,
  ManageLiquiditySingleSideIntentionData,
  ManageLiquidityIntentionData,
  ClaimRewardsAsIntentionData,
} from './types';

export type MMTDEXIntention =
  | AddLiquidityIntention
  | AddLiquiditySingleSideIntention
  | BondVeMMTIntention
  | ExtendVeMMTIntention
  | MergeVeMMTIntention
  | UnbondVeMMTIntention
  | ClaimRewardsIntention
  | ClaimAllRewardsIntention
  | ClaimRewardAsIntention
  | RemoveLiquidityIntention
  | SwapIntention
  | StakeXSuiIntention
  | UnstakeXSuiIntention
  | ManageLiquidityIntention
  | ManageLiquiditySingleSideIntention;

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
      case TransactionSubType.ClaimRewardsAs:
        intention = ClaimRewardAsIntention.fromData(input.intentionData as ClaimRewardsAsIntentionData);
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
      case TransactionSubType.ManageLiquidity:
        intention = ManageLiquidityIntention.fromData(input.intentionData as ManageLiquidityIntentionData);
        break;
      case TransactionSubType.ManageLiquiditySingleSide:
        intention = ManageLiquiditySingleSideIntention.fromData(
          input.intentionData as ManageLiquiditySingleSideIntentionData,
        );
        break;
      case TransactionSubType.Bond:
        intention = BondVeMMTIntention.fromData(input.intentionData as BondVeMMTIntentionData);
        break;
      case TransactionSubType.Extend:
        intention = ExtendVeMMTIntention.fromData(input.intentionData as ExtendVeMMTIntentionData);
        break;
      case TransactionSubType.Merge:
        intention = MergeVeMMTIntention.fromData(input.intentionData as MergeVeMMTIntentionData);
        break;
      case TransactionSubType.Unbond:
        intention = UnbondVeMMTIntention.fromData(input.intentionData as UnbondVeMMTIntentionData);
        break;
      default:
        throw new Error(`not implemented ${input.txSubType}`);
    }
    return intention.build({ suiClient: input.suiClient });
  }
}
