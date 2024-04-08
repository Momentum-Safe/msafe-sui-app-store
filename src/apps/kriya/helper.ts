import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';
import { MSafeAppHelper } from '../interface';
import { Decoder } from './decoder';
import { AddLiquidityIntention, AddLiquidityIntentionData } from './intentions/add-liquidity';
import { AddLiquiditySingleSideIntention, AddLiquiditySingleSidedIntentionData } from './intentions/add-liquiditySingleSided';
import { ClaimRewardsIntention, ClaimRewardsIntentionData } from './intentions/claim-rewards';
import { RemoveLiquidityIntention, RemoveLiquidityIntentionData } from './intentions/remove-liquidity';
import { StakeLiquidityIntention, StakeLiquidityIntentionData } from './intentions/stake-liquidity';
import { UnstakeLiquidityIntention, UnstakeLiquidityIntentionData } from './intentions/unstake-liquidity';
import { TransactionSubType } from './types';
import { SuiNetworks } from '@/types';

export type KRIYAIntention =
    | AddLiquidityIntention
    | AddLiquiditySingleSideIntention
    | ClaimRewardsIntention
    | RemoveLiquidityIntention
    | StakeLiquidityIntention
    | UnstakeLiquidityIntention;

export type KRIYAIntentionData =
    | AddLiquidityIntentionData
    | AddLiquiditySingleSidedIntentionData
    | ClaimRewardsIntentionData
    | RemoveLiquidityIntentionData
    | StakeLiquidityIntentionData
    | UnstakeLiquidityIntentionData

export class KRIYAAppHelper implements MSafeAppHelper<KRIYAIntentionData> {
    application = 'kriya';

    async deserialize(
        input: SuiSignTransactionBlockInput & { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount },
    ): Promise<{
        txType: TransactionType;
        txSubType: TransactionSubType;
        intentionData: KRIYAIntentionData;
    }> {
        const { transactionBlock } = input;
        const decoder = new Decoder(transactionBlock);
        const result = decoder.decode();
        return {
            txType: TransactionType.Other,
            txSubType: result.type,
            intentionData: result.intentionData,
        };
    }

    async build(input: {
        intentionData: KRIYAIntentionData;
        txType: TransactionType;
        txSubType: string;
        suiClient: SuiClient;
        account: WalletAccount;
        network: SuiNetworks;

    }): Promise<TransactionBlock> {
        const { suiClient, account, network } = input;
        let intention: KRIYAIntention;
        switch (input.txSubType) {
            case TransactionSubType.AddLiquidity:
                intention = AddLiquidityIntention.fromData(input.intentionData as AddLiquidityIntentionData);
                break;
            case TransactionSubType.AddLiquiditySingleSided:
                intention = AddLiquiditySingleSideIntention.fromData(input.intentionData as AddLiquiditySingleSidedIntentionData);
                break;
            case TransactionSubType.RemoveLiquidity:
                intention = RemoveLiquidityIntention.fromData(input.intentionData as RemoveLiquidityIntentionData);
                break;
            case TransactionSubType.ClaimRewards:
                intention = ClaimRewardsIntention.fromData(input.intentionData as ClaimRewardsIntentionData);
                break;
            case TransactionSubType.StakeLiquidity:
                intention = StakeLiquidityIntention.fromData(input.intentionData as StakeLiquidityIntentionData);
                break;
            case TransactionSubType.UnstakeLiquidity:
                intention = UnstakeLiquidityIntention.fromData(input.intentionData as UnstakeLiquidityIntentionData);
                break;
            default:
                throw new Error('not implemented');
        }
        return intention.build({ suiClient, account, network });
    }
}