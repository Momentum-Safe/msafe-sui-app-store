import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';

import {
  AddLiquidityIntention,
  AddLiquidityWithProtectionIntention,
  OpenAddLiquidityWithProtectionIntention,
  RemoveLiquidityIntention,
  BatchCollectRewardIntention,
  ClosePositionIntention,
  CreatePoolIntention,
  FastRouterIntention,
  CollectRewarderIntention,
} from './intentions';
import { SuiNetworks, MagmaIntentionData, TransactionSubType } from './types';

export type MagmaIntention =
  | AddLiquidityIntention
  | AddLiquidityWithProtectionIntention
  | OpenAddLiquidityWithProtectionIntention
  | BatchCollectRewardIntention
  | ClosePositionIntention
  | CollectRewarderIntention
  | CreatePoolIntention
  | FastRouterIntention
  | RemoveLiquidityIntention;

export class MagmaAppHelper implements IAppHelperInternal<MagmaIntentionData> {
  application = 'magma';

  supportSDK = '@mysten/sui' as const;

  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    action?: string;
    txbParams?: any;
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: MagmaIntentionData }> {
    console.log('Magma helper deserialize input: ', input);
    const { txbParams, action } = input;

    return {
      txType: TransactionType.Other,
      txSubType: action,
      intentionData: {
        txbParams: { ...txbParams },
        action,
      },
    };
  }

  async build(input: {
    intentionData: MagmaIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { account } = input;

    let intention: MagmaIntention;
    switch (input.txSubType) {
      case TransactionSubType.BatchCollectRewarder:
        intention = BatchCollectRewardIntention.fromData(input.intentionData);
        break;
      case TransactionSubType.ClosePosition:
        intention = ClosePositionIntention.fromData(input.intentionData);
        break;
      case TransactionSubType.CollectRewarder:
        intention = CollectRewarderIntention.fromData(input.intentionData);
        break;
      case TransactionSubType.CreatePool:
        intention = CreatePoolIntention.fromData(input.intentionData);
        break;
      case TransactionSubType.FastRouterSwap:
        intention = FastRouterIntention.fromData(input.intentionData);
        break;
      case TransactionSubType.OpenAndAddLiquidity:
        intention = AddLiquidityIntention.fromData(input.intentionData);
        break;
      case TransactionSubType.OpenAndAddLiquidityWithProtection:
        intention = OpenAddLiquidityWithProtectionIntention.fromData(input.intentionData);
        break;
      case TransactionSubType.AddLiquidityWithProtection:
        intention = AddLiquidityWithProtectionIntention.fromData(input.intentionData);
        break;
      case TransactionSubType.RemoveLiquidity:
        intention = RemoveLiquidityIntention.fromData(input.intentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ account });
  }
}
