import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';
import { LiquidStakingObjectInfo } from '@suilend/springsui-sdk';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { ASSETS_URL } from './constants';
import { Decoder } from './decoder';
import { ConvertIntention, ConvertIntentionData } from './intentions/convert';
import { ConvertAndDepositIntention, ConvertAndDepositIntentionData } from './intentions/convertAndDeposit';
import { StakeIntention, StakeIntentionData } from './intentions/stake';
import { StakeAndDepositIntention, StakeAndDepositIntentionData } from './intentions/stakeAndDeposit';
import { UnstakeIntention, UnstakeIntentionData } from './intentions/unstake';
import { TransactionSubType } from './types';
import { getUtils as getSuilendUtils, Utils as SuilendUtils } from '../suilend/helper';

type Utils = {
  LIQUID_STAKING_INFO_MAP: Record<string, LiquidStakingObjectInfo>;
} & SuilendUtils;

const getUtils = async (suiClient: SuiClient, account: WalletAccount): Promise<Utils> => {
  const suilendUtils = await getSuilendUtils(suiClient, account);

  const LIQUID_STAKING_INFO_MAP = await (await fetch(`${ASSETS_URL}/liquid-staking-info-map.json`)).json();

  return { ...suilendUtils, LIQUID_STAKING_INFO_MAP };
};

export type SpringSuiIntention =
  | StakeIntention
  | StakeAndDepositIntention
  | ConvertIntention
  | ConvertAndDepositIntention
  | UnstakeIntention;

export type SpringSuiIntentionData =
  | StakeIntentionData
  | StakeAndDepositIntentionData
  | ConvertIntentionData
  | ConvertAndDepositIntentionData
  | UnstakeIntentionData;

export type IntentionInput = {
  network: SuiNetworks;
  suiClient: SuiClient;
  account: WalletAccount;

  suilendClient: Utils['suilendClient'];
  LIQUID_STAKING_INFO_MAP: Utils['LIQUID_STAKING_INFO_MAP'];
  obligationOwnerCap: Utils['obligationOwnerCaps'][0] | undefined;
  obligation: Utils['obligations'][0] | undefined;
};

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
