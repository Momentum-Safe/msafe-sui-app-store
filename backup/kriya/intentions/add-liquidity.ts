import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { KriyaSDK } from 'kriya-dex-sdk';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../types';

export interface AddLiquidityIntentionData {
  objectId: string;
  tokenXType: string;
  tokenYType: string;
  amountX: bigint;
  amountY: bigint;
  minAddAmountX: bigint;
  minAddAmountY: bigint;
  coinX: string;
  coinY: string;
}

export class AddLiquidityIntention extends CoreBaseIntention<AddLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquidity;

  constructor(public override readonly data: AddLiquidityIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    const { address } = account;
    const dexSdk = new KriyaSDK.Dex(suiClient);
    const { objectId, tokenXType, tokenYType, amountX, amountY, minAddAmountX, minAddAmountY, coinX, coinY } =
      this.data;
    const txb = new TransactionBlock();

    dexSdk.addLiquidity({
      objectId,
      tokenXType,
      tokenYType,
      amountX,
      amountY,
      minAddAmountX,
      minAddAmountY,
      coinX,
      coinY,
      txb,
      address,
    });

    return txb;
  }

  static fromData(data: AddLiquidityIntentionData) {
    return new AddLiquidityIntention(data);
  }
}
