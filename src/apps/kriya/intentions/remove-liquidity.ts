import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { KriyaSDK } from 'kriya-dex-sdk';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';
import { SuiNetworks } from '@/types';

import { Rpc, TransactionSubType } from '../types';

export interface RemoveLiquidityIntentionData {
  objectId: string;
  tokenXType: string;
  tokenYType: string;
  amount: string;
  kriyaLpToken: string;
}

export class RemoveLiquidityIntention extends BaseIntentionLegacy<RemoveLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.RemoveLiquidity;

  constructor(public override readonly data: RemoveLiquidityIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    const { address } = account;
    const dexSdk = new KriyaSDK.Dex(Rpc);
    const { objectId, tokenXType, tokenYType, amount, kriyaLpToken } = this.data;
    const txb = new TransactionBlock();
    const res = await suiClient.getObject({
      id: objectId,
      options: {
        showContent: true,
      },
    });
    const isStable: boolean = (res.data.content as { fields: any })?.fields!.is_stable;
    const pool = { objectId, tokenXType, tokenYType, isStable };
    dexSdk.removeLiquidity(
      pool,
      BigInt(amount),
      kriyaLpToken,
      // @ts-ignore
      txb,
      address,
    );

    return txb;
  }

  static fromData(data: RemoveLiquidityIntentionData) {
    return new RemoveLiquidityIntention(data);
  }
}
