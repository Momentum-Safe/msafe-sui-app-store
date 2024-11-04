import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';
import { LENDING_MARKET_ID, LENDING_MARKET_TYPE, SuilendClient } from '@suilend/sdk';
import { phantom } from '@suilend/sdk/_generated/_framework/reified';
import { LendingMarket, ObligationOwnerCap } from '@suilend/sdk/_generated/suilend/lending-market/structs';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { Decoder } from './decoder';
import { DepositIntention, DepositIntentionData } from './intentions/deposit';
import { IntentionInput, SuilendIntention, SuilendIntentionData, TransactionSubType } from './types';

const getSuilendClient = async (suiClient: SuiClient) =>
  SuilendClient.initializeWithLendingMarket(
    await LendingMarket.fetch(
      suiClient as unknown as SuilendClient['client'],
      phantom(LENDING_MARKET_TYPE),
      LENDING_MARKET_ID,
    ),
    suiClient as unknown as SuilendClient['client'],
  );

const getObligationOwnerCaps = async (account: WalletAccount, suilendClient: SuilendClient, suiClient: SuiClient) =>
  SuilendClient.getObligationOwnerCaps(
    account.address,
    suilendClient.lendingMarket.$typeArgs,
    suiClient as unknown as SuilendClient['client'],
  );

export class SuilendAppHelper implements IAppHelperInternal<SuilendIntentionData> {
  application = 'Suilend';

  supportSDK = '@mysten/sui' as const;

  private suilendClient: SuilendClient | undefined;

  private obligationOwnerCaps: ObligationOwnerCap<string>[] | undefined;

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
      this.obligationOwnerCaps = await getObligationOwnerCaps(account, this.suilendClient, suiClient);
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
      this.obligationOwnerCaps = await getObligationOwnerCaps(account, this.suilendClient, suiClient);
    }

    let intention: SuilendIntention;
    switch (txSubType) {
      case TransactionSubType.DEPOSIT:
        intention = DepositIntention.fromData(intentionData as DepositIntentionData);
        break;
      // case TransactionSubType.WITHDRAW:
      //   intention = WithdrawIntention.fromData(intentionData as WithdrawIntentionData);
      //   break;
      // case TransactionSubType.BORROW:
      //   intention = BorrowIntention.fromData(intentionData as BorrowIntentionData);
      //   break;
      // case TransactionSubType.REPAY:
      //   intention = RepayIntention.fromData(intentionData as RepayIntentionData);
      //   break;
      // case TransactionSubType.CLAIM:
      //   intention = ClaimIntention.fromData(intentionData as ClaimIntentionData);
      //   break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({
      network,
      suiClient,
      account,
      suilendClient: this.suilendClient,
      obligationOwnerCaps: this.obligationOwnerCaps,
    } as IntentionInput);
  }
}
