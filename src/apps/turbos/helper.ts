import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';
import { MSafeAppHelper } from '../interface';
import { Decoder } from './decoder';
import { AddLiquidityIntention, AddLiquidityIntentionData } from './intentions/add-liquidity';
import { BurnIntention, BurnIntentionData } from './intentions/burn';
import { CollectFeeIntention, CollectFeeIntentionData } from './intentions/collect-fee';
import { CollectRewardIntention, CollectRewardIntentionData } from './intentions/collect-reward';
import { CreatePoolIntention, CreatePoolIntentionData } from './intentions/create-pool';
import { DecreaseLiquidityIntention, DecreaseLiquidityIntentionData } from './intentions/decrease-liquidity';
import { IncreaseLiquidityIntention, IncreaseLiquidityIntentionData } from './intentions/increase-liquidity';
import { RemoveLiquidityIntention, RemoveLiquidityIntentionData } from './intentions/remove-liquidity';
import { SwapIntention, SwapIntentionData } from './intentions/swap';
import { SuiNetworks, TransactionSubType } from './types';

export type TURBOSIntention =
  | CreatePoolIntention
  | AddLiquidityIntention
  | IncreaseLiquidityIntention
  | DecreaseLiquidityIntention
  | CollectFeeIntention
  | CollectRewardIntention
  | RemoveLiquidityIntention
  | BurnIntention
  | SwapIntention;
export type TURBOSIntentionData =
  | CreatePoolIntentionData
  | AddLiquidityIntentionData
  | IncreaseLiquidityIntentionData
  | DecreaseLiquidityIntentionData
  | CollectFeeIntentionData
  | CollectRewardIntentionData
  | RemoveLiquidityIntentionData
  | BurnIntentionData
  | SwapIntentionData;

export class TURBOSAppHelper implements MSafeAppHelper<TURBOSIntentionData> {
  application = 'turbos';

  async deserialize(
    input: SuiSignTransactionBlockInput & { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount } & {
      action?: string;
      txbParams?: any;
    },
  ): Promise<{
    txType: TransactionType;
    txSubType: TransactionSubType;
    intentionData: TURBOSIntentionData;
  }> {
    console.log('helper deserialize input: ', input);

    const { transactionBlock, account, suiClient } = input;
    const decoder = new Decoder(transactionBlock, suiClient);
    const result = decoder.decode(account.address);
    return {
      txType: TransactionType.Other,
      txSubType: result.type,
      intentionData: result.intentionData,
    };
  }

  async build(input: {
    intentionData: TURBOSIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const { suiClient, account, network } = input;
    let intention: TURBOSIntention;
    switch (input.txSubType) {
      case TransactionSubType.CreatePool:
        intention = CreatePoolIntention.fromData(input.intentionData as CreatePoolIntentionData);
        break;
      case TransactionSubType.AddLiquidity:
        intention = AddLiquidityIntention.fromData(input.intentionData as AddLiquidityIntentionData);
        break;
      case TransactionSubType.IncreaseLiquidity:
        intention = IncreaseLiquidityIntention.fromData(input.intentionData as IncreaseLiquidityIntentionData);
        break;
      case TransactionSubType.DecreaseLiquidity:
        intention = DecreaseLiquidityIntention.fromData(input.intentionData as DecreaseLiquidityIntentionData);
        break;
      case TransactionSubType.RemoveLiquidity:
        intention = RemoveLiquidityIntention.fromData(input.intentionData as RemoveLiquidityIntentionData);
        break;
      case TransactionSubType.CollectFee:
        intention = CollectFeeIntention.fromData(input.intentionData as CollectFeeIntentionData);
        break;
      case TransactionSubType.CollectReward:
        intention = CollectRewardIntention.fromData(input.intentionData as CollectRewardIntentionData);
        break;
      case TransactionSubType.Burn:
        intention = BurnIntention.fromData(input.intentionData as BurnIntentionData);
        break;
      case TransactionSubType.Swap:
        intention = SwapIntention.fromData(input.intentionData as SwapIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ suiClient, account, network });
  }
}
