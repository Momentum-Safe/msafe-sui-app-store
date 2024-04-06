import { TransactionType } from '@msafe/sui3-utils';
import { bcs } from '@mysten/sui.js/bcs';
import { MoveCallTransaction } from '@mysten/sui.js/dist/cjs/builder';
import { TransactionBlockInput, TransactionBlock } from '@mysten/sui.js/transactions';
import { normalizeStructTag, normalizeSuiAddress } from '@mysten/sui.js/utils';
import { config } from './config';
import { TransactionSubType } from './types';

export function isSameCoinType(type1: string, type2: string) {
    return normalizeStructTag(type1) === normalizeStructTag(type2);
}

export function isSameTarget(target1: string, target2: string): boolean {
    return normalizeStructTag(target1) === normalizeStructTag(target2);
}

type DecodeResult = {
    txType: TransactionType;
    type: TransactionSubType;
    intentionData: any;
};


export class Decoder {
    constructor(public readonly txb: TransactionBlock) { }

    decode() {
        console.log('txb', this.txb);
        if (this.isAddLiquidityTransaction()) {
            return this.decodeAddLiquidity();
        }
        if (this.isAddLiquiditySingleSidedTransaction()) {
            return this.decodeAddLiquiditySingleSided();
        }
        if (this.isClaimRewardsTransaction()) {
            return this.decodeClaimRewards();
        }
        if (this.isRemoveLiquidityTransaction()) {
            return this.decodeRemoveLiquidity();
        }
        if (this.isStakeLiquidityTransaction()) {
            return this.decodeStakeLiquidity();
        }
        if (this.isUnstakeLiquidityTransaction()) {
            return this.decodeUnstakeLiquidity();
        }
        throw new Error(`Unknown transaction type`);
    }

    private isAddLiquidityTransaction() {
        return !!this.getMoveCallTransaction(`${config.packageId}::spot_dex::add_liquidity`);
    }

    private isAddLiquiditySingleSidedTransaction() {
        return (!!this.getMoveCallTransaction(`${config.packageId}::spot_dex::add_liquidity`) &&
            (!!this.getMoveCallTransaction(`${config.packageId}::spot_dex::${config.functions.swapX}`) || !!this.getMoveCallTransaction(`${config.packageId}::spot_dex::${config.functions.swapY}`)));
    }

    private isClaimRewardsTransaction() {
        return !!this.getMoveCallTransaction(`${config.farmPackageId}::farm::claim`);
    }

    private isRemoveLiquidityTransaction() {
        return !!this.getMoveCallTransaction(`${config.packageId}::spot_dex::remove_liquidity`);
    }

    private isStakeLiquidityTransaction() {
        return !!this.getMoveCallTransaction(`${config.farmPackageId}::farm::stake`);
    }

    private isUnstakeLiquidityTransaction() {
        return !!this.getMoveCallTransaction(`${config.farmPackageId}::farm::unstake`);
    }

    private decodeAddLiquidity(): DecodeResult {
        const objectId = this.helperLiquidityDex.getInputParam(0).value as string;
        const tokenXType = this.helperLiquidityDex.typeArg(0);
        const tokenYType = this.helperLiquidityDex.typeArg(1);
        const amountX = this.helperLiquidityDex.decodeInputU64String(4);
        const amountY = this.helperLiquidityDex.decodeInputU64String(3);
        const minAddAmountX = this.helperLiquidityDex.decodeInputU64String(6);
        const minAddAmountY = this.helperLiquidityDex.decodeInputU64String(5);
        const coinX = this.helperLiquidityDex.getInputParam(2).value as string;
        const coinY = this.helperLiquidityDex.getInputParam(1).value as string;

        return {
            txType: TransactionType.Other,
            type: TransactionSubType.AddLiquidity,
            intentionData: {
                objectId,
                tokenXType,
                tokenYType,
                amountX,
                amountY,
                minAddAmountX,
                minAddAmountY,
                coinX,
                coinY,
            },
        };
    }

    private decodeAddLiquiditySingleSided(): DecodeResult {
        const objectId = this.helperLiquidityDex.getInputParam(0).value as string;
        const tokenXType = this.helperLiquidityDex.typeArg(0);
        const tokenYType = this.helperLiquidityDex.typeArg(1);
        const inputCoinType = this.helperSwapDex.moveCall.target === `${config.packageId}::spot_dex::${config.functions.swapX}` ? tokenXType : tokenYType;
        const inputCoinAmount = this.helperSwapDex.decodeInputU64String(2);
        const inputCoin = this.helperSwapDex.getInputParam(1).value as string;

        return {
            txType: TransactionType.Other,
            type: TransactionSubType.AddLiquidity,
            intentionData: {
                objectId,
                tokenXType,
                tokenYType,
                inputCoinType,
                inputCoinAmount,
                inputCoin
            },
        };
    }

    private decodeRemoveLiquidity(): DecodeResult {
        const objectId = this.helperDex.getInputParam(0).value as string;
        const tokenXType = this.helperDex.typeArg(0);
        const tokenYType = this.helperDex.typeArg(1);
        const amount = this.helperDex.decodeInputU64String(2);
        const kriyaLpToken = this.helperDex.getInputParam(1).value as string;

        return {
            txType: TransactionType.Other,
            type: TransactionSubType.RemoveLiquidity,
            intentionData: {
                objectId,
                tokenXType,
                tokenYType,
                amount,
                kriyaLpToken
            },
        };
    }

    private decodeClaimRewards(): DecodeResult {
        const objectId = this.helperFarm.getInputParam(1).value as string;
        const positionObjectId = this.helperFarm.getInputParam(2).value as string;
        const tokenXType = this.helperFarm.typeArg(0);
        const tokenYType = this.helperFarm.typeArg(1);

        return {
            txType: TransactionType.Other,
            type: TransactionSubType.ClaimRewards,
            intentionData: {
                objectId,
                tokenXType,
                tokenYType,
                positionObjectId
            },
        };
    }

    private decodeStakeLiquidity(): DecodeResult {
        const objectId = this.helperFarm.getInputParam(1).value as string;
        const tokenXType = this.helperFarm.typeArg(0);
        const tokenYType = this.helperFarm.typeArg(1);
        const lpObject = this.helperFarm.getInputParam(2).value as string;
        const lockTime = this.helperFarm.decodeInputU64String(3);

        return {
            txType: TransactionType.Other,
            type: TransactionSubType.StakeLiquidity,
            intentionData: {
                lpObject,
                lockTime,
                objectId,
                tokenXType,
                tokenYType
            },
        };
    }

    private decodeUnstakeLiquidity(): DecodeResult {
        const objectId = this.helperFarm.getInputParam(1).value as string;
        const positionObjectId = this.helperFarm.getInputParam(2).value as string;
        const tokenXType = this.helperFarm.typeArg(0);
        const tokenYType = this.helperFarm.typeArg(1);

        return {
            txType: TransactionType.Other,
            type: TransactionSubType.UnstakeLiquidity,
            intentionData: {
                objectId,
                tokenXType,
                tokenYType,
                positionObjectId
            },
        };
    }

    private get transactions() {
        return this.txb.blockData.transactions;
    }

    private getMoveCallTransaction(target: string) {
        return this.transactions.find((trans) => trans.kind === 'MoveCall' && trans.target === target);
    }

    private get helperDex() {
        const moveCall = this.transactions.find(
            (trans) => trans.kind === 'MoveCall' && trans.target.startsWith(config.packageId),
        ) as MoveCallTransaction;
        return new MoveCallHelper(moveCall, this.txb);
    }

    private get helperLiquidityDex() {
        const moveCall = this.transactions.find(
            (trans) => trans.kind === 'MoveCall' && trans.target === `${config.packageId}::spot_dex::add_liquidity`,
        ) as MoveCallTransaction;
        return new MoveCallHelper(moveCall, this.txb);
    }

    private get helperSwapDex() {
        const moveCall = this.transactions.find(
            (trans) => trans.kind === 'MoveCall' &&
                ((trans.target === `${config.packageId}::spot_dex::${config.functions.swapX}`) || (trans.target === `${config.packageId}::spot_dex::${config.functions.swapY}`)),
        ) as MoveCallTransaction;
        return new MoveCallHelper(moveCall, this.txb);
    }

    private get helperFarm() {
        const moveCall = this.transactions.find(
            (trans) => trans.kind === 'MoveCall' && trans.target.startsWith(config.farmPackageId),
        ) as MoveCallTransaction;
        return new MoveCallHelper(moveCall, this.txb);
    }
}



export class MoveCallHelper {
    constructor(
        public readonly moveCall: MoveCallTransaction,
        public readonly txb: TransactionBlock,
    ) { }

    decodeSharedObjectId(argIndex: number) {
        const input = this.getInputParam(argIndex);
        return MoveCallHelper.getSharedObjectId(input);
    }

    decodeOwnedObjectId(argIndex: number) {
        const input = this.getInputParam(argIndex);
        return MoveCallHelper.getOwnedObjectId(input);
    }

    decodeInputU64(argIndex: number) {
        const strVal = this.decodePureArg<string>(argIndex, 'u64');
        return Number(strVal);
    }

    decodeInputU64String(argIndex: number) {
        const strVal = this.decodePureArg<string>(argIndex, 'u64');
        return strVal;
    }

    decodeInputU8(argIndex: number) {
        const strVal = this.decodePureArg<string>(argIndex, 'u8');
        return Number(strVal);
    }

    decodeInputAddress(argIndex: number) {
        const input = this.decodePureArg<string>(argIndex, 'address');
        return normalizeSuiAddress(input);
    }

    decodeInputString(argIndex: number) {
        return this.decodePureArg<string>(argIndex, 'string');
    }

    decodeInputBool(argIndex: number) {
        return this.decodePureArg<boolean>(argIndex, 'bool');
    }

    decodePureArg<T>(argIndex: number, bcsType: string) {
        const input = this.getInputParam(argIndex);
        return MoveCallHelper.getPureInputValue<T>(input, bcsType);
    }

    getInputParam(argIndex: number) {
        const arg = this.moveCall.arguments[argIndex];
        if (arg.kind !== 'Input') {
            throw new Error('not input type');
        }
        return this.txb.blockData.inputs[arg.index];
    }

    static getPureInputValue<T>(input: TransactionBlockInput, bcsType: string) {
        if (input.type !== 'pure') {
            throw new Error('not pure argument');
        }
        if (typeof input.value === 'object' && 'Pure' in input.value) {
            const bcsNums = input.value.Pure;
            return bcs.de(bcsType, new Uint8Array(bcsNums)) as T;
        }
        return input.value as T;
    }

    static getOwnedObjectId(input: TransactionBlockInput) {
        if (input.type !== 'object') {
            throw new Error(`not object argument: ${JSON.stringify(input)}`);
        }
        if (typeof input.value === 'object') {
            if (!('Object' in input.value) || !('ImmOrOwned' in input.value.Object)) {
                throw new Error('not ImmOrOwned');
            }
            return normalizeSuiAddress(input.value.Object.ImmOrOwned.objectId as string);
        }
        return normalizeSuiAddress(input.value as string);
    }

    static getSharedObjectId(input: TransactionBlockInput) {
        if (input.type !== 'object') {
            throw new Error(`not object argument: ${JSON.stringify(input)}`);
        }
        if (typeof input.value !== 'object') {
            return normalizeSuiAddress(input.value as string);
        }
        if (!('Object' in input.value) || !('Shared' in input.value.Object)) {
            throw new Error('not Shared');
        }
        return normalizeSuiAddress(input.value.Object.Shared.objectId as string);
    }

    static getPureInput<T>(input: TransactionBlockInput, bcsType: string) {
        if (input.type !== 'pure') {
            throw new Error('not pure argument');
        }
        if (typeof input.value !== 'object') {
            return input.value as T;
        }
        if (!('Pure' in input.value)) {
            throw new Error('Pure not in value');
        }
        const bcsVal = input.value.Pure;
        return bcs.de(bcsType, new Uint8Array(bcsVal)) as T;
    }

    typeArg(index: number) {
        return normalizeStructTag(this.moveCall.typeArguments[index]);
    }

    txArg(index: number) {
        return this.moveCall.arguments[index];
    }
}