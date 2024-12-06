import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';
import { LIQUID_STAKING_INFO_MAP, LstId } from '@suilend/frontend-sui';
import { SuilendClient } from '@suilend/sdk';
import { ObligationOwnerCap } from '@suilend/sdk/_generated/suilend/lending-market/structs';
import { Obligation } from '@suilend/sdk/_generated/suilend/obligation/structs';
import { LstClient } from '@suilend/springsui-sdk';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { Decoder } from './decoder';
import { MintIntention, MintIntentionData } from './intentions/mint';
import { MintAndDepositIntention, MintAndDepositIntentionData } from './intentions/mintAndDeposit';
import { RedeemIntention, RedeemIntentionData } from './intentions/redeem';
import { TransactionSubType } from './types';
import { getUtils as getSuilendUtils, Utils as SuilendUtils } from '../suilend/helper';

type Utils = {
  lstClient: LstClient;
} & SuilendUtils;

const getUtils = async (suiClient: SuiClient, account: WalletAccount): Promise<Utils> => {
  const lstClient = await LstClient.initialize(suiClient as any, LIQUID_STAKING_INFO_MAP[LstId.sSUI]);

  const suilendUtils = await getSuilendUtils(suiClient, account);

  return { lstClient, ...suilendUtils };
};

export type SpringSuiIntention = MintIntention | MintAndDepositIntention | RedeemIntention;

export type SpringSuiIntentionData = MintIntentionData | MintAndDepositIntentionData | RedeemIntentionData;

export type IntentionInput = {
  network: SuiNetworks;
  suiClient: SuiClient;
  account: WalletAccount;

  lstClient: LstClient;
  suilendClient: SuilendClient;
  obligationOwnerCap: ObligationOwnerCap<string> | undefined;
  obligation: Obligation<string> | undefined;
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
      case TransactionSubType.MINT:
        intention = MintIntention.fromData(intentionData as MintIntentionData);
        break;
      case TransactionSubType.MINT_AND_DEPOSIT:
        intention = MintAndDepositIntention.fromData(intentionData as MintAndDepositIntentionData);
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

      lstClient: this.utils.lstClient,
      suilendClient: this.utils.suilendClient,
      obligationOwnerCap: this.utils.obligationOwnerCaps?.[0],
      obligation: this.utils.obligations?.[0],
    } as IntentionInput);
  }
}
