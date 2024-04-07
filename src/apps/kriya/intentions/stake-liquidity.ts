import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Rpc, TransactionSubType } from '../types';
import { SuiNetworks } from '@/types';
import { SuiClient } from '@mysten/sui.js/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { KriyaSDK } from 'kriya-dex-sdk'

export interface StakeLiquidityIntentionData {
    lpObject: any,
    lockTime: string,
    objectId: string,
    tokenXType: string,
    tokenYType: string
}

export class StakeLiquidityIntention extends CoreBaseIntention<StakeLiquidityIntentionData> {
    txType!: TransactionType.Other;

    txSubType!: TransactionSubType.StakeLiquidity;

    constructor(public override readonly data: StakeLiquidityIntentionData) {
        super(data);
    }

    async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks; }): Promise<TransactionBlock> {
        const { suiClient, account } = input;
        const address = account.address;
        const isMainnet: boolean = input.network === 'sui:mainnet';
        const farmSdk = new KriyaSDK.StakingFarm(Rpc, isMainnet);
        const { lpObject, lockTime, objectId, tokenXType, tokenYType } = this.data;
        const farm = { objectId, tokenXType, tokenYType }
        const txb = new TransactionBlock();

        farmSdk.stakeTx(
            // @ts-ignore
            txb,
            lpObject,
            lockTime,
            farm,
            address
        );

        return txb;
    }

    static fromData(data: StakeLiquidityIntentionData) {
        return new StakeLiquidityIntention(data);
    }
}
