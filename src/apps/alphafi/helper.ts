import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';
import { IAppHelperInternal } from '@/apps/interface/sui';
import { TransactionSubType } from './types';
import { DepositDoubleAssetIntention, DepositDoubleAssetIntentionData } from './intentions/deposit-double-asset';
import { DepositSingleAssetIntention, DepositSingleAssetIntentionData } from './intentions/deposit-single-asset';
import { WithdrawAlphaIntention, WithdrawAlphaIntentionData } from './intentions/withdraw-alpha';
import { WithdrawIntention, WithdrawIntentionData } from './intentions/withdraw';
import { ClaimRewardIntention, EmptyIntentionData } from './intentions/claim-reward';
import { SuiNetworks } from '@/types';

export type AlphaFiIntention =
  | DepositDoubleAssetIntention
  | DepositSingleAssetIntention
  | WithdrawAlphaIntention
  | WithdrawIntention
  | ClaimRewardIntention;

export type AlphaFiIntentionData =
  | DepositDoubleAssetIntentionData
  | DepositSingleAssetIntentionData
  | WithdrawAlphaIntentionData
  | WithdrawIntentionData
  | EmptyIntentionData;

export class AlphaFiHelper implements IAppHelperInternal<AlphaFiIntentionData> {
  application = 'alphafi';

  supportSDK = '@mysten/sui' as const;

  // TODO: Please refer to the documentation and move the `action` and `txbParams` params into the `appContext` structure.
  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: AlphaFiIntentionData }> {
    const { txbParams, action } = input.appContext;

    return {
      txType: TransactionType.Other,
      txSubType: action,
      intentionData: {
        txbParams: { ...txbParams },
        action,
      },
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
