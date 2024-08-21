import { TransactionType } from '@msafe/sui3-utils';
import { IotaClient } from '@iota/iota-sdk/client';
import { TransactionBlock } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { buildCoinTransferTxb } from './utils';

export interface CoinTransferIntentionData {
  recipient: string;
  coinType: string;
  amount: string;
}

export class CoinTransferIntention extends CoreBaseIntention<CoinTransferIntentionData> {
  txType: TransactionType.Assets;

  txSubType: 'SendCoin';

  constructor(public readonly data: CoinTransferIntentionData) {
    super(data);
  }

  async build(input: { client: IotaClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { client, account } = input;
    return buildCoinTransferTxb(client, this.data, account.address);
  }

  static fromData(data: CoinTransferIntentionData) {
    return new CoinTransferIntention(data);
  }
}
