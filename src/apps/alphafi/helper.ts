import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { Decoder } from './decoder';
import { ClaimRewardIntention } from './intentions/claim-reward';
import { DepositDoubleAssetIntention } from './intentions/deposit-double-asset';
import { DepositSingleAssetIntention } from './intentions/deposit-single-asset';
import { WithdrawIntention } from './intentions/withdraw';
import { WithdrawAlphaIntention } from './intentions/withdraw-alpha';
import {
  AlphaFiIntentionData,
  DepositDoubleAssetIntentionData,
  DepositSingleAssetIntentionData,
  EmptyIntentionData,
  TransactionSubType,
  WithdrawAlphaIntentionData,
  WithdrawIntentionData,
} from './types';

export type AlphaFiIntention =
  | DepositDoubleAssetIntention
  | DepositSingleAssetIntention
  | WithdrawAlphaIntention
  | WithdrawIntention
  | ClaimRewardIntention;

export class AlphaFiHelper implements IAppHelperInternal<AlphaFiIntentionData> {
  application = 'alphafi';

  supportSDK = '@mysten/sui' as const;

  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: AlphaFiIntentionData }> {
    const { transaction, suiClient, account } = input;

    const simResult = await suiClient.devInspectTransactionBlock({
      sender: transaction.getData().sender,
      transactionBlock: transaction,
    });
    console.log('AlphaFiHelper Sim result - ', simResult);

    const decoder = new Decoder(transaction, simResult);
    const result = decoder.decode();

    return {
      txType: TransactionType.Other,
      txSubType: result.type,
      intentionData: result.intentionData,
    };
  }

  async build(input: {
    intentionData: AlphaFiIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { account } = input;
    console.log('AlphaFi build transaction type', input.txSubType);

    let intention: AlphaFiIntention;
    switch (input.txSubType) {
      case TransactionSubType.DEPOSIT_SINGLE_ASSET:
        intention = DepositSingleAssetIntention.fromData(input.intentionData as DepositSingleAssetIntentionData);
        break;
      case TransactionSubType.DEPOSIT_DOUBLE_ASSET:
        intention = DepositDoubleAssetIntention.fromData(input.intentionData as DepositDoubleAssetIntentionData);
        break;
      case TransactionSubType.WITHDRAW:
        intention = WithdrawIntention.fromData(input.intentionData as WithdrawIntentionData);
        break;
      case TransactionSubType.WITHDRAW_ALPHA:
        intention = WithdrawAlphaIntention.fromData(input.intentionData as WithdrawAlphaIntentionData);
        break;
      case TransactionSubType.CLAIM_REWARD:
        intention = ClaimRewardIntention.fromData(input.intentionData as EmptyIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }

    return intention.build({ account });
  }
}
