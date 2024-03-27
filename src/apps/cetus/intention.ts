import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { fromHEX } from '@mysten/sui.js/utils';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

export interface CetusIntentionData {
  content: string;
}

export class CetusIntention extends CoreBaseIntention<CetusIntentionData> {
  txType: TransactionType.Other;

  txSubType: 'CetusTransaction';

  constructor(public readonly data: CetusIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    const txb = TransactionBlock.from(fromHEX(this.data.content));

    const inspectResult = await suiClient.devInspectTransactionBlock({
      transactionBlock: txb,
      sender: account.address,
    });
    const success = inspectResult.effects.status.status === 'success';
    if (!success) {
      // throw new Error(inspectResult.effects.status.error);
      console.log('Intention build Error: ', inspectResult.effects.status.error);
    }

    return txb;
  }

  static fromData(data: CetusIntentionData) {
    return new CetusIntention(data);
  }
}
