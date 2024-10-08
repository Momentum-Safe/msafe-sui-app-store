import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { KriyaSDK } from 'kriya-dex-sdk';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';
import { SuiNetworks } from '@/types';

import { Rpc, TransactionSubType } from '../types';

export interface AddLiquidityIntentionData {
  objectId: string;
  tokenXType: string;
  tokenYType: string;
  amountX: string;
  amountY: string;
  minAddAmountX: string;
  minAddAmountY: string;
  coinX: string;
  coinY: string;
}

export class AddLiquidityIntention extends BaseIntentionLegacy<AddLiquidityIntentionData> {
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
    const dexSdk = new KriyaSDK.Dex(Rpc);
    const { objectId, tokenXType, tokenYType, amountX, amountY, minAddAmountX, minAddAmountY, coinX, coinY } =
      this.data;

    const txb = new TransactionBlock();
    const res = await suiClient.getObject({
      id: objectId,
      options: {
        showContent: true,
      },
    });
    const isStable: boolean = (res.data.content as { fields: any })?.fields!.is_stable;
    dexSdk.addLiquidity(
      {
        objectId,
        tokenXType,
        tokenYType,
        isStable,
      },
      BigInt(amountX),
      BigInt(amountY),
      BigInt(minAddAmountX),
      BigInt(minAddAmountY),
      coinX,
      coinY,
      // @ts-ignore
      txb,
      address,
    );

    return txb;
  }

  static fromData(data: AddLiquidityIntentionData) {
    return new AddLiquidityIntention(data);
  }
}
