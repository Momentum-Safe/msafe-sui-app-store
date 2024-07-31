import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../../models/scallopClient';
import { SupportPoolCoins } from '../../types';
import { TransactionSubType } from '../../types/utils';
import scallopInstance from '../../models/scallop';

export interface BorrowWithBoostIntentionData {
  coinName: SupportPoolCoins;
  amount: number | string;
  obligationId: string;
  obligationKey: string;
  veScaKey: string;
}

export class BorrowWithBoostIntention extends CoreBaseIntention<BorrowWithBoostIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.Borrow;

  constructor(public readonly data: BorrowWithBoostIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const scallopClient = scallopInstance.client;
    scallopClient.walletAddress = input.account.address;
    scallopClient.client = input.suiClient;
    // const scallopClient = new ScallopClient({
    //   client: input.suiClient,
    //   walletAddress: input.account.address,
    //   networkType: input.network.split(':')[1] as any,
    // });
    
    return scallopClient.borrowWithBoost(
      this.data.coinName,
      Number(this.data.amount),
      this.data.obligationId,
      this.data.obligationKey,
      this.data.veScaKey,
      input.account.address,
    );
  }

  static fromData(data: BorrowWithBoostIntentionData): BorrowWithBoostIntention {
    return new BorrowWithBoostIntention(data);
  }
}
