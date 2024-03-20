import { SuiNetworks, TransactionSubType } from '../types';
import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Pool } from 'turbos-clmm-sdk';
import { SuiClient } from '@mysten/sui.js/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { TurbosSdk, Network } from 'turbos-clmm-sdk';
import { CoreBaseIntention } from '@/apps/msafe-core/intention';

export interface RemoveLiquidityIntentionData extends Pool.RemoveLiquidityOptions {}

export class RemoveLiquidityIntention extends CoreBaseIntention<RemoveLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: RemoveLiquidityIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const {
      pool,
      address,
      amountA,
      amountB,
      slippage,
      nft,
      decreaseLiquidity,
      collectAmountA,
      collectAmountB,
      rewardAmounts,
      txb,
    } = this.data;

    return turbosSdk.pool.removeLiquidity({
      pool,
      decreaseLiquidity,
      nft,
      amountA,
      amountB,
      slippage,
      address,
      collectAmountA,
      collectAmountB,
      rewardAmounts,
      txb,
    });
  }

  static fromData(data: RemoveLiquidityIntentionData) {
    return new RemoveLiquidityIntention(data);
  }
}
