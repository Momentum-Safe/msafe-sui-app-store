import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { Rpc, TransactionSubType } from '../types';
import { SuiNetworks } from '@/types';
import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { KriyaSDK } from 'kriya-dex-sdk';

export interface UnstakeLiquidityIntentionData {
  objectId: string;
  tokenXType: string;
  tokenYType: string;
  positionObjectId: string;
}

export class UnstakeLiquidityIntention extends CoreBaseIntention<UnstakeLiquidityIntentionData> {
  txType!: TransactionType.Other;

  txSubType!: TransactionSubType.UnstakeLiquidity;

  constructor(public override readonly data: UnstakeLiquidityIntentionData) {
    super(data);
  }

  async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks }): Promise<Transaction> {
    const { suiClient, account } = input;
    const address = account.address;
    const isMainnet: boolean = input.network === 'sui:mainnet';
    const farmSdk = new KriyaSDK.StakingFarm(Rpc, isMainnet);
    const { objectId, tokenXType, tokenYType, positionObjectId } = this.data;
    const farm = { objectId, tokenXType, tokenYType };
    const txb = new Transaction();

    farmSdk.withdrawTx(
      // @ts-ignore
      txb,
      farm,
      positionObjectId,
      address,
    );

    return txb;
  }

  static fromData(data: UnstakeLiquidityIntentionData) {
    return new UnstakeLiquidityIntention(data);
  }
}
