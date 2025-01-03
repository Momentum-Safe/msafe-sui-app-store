import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { AddLiquidityIntention } from './intentions/v2/add-liquidity';
import { AddLiquiditySingleSideIntention } from './intentions/v2/add-liquidity-single-side';
import { ClaimRewardsIntention } from './intentions/v2/claim-rewards';
import { RemoveLiquidityIntention } from './intentions/v2/remove-liquidity';
import { AddLiquiditySingleSideV3Intention } from './intentions/v3/add-liquidity-single-side-v3';
import { AddLiquidityV3Intention } from './intentions/v3/add-liquidity-v3';
import { ClaimV3MayaRewardsIntention } from './intentions/v3/claim-maya-rewards';
import { ClaimRewardsV3Intention } from './intentions/v3/claim-rewards';
import { RemoveLiquidityV3Intention } from './intentions/v3/remove-liquidity';
import { KRIYAIntentionData, TransactionSubType } from './types';

export type KRIYAIntention =
  | AddLiquidityIntention
  | AddLiquiditySingleSideIntention
  | ClaimRewardsIntention
  | RemoveLiquidityIntention
  | AddLiquidityV3Intention
  | AddLiquiditySingleSideV3Intention
  | RemoveLiquidityV3Intention
  | ClaimRewardsV3Intention
  | ClaimV3MayaRewardsIntention;

export class KRIYAAppHelper implements IAppHelperInternal<KRIYAIntentionData> {
  application = 'kriya';

  supportSDK = '@mysten/sui' as const;

  async deserialize(
    input: SuiSignTransactionBlockInput & {
      network: SuiNetworks;
      suiClient: SuiClient;
      account: WalletAccount;
      transaction: Transaction;
      appContext: KRIYAIntentionData;
    },
  ): Promise<{
    txType: TransactionType;
    txSubType: TransactionSubType;
    intentionData: KRIYAIntentionData;
  }> {
    const { appContext } = input;
    return {
      txType: TransactionType.Other,
      txSubType: appContext.action,
      intentionData: appContext,
    };
  }

  async build(input: {
    intentionData: KRIYAIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    let intention: KRIYAIntention;
    switch (input.txSubType) {
      case TransactionSubType.AddLiquidity:
        intention = AddLiquidityIntention.fromData(input.intentionData);
        break;
      case TransactionSubType.AddLiquiditySingleSided:
        intention = AddLiquiditySingleSideIntention.fromData(input.intentionData);
        break;
      case TransactionSubType.RemoveLiquidity:
        intention = RemoveLiquidityIntention.fromData(input.intentionData);
        break;
      case TransactionSubType.ClaimRewards:
        intention = ClaimRewardsIntention.fromData(input.intentionData);
        break;
      case TransactionSubType.ClaimRewardsV3:
        intention = ClaimRewardsV3Intention.fromData(input.intentionData);
        break;
      case TransactionSubType.ClaimV3MayaRewards:
        intention = ClaimV3MayaRewardsIntention.fromData(input.intentionData);
        break;
      case TransactionSubType.AddLiquidityV3:
        intention = AddLiquidityV3Intention.fromData(input.intentionData);
        break;
      case TransactionSubType.AddLiquiditySingleSideV3:
        intention = AddLiquiditySingleSideV3Intention.fromData(input.intentionData);
        break;
      case TransactionSubType.RemoveLiquidityV3:
        intention = RemoveLiquidityV3Intention.fromData(input.intentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build();
  }
}
