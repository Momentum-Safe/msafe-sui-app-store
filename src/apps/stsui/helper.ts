import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';
import { IAppHelperInternal } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';
import { TransactionSubType } from './types';
import { Decoder } from './decoder';
import { MintIntention, MintIntentionData } from './intentions/mint';
import { RedeemIntention, RedeemIntentionData } from './intentions/redeem';

export type StSuiIntention = MintIntention | RedeemIntention;

export type StSuiIntentionData = MintIntentionData | RedeemIntentionData;

export class StSuiHelper implements IAppHelperInternal<StSuiIntentionData> {
  application = 'stsui';

  supportSDK = '@mysten/sui' as const;

  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: StSuiIntentionData }> {
    const { transaction, suiClient } = input;

    const simResult = await suiClient.devInspectTransactionBlock({
      sender: transaction.getData().sender,
      transactionBlock: transaction,
    });
    console.log('StSuiHelper Sim result - ', simResult);

    const decoder = new Decoder(transaction, simResult);
    const result = decoder.decode();

    return {
      txType: TransactionType.Other,
      txSubType: result.type,
      intentionData: result.intentionData,
    };
  }

  async build(input: {
    intentionData: StSuiIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { account } = input;
    console.log('StSui build transaction type', input.txSubType);

    let intention: StSuiIntention;
    switch (input.txSubType) {
      case TransactionSubType.MINT:
        intention = MintIntention.fromData(input.intentionData as MintIntentionData);
        break;
      case TransactionSubType.REDEEM:
        intention = RedeemIntention.fromData(input.intentionData as RedeemIntentionData);
        break;
      default:
        throw new Error('build not implemented');
    }

    return intention.build({ account });
  }
}
