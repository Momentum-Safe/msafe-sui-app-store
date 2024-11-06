import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';
import { LENDING_MARKET_ID, LENDING_MARKET_TYPE, SuilendClient } from 'suilend-sdk';
import { phantom } from 'suilend-sdk/_generated/_framework/reified';
import { LendingMarket, ObligationOwnerCap } from 'suilend-sdk/_generated/suilend/lending-market/structs';
import { Obligation } from 'suilend-sdk/_generated/suilend/obligation/structs';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { Decoder } from './decoder';
import { BorrowIntention, BorrowIntentionData } from './intentions/borrow';
import { ClaimRewardsIntention, ClaimRewardsIntentionData } from './intentions/claimRewards';
import { DepositIntention, DepositIntentionData } from './intentions/deposit';
import { RepayIntention, RepayIntentionData } from './intentions/repay';
import { WithdrawIntention, WithdrawIntentionData } from './intentions/withdraw';
import { TransactionSubType } from './types';

const getSuilendClient = async (suiClient: SuiClient) =>
  SuilendClient.initializeWithLendingMarket(
    await LendingMarket.fetch(suiClient as any, phantom(LENDING_MARKET_TYPE), LENDING_MARKET_ID),
    suiClient as any,
  );

const getObligationOwnerCaps = async (suiClient: SuiClient, account: WalletAccount, suilendClient: SuilendClient) =>
  SuilendClient.getObligationOwnerCaps(account.address, suilendClient.lendingMarket.$typeArgs, suiClient as any);

const getObligations = async (
  suiClient: SuiClient,
  suilendClient: SuilendClient,
  obligationOwnerCaps: ObligationOwnerCap<string>[],
) =>
  Promise.all(
    obligationOwnerCaps.map((ownerCap) =>
      SuilendClient.getObligation(ownerCap.obligationId, suilendClient.lendingMarket.$typeArgs, suiClient as any),
    ),
  );

export type SuilendIntention =
  | DepositIntention
  | WithdrawIntention
  | BorrowIntention
  | RepayIntention
  | ClaimRewardsIntention;

export type SuilendIntentionData =
  | DepositIntentionData
  | WithdrawIntentionData
  | BorrowIntentionData
  | RepayIntentionData
  | ClaimRewardsIntentionData;

export type IntentionInput = {
  network: SuiNetworks;
  suiClient: SuiClient;
  account: WalletAccount;
  suilendClient: SuilendClient;
  obligationOwnerCaps: ObligationOwnerCap<string>[];
  obligations: Obligation<string>[];
};

export class SuilendAppHelper implements IAppHelperInternal<SuilendIntentionData> {
  application = 'Suilend';

  supportSDK = '@mysten/sui' as const;

  private suilendClient: SuilendClient | undefined;

  private obligationOwnerCaps: ObligationOwnerCap<string>[] | undefined;

  private obligations: Obligation<string>[] | undefined;

  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: SuilendIntentionData }> {
    const { transaction, suiClient, account } = input;

    if (!this.suilendClient) {
      this.suilendClient = await getSuilendClient(suiClient);
    }
    if (!this.obligationOwnerCaps) {
      this.obligationOwnerCaps = await getObligationOwnerCaps(suiClient, account, this.suilendClient);
    }
    if (!this.obligations) {
      this.obligations = await getObligations(suiClient, this.suilendClient, this.obligationOwnerCaps);
    }

    const decoder = new Decoder(transaction);
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

    if (!this.suilendClient) {
      this.suilendClient = await getSuilendClient(suiClient);
    }
    if (!this.obligationOwnerCaps) {
      this.obligationOwnerCaps = await getObligationOwnerCaps(suiClient, account, this.suilendClient);
    }
    if (!this.obligations) {
      this.obligations = await getObligations(suiClient, this.suilendClient, this.obligationOwnerCaps);
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
      case TransactionSubType.CLAIM_REWARDS:
        intention = ClaimRewardsIntention.fromData(intentionData as ClaimRewardsIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({
      network,
      suiClient,
      account,
      suilendClient: this.suilendClient,
      obligationOwnerCaps: this.obligationOwnerCaps,
      obligations: this.obligations,
    } as IntentionInput);
  }
}
