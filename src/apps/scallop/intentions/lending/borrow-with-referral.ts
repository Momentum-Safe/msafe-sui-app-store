import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../../models/scallopClient';
import { SupportPoolCoins } from '../../types';
import { TransactionSubType } from '../../types/utils';

export interface BorrowWithReferralIntentionData {
  coinName: SupportPoolCoins;
  amount: number | string;
  obligationId: string;
  obligationKey: string;
  veScaKey: string;
}

export class BorrowWithReferralIntention extends CoreBaseIntention<BorrowWithReferralIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.BorrowWithReferral;

  constructor(public readonly data: BorrowWithReferralIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const scallopClient = new ScallopClient({
      client: input.suiClient,
      walletAddress: input.account.address,
      networkType: input.network.split(':')[1] as any,
    });
    scallopClient.init();
    return scallopClient.borrowWithReferral(
      this.data.coinName,
      Number(this.data.amount),
      this.data.obligationId,
      this.data.obligationKey,
      this.data.veScaKey,
      input.account.address,
    );
  }

  static fromData(data: BorrowWithReferralIntentionData): BorrowWithReferralIntention {
    return new BorrowWithReferralIntention(data);
  }
}
