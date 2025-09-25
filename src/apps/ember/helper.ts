import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternal } from '@/apps/interface/sui';

import { Decoder } from './decoder';
import { CancelPendingWithdrawalRequest } from './intentions/cancel-pending-withdrawal-request';
import { DepositAsset } from './intentions/deposit-asset';
import { MintShares } from './intentions/mint-shares';
import { RedeemShares } from './intentions/redeem-shares';
import { SuiNetworks, EmberIntentionData, TransactionSubType } from './types';

export type EmberIntention = DepositAsset | MintShares | RedeemShares | CancelPendingWithdrawalRequest;

export class EmberHelper implements IAppHelperInternal<EmberIntentionData> {
  application = 'ember';

  supportSDK = '@mysten/sui' as const;

  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{
    txType: TransactionType;
    txSubType: string;
    intentionData: EmberIntentionData & { appContext?: any };
  }> {
    console.log('Ember helper deserialize input: ', input);

    const { transaction, appContext } = input;

    const decoder = new Decoder(transaction, appContext);

    const result = await decoder.decode();

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
    intentionData: EmberIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { suiClient, account, network } = input;

    console.log(input.txSubType);
    let intention: EmberIntention;
    switch (input.txSubType) {
      case TransactionSubType.DepositAsset:
        intention = DepositAsset.fromData(input.intentionData);
        break;

      case TransactionSubType.MintShares:
        intention = MintShares.fromData(input.intentionData);
        break;

      case TransactionSubType.RedeemShares:
        intention = RedeemShares.fromData(input.intentionData);
        break;

      case TransactionSubType.CancelPendingWithdrawalRequest:
        intention = CancelPendingWithdrawalRequest.fromData(input.intentionData);
        break;

      default:
        throw new Error('not implemented');
    }

    return intention.build({ suiClient, account, network });
  }
}
