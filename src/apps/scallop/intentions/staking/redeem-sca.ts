import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../../models/scallopClient';
import { NetworkType, TransactionSubType } from '../../types';

export interface RedeemScaIntentionData {
  veScaKey: string;
}

export class RedeemScaIntention extends CoreBaseIntention<RedeemScaIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.RedeemSca;

  constructor(public readonly data: RedeemScaIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const network = input.network.split(':')[1] as NetworkType;
    const scallopClient = new ScallopClient({
      client: input.suiClient,
      walletAddress: input.account.address,
      networkType: network,
    });
    scallopClient.init();
    return scallopClient.redeemSca(this.data.veScaKey);
  }

  static fromData(data: RedeemScaIntentionData): RedeemScaIntention {
    return new RedeemScaIntention(data);
  }
}
