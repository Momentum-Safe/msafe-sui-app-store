import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';
import { LENDING_MARKET_ID, LENDING_MARKET_TYPE, SuilendClient } from '@suilend/sdk';
import { phantom } from '@suilend/sdk/_generated/_framework/reified';
import { LendingMarket, ObligationOwnerCap } from '@suilend/sdk/_generated/suilend/lending-market/structs';
import { Obligation } from '@suilend/sdk/_generated/suilend/obligation/structs';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { Decoder } from './decoder';
import { BorrowIntention, BorrowIntentionData } from './intentions/borrow';
import { ClaimIntention, ClaimIntentionData } from './intentions/claim';
import { ClaimAndDepositIntention, ClaimAndDepositIntentionData } from './intentions/claimAndDeposit';
import { DepositIntention, DepositIntentionData } from './intentions/deposit';
import { RepayIntention, RepayIntentionData } from './intentions/repay';
import { WithdrawIntention, WithdrawIntentionData } from './intentions/withdraw';
import { TransactionSubType } from './types';

export type Utils = {
  suilendClient: SuilendClient;
  obligationOwnerCaps: ObligationOwnerCap<string>[];
  obligations: Obligation<string>[];
};

export const getUtils = async (suiClient: SuiClient, account: WalletAccount): Promise<Utils> => {
  const suilendClient = await SuilendClient.initializeWithLendingMarket(
    await LendingMarket.fetch(suiClient as any, phantom(LENDING_MARKET_TYPE), LENDING_MARKET_ID),
    suiClient as any,
  );

  const obligationOwnerCaps = await SuilendClient.getObligationOwnerCaps(
    account.address,
    suilendClient.lendingMarket.$typeArgs,
    suiClient as any,
  );

  const obligations = await Promise.all(
    obligationOwnerCaps.map((ownerCap) =>
      SuilendClient.getObligation(ownerCap.obligationId, suilendClient.lendingMarket.$typeArgs, suiClient as any),
    ),
  );

  return { suilendClient, obligationOwnerCaps, obligations };
};

export type SuilendIntention =
  | DepositIntention
  | WithdrawIntention
  | BorrowIntention
  | RepayIntention
  | ClaimIntention
  | ClaimAndDepositIntention;

export type SuilendIntentionData =
  | DepositIntentionData
  | WithdrawIntentionData
  | BorrowIntentionData
  | RepayIntentionData
  | ClaimIntentionData
  | ClaimAndDepositIntentionData;

export type IntentionInput = {
  network: SuiNetworks;
  suiClient: SuiClient;
  account: WalletAccount;

  suilendClient: SuilendClient;
  obligationOwnerCap: ObligationOwnerCap<string> | undefined;
  obligation: Obligation<string> | undefined;
};

export class SuilendAppHelper implements IAppHelperInternal<SuilendIntentionData> {
  application = 'Suilend';

  supportSDK = '@mysten/sui' as const;

  private utils: Utils | undefined;

  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: SuilendIntentionData }> {
    const { transaction, suiClient, account } = input;

    if (!this.utils) {
      this.utils = await getUtils(suiClient, account);
    }

    const simResult = await suiClient.devInspectTransactionBlock({
      sender: account.address,
      transactionBlock: transaction,
    });

    console.log('SuilendAppHelper.deserialize', simResult);

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
    intentionData: SuilendIntentionData;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<Transaction> {
    const { network, txSubType, intentionData, suiClient, account } = input;

    if (!this.utils) {
      this.utils = await getUtils(suiClient, account);
    }

    let intention: SuilendIntention;
    switch (txSubType) {
      case TransactionSubType.DEPOSIT:
        intention = DepositIntention.fromData(intentionData as DepositIntentionData);
        break;
      case TransactionSubType.WITHDRAW:
        intention = WithdrawIntention.fromData(intentionData as WithdrawIntentionData);
        break;
      case TransactionSubType.BORROW:
        intention = BorrowIntention.fromData(intentionData as BorrowIntentionData);
        break;
      case TransactionSubType.REPAY:
        intention = RepayIntention.fromData(intentionData as RepayIntentionData);
        break;
      case TransactionSubType.CLAIM:
        intention = ClaimIntention.fromData(intentionData as ClaimIntentionData);
        break;
      case TransactionSubType.CLAIM_AND_DEPOSIT:
        intention = ClaimAndDepositIntention.fromData(intentionData as ClaimAndDepositIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }

    const obligationId = window.localStorage.getItem('obligationId');
    const obligation = this.utils.obligations?.find((o) => o.id === obligationId) ?? this.utils.obligations?.[0];
    const obligationOwnerCap = this.utils.obligationOwnerCaps?.find((o) => o.obligationId === obligation?.id);
    console.log(
      'XXX obligationId:',
      obligationId,
      'obligations:',
      this.utils.obligations,
      'obligationOwnerCaps:',
      this.utils.obligationOwnerCaps,
    );

    return intention.build({
      network,
      suiClient,
      account,

      suilendClient: this.utils.suilendClient,
      obligationOwnerCap,
      obligation,
    } as IntentionInput);
  }
}
