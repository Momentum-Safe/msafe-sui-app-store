import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../../models/scallopClient';
import { SupportCollateralCoins } from '../../types';
import { TransactionSubType } from '../../types/utils';
import { scallopInstance } from '../../models';

export interface DepositCollateralIntentionData {
  collateralCoinName: SupportCollateralCoins;
  amount: number | string;
  obligationId: string;
}

export class DepositCollateralIntention extends CoreBaseIntention<DepositCollateralIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.DepositCollateral;

  constructor(public readonly data: DepositCollateralIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const scallopClient = scallopInstance.client;
    scallopClient.client = input.suiClient;
    scallopClient.walletAddress = input.account.address;
    // const scallopClient = new ScallopClient({
    //   client: input.suiClient,
    //   walletAddress: input.account.address,
    //   networkType: input.network.split(':')[1] as any,
    // });
    // 
    return scallopClient.depositCollateral(
      this.data.collateralCoinName,
      Number(this.data.amount),
      this.data.obligationId,
      input.account.address,
    );
  }

  static fromData(data: DepositCollateralIntentionData): DepositCollateralIntention {
    return new DepositCollateralIntention(data);
  }
}
