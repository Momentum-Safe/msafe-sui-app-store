import { TransactionType } from '@msafe/sui3-utils';
import { MSafeAppHelper } from '@/apps/interface';
import { SuiClient } from '@mysten/sui.js/client';
import { WalletAccount, SuiSignTransactionBlockInput } from '@mysten/wallet-standard';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { fromHEX, toHEX } from '@mysten/sui.js/utils';
import { CetusIntention, CetusIntentionData } from './intention';
import { SuiNetworks } from './types';

export class CetusHelper implements MSafeAppHelper<CetusIntentionData> {
  application = 'cetus';

  async deserialize(
    input: SuiSignTransactionBlockInput & { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount } & {
      action?: string;
      payloadParams?: any;
    },
  ): Promise<{ txType: TransactionType; txSubType: string; intentionData: CetusIntentionData }> {
    console.log('Helper deserialize input: ', input);
    const { transactionBlock, suiClient } = input;

    const content = await transactionBlock.build({ client: suiClient });

    return {
      txType: TransactionType.Other,
      txSubType: 'CetusTransaction',
      intentionData: { content: toHEX(content) },
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
    const intention = CetusIntention.fromData(input.intentionData);
    return intention.build({ suiClient, account });
  }
}
