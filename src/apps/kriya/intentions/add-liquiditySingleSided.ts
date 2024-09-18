import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { KriyaSDK } from 'kriya-dex-sdk';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';
import { SuiNetworks } from '@/types';

import { Rpc, TransactionSubType } from '../types';

export interface AddLiquiditySingleSidedIntentionData {
  objectId: string;
  tokenXType: string;
  tokenYType: string;
  inputCoinType: string;
  inputCoinAmount: string;
  inputCoin: string;
}

export class AddLiquiditySingleSideIntention extends BaseIntentionLegacy<AddLiquiditySingleSidedIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquiditySingleSided;

  constructor(public override readonly data: AddLiquiditySingleSidedIntentionData) {
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
    const { objectId, tokenXType, tokenYType, inputCoinType, inputCoinAmount, inputCoin } = this.data;
    const txb = new TransactionBlock();
    const res = await suiClient.getObject({
      id: objectId,
      options: {
        showContent: true,
      },
    });
    const isStable: boolean = (res.data.content as { fields: any })?.fields!.is_stable;
    dexSdk.addLiquiditySingleSided(
      {
        objectId,
        tokenXType,
        tokenYType,
        isStable,
      },
      inputCoinType,
      BigInt(inputCoinAmount),
      inputCoin,
      1,
      // @ts-ignore
      txb,
      address,
    );
    return txb;
  }

  static fromData(data: AddLiquiditySingleSidedIntentionData) {
    return new AddLiquiditySingleSideIntention(data);
  }
}
