import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks, TransactionSubType } from '../types';
import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Pool } from 'turbos-clmm-sdk';
import { SuiClient } from '@mysten/sui.js/dist/cjs/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { TurbosSdk, Network } from 'turbos-clmm-sdk';

export interface CreatePoolIntentionData extends Pool.CreatePoolOptions {}

export class CreatePoolIntention extends CoreBaseIntention<CreatePoolIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: CreatePoolIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const turbosSdk = new TurbosSdk(input.network.replace('sui:', '') as Network, input.suiClient);
    const { fee, address, tickLower, tickUpper, sqrtPrice, slippage, coinTypeA, coinTypeB, amountA, amountB, txb } =
      this.data;

    return turbosSdk.pool.createPool({
      fee,
      amountA,
      amountB,
      address,
      tickLower,
      tickUpper,
      sqrtPrice,
      slippage,
      coinTypeA,
      coinTypeB,
      txb,
    });
  }

  static fromData(data: CreatePoolIntentionData) {
    return new CreatePoolIntention(data);
  }
}
