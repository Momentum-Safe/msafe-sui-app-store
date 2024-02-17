import { TransactionType, buildCoinTransferTxb } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';

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

  async build(input: { suiClient: SuiClient; account: WalletAccount }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    return buildCoinTransferTxb(suiClient, this.data, account.address);
  }

  static fromData(data: CoinTransferIntentionData) {
    return new CoinTransferIntention(data);
  }
}
