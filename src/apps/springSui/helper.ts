import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';
import {
  ConvertAndDepositIntentionData,
  ConvertIntentionData,
  SpringSuiIntentionData,
  StakeAndDepositIntentionData,
  StakeIntentionData,
  UnstakeIntentionData,
} from '@/apps/springSui/types/intention';
import { SuiNetworks } from '@/types';

import { Decoder } from './decoder';
import { ConvertIntention } from './intentions/convert';
import { ConvertAndDepositIntention } from './intentions/convertAndDeposit';
import { StakeIntention } from './intentions/stake';
import { StakeAndDepositIntention } from './intentions/stakeAndDeposit';
import { UnstakeIntention } from './intentions/unstake';
import { Utils, TransactionSubType, getUtils, IntentionInput } from './types/helper';

export type SpringSuiIntention =
  | StakeIntention
  | StakeAndDepositIntention
  | ConvertIntention
  | ConvertAndDepositIntention
  | UnstakeIntention;

export class SpringSuiAppHelper implements IAppHelperInternal<SpringSuiIntentionData> {
  application = 'SpringSui';

  supportSDK = '@mysten/sui' as const;

  private utils: Utils | undefined;

  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: SpringSuiIntentionData }> {
    const { transaction, suiClient, account } = input;

    if (!this.utils) {
      this.utils = await getUtils(suiClient, account);
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

    if (!this.utils) {
      this.utils = await getUtils(suiClient, account);
    }

    let intention: SpringSuiIntention;
    switch (txSubType) {
      case TransactionSubType.STAKE:
        intention = StakeIntention.fromData(intentionData as StakeIntentionData);
        break;
      case TransactionSubType.STAKE_AND_DEPOSIT:
        intention = StakeAndDepositIntention.fromData(intentionData as StakeAndDepositIntentionData);
        break;
      case TransactionSubType.CONVERT:
        intention = ConvertIntention.fromData(intentionData as ConvertIntentionData);
        break;
      case TransactionSubType.CONVERT_AND_DEPOSIT:
        intention = ConvertAndDepositIntention.fromData(intentionData as ConvertAndDepositIntentionData);
        break;
      case TransactionSubType.UNSTAKE:
        intention = UnstakeIntention.fromData(intentionData as UnstakeIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({
      network,
      suiClient,
      account,

      suilendClient: this.utils.suilendClient,
      LIQUID_STAKING_INFO_MAP: this.utils.LIQUID_STAKING_INFO_MAP,
      obligationOwnerCap: this.utils.obligationOwnerCaps?.[0],
      obligation: this.utils.obligations?.[0],
    } as IntentionInput);
  }
}
