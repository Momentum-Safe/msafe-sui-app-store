import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { TransactionSubType } from '../types';
import { SuiClient } from '@mysten/sui.js/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { KriyaSDK } from 'kriya-sdk'
import { SuiNetworks } from '@/types';

export interface RemoveLiquidityIntentionData {
    objectId: string,
    tokenXType: string,
    tokenYType: string,
    amount: bigint,
    kriyaLpToken: string,
}

export class RemoveLiquidityIntention extends CoreBaseIntention<RemoveLiquidityIntentionData> {
    txType!: TransactionType.Other;

    txSubType!: TransactionSubType.RemoveLiquidity;

    constructor(public override readonly data: RemoveLiquidityIntentionData) {
        super(data);
    }

    async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks; }): Promise<TransactionBlock> {
        const { suiClient, account } = input;
        const address = account.address;
        const dexSdk = new KriyaSDK.Dex(suiClient);
        const { objectId, tokenXType, tokenYType, amount, kriyaLpToken } = this.data;
        const pool = { objectId, tokenXType, tokenYType }
        const txb = new TransactionBlock();

        dexSdk.removeLiquidity({
            pool,
            amount,
            kriyaLpToken,
            txb,
            address
        });

        return txb;
    }

    static fromData(data: RemoveLiquidityIntentionData) {
        return new RemoveLiquidityIntention(data);
    }
}
