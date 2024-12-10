import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternalLegacy } from '@/apps/interface/sui-js';

import { Decoder } from './decoder';
import { ClosePosition } from './intentions/close-position';
import { CollectFee } from './intentions/collect-fee';
import { CollectFeeAndRewards } from './intentions/collect-fee-and-rewards';
import { CollectRewards } from './intentions/collect-rewards';
import { OpenAndAddLiquidity } from './intentions/open-position-with-liquidity';
import { ProvideLiquidity } from './intentions/provide-liquidity';
import { RemoveLiquidity } from './intentions/remove-liquidity';
import { SuiNetworks, BluefinIntentionData, TransactionSubType } from './types';

export type BluefinIntention =
  | OpenAndAddLiquidity
  | ProvideLiquidity
  | RemoveLiquidity
  | ClosePosition
  | CollectFee
  | CollectRewards
  | CollectFeeAndRewards;
export class BluefinHelper implements IAppHelperInternalLegacy<BluefinIntentionData> {
  application = 'bluefin';

  supportSDK = '@mysten/sui.js' as const;


  async deserialize(
    input: SuiSignTransactionBlockInput & { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount },
  ): Promise<{
    txType: TransactionType;
    txSubType: TransactionSubType;
    intentionData: BluefinIntentionData;
  }> {
    console.log('Bluefin helper deserialize input: ', input);
    const { transactionBlock } = input;
    const decoder = new Decoder(transactionBlock);
    const result = decoder.decode();
    return {
      txType: TransactionType.Other,
      txSubType: result.type,
      intentionData: result.intentionData,
    };
  }

  async build(input: {
    intentionData: BluefinIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const { suiClient, account, network } = input;

    let intention: BluefinIntention;
    switch (input.txSubType) {
      case TransactionSubType.OpenAndAddLiquidity:
        intention = OpenAndAddLiquidity.fromData(input.intentionData);
        break;

      case TransactionSubType.ProvideLiquidity:
        intention = ProvideLiquidity.fromData(input.intentionData);
        break;

      case TransactionSubType.RemoveLiquidity:
        intention = RemoveLiquidity.fromData(input.intentionData);
        break;

      case TransactionSubType.ClosePosition:
        intention = ClosePosition.fromData(input.intentionData);
        break;

      case TransactionSubType.CollectFee:
        intention = CollectFee.fromData(input.intentionData);
        break;
      case TransactionSubType.CollectRewards:
        intention = CollectRewards.fromData(input.intentionData);
        break;
      case TransactionSubType.CollectFeeAndRewards:
        intention = CollectFeeAndRewards.fromData(input.intentionData);
        break;
      default:
        throw new Error('not implemented');
    }

    return intention.build({ suiClient, account, network });
  }
}
