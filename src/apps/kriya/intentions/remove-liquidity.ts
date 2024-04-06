import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Rpc, TransactionSubType } from '../types';
import { SuiClient } from '@mysten/sui.js/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { KriyaSDK } from 'kriya-dex-sdk'
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
        const dexSdk = new KriyaSDK.Dex(Rpc);
        const { objectId, tokenXType, tokenYType, amount, kriyaLpToken } = this.data;
        const txb = new TransactionBlock();
        const res = await suiClient.getObject(
            {
                id: objectId,
                options: {
                    showContent: true,
                },
            });
        const isStable: boolean = (res.data.content as { fields: any })?.fields!.is_stable;
        const pool = { objectId, tokenXType, tokenYType, isStable}
        dexSdk.removeLiquidity(
            pool,
            amount,
            kriyaLpToken,
            // @ts-ignore
            txb,
            address
        );

        return txb;
    }

    static fromData(data: RemoveLiquidityIntentionData) {
        return new RemoveLiquidityIntention(data);
    }
}
