import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount, SuiSignTransactionBlockInput } from '@mysten/wallet-standard';

import { MSafeAppHelper } from '@/apps/interface';

import { SwapIntention } from './intentions/swap';
import { SuiNetworks, CetusIntentionData, TransactionSubType } from './types';

export type CetusIntention = SwapIntention;

export class CetusHelper implements MSafeAppHelper<CetusIntentionData> {
  application = 'cetus';

  async deserialize(
    input: SuiSignTransactionBlockInput & { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount } & {
      action?: string;
      payloadParams?: any;
    },
  ): Promise<{ txType: TransactionType; txSubType: string; intentionData: CetusIntentionData }> {
    console.log('Helper deserialize input: ', input);
    // const { transactionBlock, suiClient, payloadParams, action } = input;
    const { payloadParams, action } = input;

    // const content = await transactionBlock.build({ client: suiClient });

    return {
      txType: TransactionType.Other,
      txSubType: `Cetus${action}`,
      intentionData: {
        payloadParams,
        action,
      },
    };
  }

  async build(input: {
    intentionData: CetusIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    let intention: CetusIntention;
    switch (input.txSubType) {
      case TransactionSubType.CetusSwap:
        intention = SwapIntention.fromData(input.intentionData) as CetusIntention;
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ suiClient, account });
  }
}
