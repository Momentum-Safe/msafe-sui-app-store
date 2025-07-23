import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';

import { Decoder } from './decoder';
import { Aggregator7KSwap } from './intentions/aggregator-7k-swap';
import { ClosePosition } from './intentions/close-position';
import { CollectFee } from './intentions/collect-fee';
import { CollectRewards } from './intentions/collect-rewards';
import { CollectRewardsAndFee } from './intentions/collect-rewards-and-fee';
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
  | CollectRewardsAndFee;
export class BluefinHelper implements IAppHelperInternal<BluefinIntentionData> {
  application = 'bluefin';

  supportSDK = '@mysten/sui' as const;

  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: BluefinIntentionData & {appContext?: any} }> {
    console.log('Bluefin helper deserialize input: ', input);

    const { transaction, suiClient } = input;

    const decoder = new Decoder(transaction);

    const result = await decoder.decode(suiClient);

    return {
      txType: TransactionType.Other,
      txSubType: result.type,
      intentionData: {
        appContext: input.appContext,
        ...result.intentionData,
      },
    };
  }

  async build(input: {
    intentionData: BluefinIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { suiClient, account, network } = input;

    console.log(input.txSubType);
    let intention: BluefinIntention;
    switch (input.txSubType) {
      case TransactionSubType.OpenPosition:
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

      case TransactionSubType.CollectRewardsAndFee:
        intention = CollectRewardsAndFee.fromData(input.intentionData);
        break;

      case TransactionSubType.Aggregator7KSwap:
        intention = Aggregator7KSwap.fromData(input.intentionData);
        break;

      default:
        throw new Error('not implemented');
    }

    return intention.build({ suiClient, account, network });
  }
}
