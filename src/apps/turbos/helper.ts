import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';
import { Network, TurbosSdk } from 'turbos-clmm-sdk';

// eslint-disable-next-line import/no-cycle
import { IAppHelperInternalLegacy } from '@/apps/interface/sui-js';

import { Decoder } from './decoder';
import { AddLiquidityIntention } from './intentions/add-liquidity';
import { BurnIntention } from './intentions/burn';
import { CollectFeeIntention } from './intentions/collect-fee';
import { CollectRewardIntention } from './intentions/collect-reward';
import { CreatePoolIntention } from './intentions/create-pool';
import { DecreaseLiquidityIntention } from './intentions/decrease-liquidity';
import { IncreaseLiquidityIntention } from './intentions/increase-liquidity';
import { PrixClaimIntention } from './intentions/prix-claim';
import { PrixJoinIntention } from './intentions/prix-join';
import { RemoveLiquidityIntention } from './intentions/remove-liquidity';
import { SwapIntention } from './intentions/swap';
import { SwapExactBaseForQuoteIntention } from './intentions/swap-exact-base-for-quote';
import { SwapExactQuoteForBaseIntention } from './intentions/swap-exact-quote-for-base';
import {
  AddLiquidityIntentionData,
  BurnIntentionData,
  CollectFeeIntentionData,
  CollectRewardIntentionData,
  CreatePoolIntentionData,
  DecreaseLiquidityIntentionData,
  IncreaseLiquidityIntentionData,
  PrixClaimIntentionData,
  PrixJoinIntentionData,
  RemoveLiquidityIntentionData,
  SuiNetworks,
  SwapExactBaseForQuoteIntentionData,
  SwapExactQuoteForBaseIntentionData,
  SwapIntentionData,
  TransactionSubType,
  TURBOSIntentionData,
} from './types';

export type TURBOSIntention =
  | CreatePoolIntention
  | AddLiquidityIntention
  | IncreaseLiquidityIntention
  | DecreaseLiquidityIntention
  | CollectFeeIntention
  | CollectRewardIntention
  | RemoveLiquidityIntention
  | BurnIntention
  | SwapIntention
  | PrixClaimIntention
  | PrixJoinIntention
  | SwapExactQuoteForBaseIntention
  | SwapExactBaseForQuoteIntention;

export class TURBOSAppHelper implements IAppHelperInternalLegacy<TURBOSIntentionData> {
  application = 'turbos';

  supportSDK = '@mysten/sui.js' as const;

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
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const contract = await turbosSdk.contract.getConfig();
    const { transactionBlock, account } = input;
    console.log(input, 'input');
    const decoder = new Decoder(transactionBlock, turbosSdk, contract);
    const result = await decoder.decode(account.address);
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
    console.log(input.intentionData, 'intentionData');
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
      case TransactionSubType.PrixJoin:
        intention = PrixJoinIntention.fromData(input.intentionData as PrixJoinIntentionData);
        break;
      case TransactionSubType.PrixClaim:
        intention = PrixClaimIntention.fromData(input.intentionData as PrixClaimIntentionData);
        break;
      case TransactionSubType.SwapExactBaseForQuote:
        intention = SwapExactBaseForQuoteIntention.fromData(input.intentionData as SwapExactBaseForQuoteIntentionData);
        break;
      case TransactionSubType.SwapExactQuoteForBase:
        intention = SwapExactQuoteForBaseIntention.fromData(input.intentionData as SwapExactQuoteForBaseIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ suiClient, account, network });
  }
}
