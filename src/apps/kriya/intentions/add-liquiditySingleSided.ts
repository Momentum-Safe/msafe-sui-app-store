import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { TransactionSubType } from '../types';
import { SuiClient } from '@mysten/sui.js/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { KriyaSDK } from 'kriya-sdk';
import { SuiNetworks } from '@/types';


export interface AddLiquiditySingleSidedIntentionData {
    objectId: string,
    tokenXType: string,
    tokenYType: string
    inputCoinType: string,
    inputCoinAmount: bigint,
    inputCoin: string,
}

export class AddLiquiditySingleSideIntention extends CoreBaseIntention<AddLiquiditySingleSidedIntentionData> {
    txType!: TransactionType.Other;

    txSubType!: TransactionSubType.AddLiquiditySingleSided;

    constructor(public override readonly data: AddLiquiditySingleSidedIntentionData) {
        super(data);
    }

    async build(input: { suiClient: SuiClient; account: WalletAccount; network: SuiNetworks; }): Promise<TransactionBlock> {
        const { suiClient, account } = input;
        const address = account.address;
        const dexSdk = new KriyaSDK.Dex(suiClient);
        const { objectId, tokenXType, tokenYType, inputCoinType, inputCoinAmount, inputCoin } = this.data;
        const txb = new TransactionBlock();

        return dexSdk.addLiquiditySingleSided({
            objectId,
            tokenXType,
            tokenYType,
            inputCoinType,
            inputCoinAmount,
            inputCoin,
            swapSlippageTolerance: 1,
            txb,
            address,
        });
    }

    static fromData(data: AddLiquiditySingleSidedIntentionData) {
        return new AddLiquiditySingleSideIntention(data);
    }
}
