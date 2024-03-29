import { TransactionType, isSameAddress } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

export interface PlainPayloadIntentionData {
  content: string;
}

export class PlainPayloadIntention extends CoreBaseIntention<PlainPayloadIntentionData> {
  txType: TransactionType.Other;

  txSubType: 'PlainPayload';

  constructor(public readonly data: PlainPayloadIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { account } = input;
    const tb = TransactionBlock.from(this.data.content);

    if (!isSameAddress(tb.blockData.sender, account.address)) {
      throw new Error('Invalid sender address');
    }

    return tb;
  }

  static fromData(data: PlainPayloadIntentionData) {
    return new PlainPayloadIntention(data);
  }
}
