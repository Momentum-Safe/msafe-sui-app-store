import { IotaClient } from '@iota/iota-sdk/client';
import { TransactionBlock } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType, isSameAddress } from '@msafe/iota-utils';

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

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<TransactionBlock> {
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
