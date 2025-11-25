import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag, normalizeSuiAddress } from '@mysten/sui/utils';
import { bcs } from '@mysten/sui.js/bcs';
import { MoveCallTransaction } from '@mysten/sui.js/dist/cjs/transactions';
import { TransactionBlockInput } from '@mysten/sui.js/transactions';

import config from './config';
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
  constructor(public readonly txb: Transaction) {}

  decode() {
    console.log('txb', this.txb);
    if (this.isClaimRewardTransaction()) {
      return this.decodeClaimReward();
    }
    if (this.isEntryBorrowTransaction()) {
      return this.decodeEntryBorrow();
    }
    if (this.isEntryBorrowWithFeeTransaction()) {
      return this.decodeEntryBorrow();
    }
    if (this.isEntryMultiDepositTransaction()) {
      return this.decodeEntryMultiDeposit();
    }
    if (this.isEntryDepositTransaction()) {
      return this.decodeEntryDeposit();
    }
    if (this.isEntryRepayTransaction()) {
      return this.decodeEntryRepay();
    }
    if (this.isEntryWithdrawTransaction()) {
      return this.decodeEntryWithdraw();
    }
    if (this.isEntryClaimAndDepositTransaction()) {
      return this.decodeEntryClaimAndDeposit();
    }
    throw new Error(`Unknown transaction type`);
  }

  private get transactions() {
    return this.txb.blockData.transactions;
  }

  private getMoveCallTransaction(target: string) {
    return this.transactions.find((trans) => trans.kind === 'MoveCall' && trans.target === target);
  }

  private isClaimRewardTransaction() {
    const claimTrans = this.transactions.find((trans) => {
      if (trans.kind === 'MoveCall' && trans.target.includes('claim_reward')) {
        return true;
      }
      return false;
    });
    return !!claimTrans;
  }

  private isEntryBorrowTransaction() {
    return !!this.getMoveCallTransaction(`${config.ProtocolPackage}::incentive_v3::entry_borrow_v2`);
  }

  private isEntryBorrowWithFeeTransaction() {
    return !!this.getMoveCallTransaction(`${config.ProtocolPackage}::incentive_v3::borrow_v2`);
  }

  private isEntryMultiDepositTransaction() {
    const target = `${config.ProtocolPackage}::incentive_v3::entry_deposit`;
    const transactions = this.transactions.filter((trans) => trans.kind === 'MoveCall' && trans.target === target);
    const claimTransaction = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target.includes('claim_reward'),
    );
    if (claimTransaction) {
      return false;
    }
    return transactions.length > 1;
  }

  private isEntryClaimAndDepositTransaction() {
    const target = `${config.ProtocolPackage}::incentive_v3::entry_deposit`;
    const transactions = this.transactions.filter((trans) => trans.kind === 'MoveCall' && trans.target === target);
    const claimTransaction = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target.includes('claim_reward'),
    );
    if (claimTransaction && transactions.length > 0) {
      return true;
    }
    return false;
  }

  private isEntryDepositTransaction() {
    return !!this.getMoveCallTransaction(`${config.ProtocolPackage}::incentive_v3::entry_deposit`);
  }

  private isEntryRepayTransaction(): boolean {
    return !!this.getMoveCallTransaction(`${config.ProtocolPackage}::incentive_v3::entry_repay`);
  }

  private isEntryWithdrawTransaction(): boolean {
    return !!this.getMoveCallTransaction(`${config.ProtocolPackage}::incentive_v3::withdraw_v2`);
  }

  private findPoolByAssetId(assetId: number) {
    const findPool = Object.values(config.pool).find((pool) => pool.assetId === assetId);
    if (!findPool) {
      throw new Error('Pool not found');
    }
    return findPool;
  }

  private decodeEntryClaimAndDeposit(): DecodeResult {
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.EntryClaimAndDeposit,
      intentionData: {
        type: 'entry_claim_and_deposit',
      },
    };
  }

  private decodeClaimReward(): DecodeResult {
    console.log('decode claims');
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.ClaimReward,
      intentionData: {
        type: 'claim_reward',
      },
    };
  }

  private decodeEntryBorrow(): DecodeResult {
    const assetId = this.helper.decodeInputU8(4);
    const amount = this.helper.decodeInputU64(5);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.EntryBorrow,
      intentionData: {
        amount,
        assetId,
      },
    };
  }

  private decodeEntryMultiDeposit(): DecodeResult {
    const list = [] as {
      amount: number;
      assetId: number;
    }[];
    const target = `${config.ProtocolPackage}::incentive_v3::entry_deposit`;
    this.transactions.forEach((trans) => {
      if (trans.kind === 'MoveCall' && trans.target === target) {
        const helper = new MoveCallHelper(trans, this.txb);
        const assetId = helper.decodeInputU8(3);
        const amount = helper.decodeInputU64(5);
        list.push({
          assetId,
          amount,
        });
      }
    });
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.EntryMultiDeposit,
      intentionData: {
        list,
      },
    };
  }

  private decodeEntryDeposit(): DecodeResult {
    const assetId = this.helper.decodeInputU8(3);
    const amount = this.helper.decodeInputU64(5);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.EntryDeposit,
      intentionData: {
        amount,
        assetId,
      },
    };
  }

  private decodeEntryRepay(): DecodeResult {
    const assetId = this.helper.decodeInputU8(4);
    const amount = this.helper.decodeInputU64(6);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.EntryRepay,
      intentionData: {
        amount,
        assetId,
      },
    };
  }

  private decodeEntryWithdraw(): DecodeResult {
    const assetId = this.helper.decodeInputU8(4);
    const amount = this.helper.decodeInputU64(5);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.EntryWithdraw,
      intentionData: {
        amount,
        assetId,
      },
    };
  }

  private get helper() {
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target.startsWith(config.ProtocolPackage),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }
}

export class MoveCallHelper {
  constructor(
    public readonly moveCall: MoveCallTransaction,
    public readonly txb: Transaction,
  ) {}

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
