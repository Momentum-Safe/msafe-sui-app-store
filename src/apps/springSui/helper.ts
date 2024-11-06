import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';
import { LstClient } from '@suilend/springsui-sdk';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { LIQUID_STAKING_INFO } from './constants';
import { Decoder } from './decoder';
import { MintIntention, MintIntentionData } from './intentions/mint';
import { RedeemIntention, RedeemIntentionData } from './intentions/redeem';
import { TransactionSubType } from './types';

const getLstClient = async (suiClient: SuiClient) => LstClient.initialize(suiClient as any, LIQUID_STAKING_INFO);

export type SpringSuiIntention = MintIntention | RedeemIntention;

export type SpringSuiIntentionData = MintIntentionData | RedeemIntentionData;

export type IntentionInput = {
  network: SuiNetworks;
  suiClient: SuiClient;
  account: WalletAccount;
  lstClient: LstClient;
};

export class SpringSuiAppHelper implements IAppHelperInternal<SpringSuiIntentionData> {
  application = 'SpringSui';

  supportSDK = '@mysten/sui' as const;

  private lstClient: LstClient | undefined;

  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: SpringSuiIntentionData }> {
    const { transaction, suiClient, account } = input;

    if (!this.lstClient) {
      this.lstClient = await getLstClient(suiClient);
    }

    const simResult = await suiClient.devInspectTransactionBlock({
      sender: account.address,
      transactionBlock: transaction,
    });
    console.log('SpringSuiAppHelper.deserialize', simResult);

    const decoder = new Decoder(transaction, simResult);
    const result = decoder.decode();

    return {
      txType: TransactionType.Other,
      txSubType: result.type,
      intentionData: result.intentionData,
    };
  }

  async build(input: {
    network: SuiNetworks;
    txType: TransactionType;
    txSubType: string;
    intentionData: SpringSuiIntentionData;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const { network, txSubType, intentionData, suiClient, account } = input;

    if (!this.lstClient) {
      this.lstClient = await getLstClient(suiClient);
    }

    let intention: SpringSuiIntention;
    switch (txSubType) {
      case TransactionSubType.MINT:
        intention = MintIntention.fromData(intentionData as MintIntentionData);
        break;
      case TransactionSubType.REDEEM:
        intention = RedeemIntention.fromData(intentionData as RedeemIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({
      network,
      suiClient,
      account,
      lstClient: this.lstClient,
    } as IntentionInput);
  }
}
