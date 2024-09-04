import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { Rpc, TransactionSubType } from '../types';
import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { KriyaSDK } from 'kriya-dex-sdk';
import { SuiNetworks } from '@/types';

export interface AddLiquiditySingleSidedIntentionData {
  objectId: string;
  tokenXType: string;
  tokenYType: string;
  inputCoinType: string;
  inputCoinAmount: string;
  inputCoin: string;
}

export class AddLiquiditySingleSideIntention extends CoreBaseIntention<AddLiquiditySingleSidedIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.AddLiquiditySingleSided;

  constructor(public override readonly data: AddLiquiditySingleSidedIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
    const { suiClient, account } = input;
    const address = account.address;
    const dexSdk = new KriyaSDK.Dex(Rpc);
    const { objectId, tokenXType, tokenYType, inputCoinType, inputCoinAmount, inputCoin } = this.data;
    const txb = new Transaction();
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
