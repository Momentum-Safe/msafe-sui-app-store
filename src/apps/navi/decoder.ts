import { TransactionType } from '@msafe/sui3-utils';
import { bcs, fromBase64 } from '@mysten/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag, normalizeSuiAddress } from '@mysten/sui/utils';

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

type TxData = ReturnType<Transaction['getData']>;
type TransactionCommand = TxData['commands'][number];
type TransactionInput = TxData['inputs'][number];
type MoveCallCommand = Extract<TransactionCommand, { $kind: 'MoveCall' }>;

function getMoveCallTarget(command: TransactionCommand): string | null {
  if (command.$kind !== 'MoveCall') {
    return null;
  }
  const { package: pkg, module, function: fn } = command.MoveCall;
  return `${pkg}::${module}::${fn}`;
}

export class Decoder {
  constructor(public readonly txb: Transaction) {}

  decode() {
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

  private get commands() {
    return this.txb.getData().commands;
  }

  private getMoveCallCommand(target: string) {
    return this.commands.find((command) => getMoveCallTarget(command) === target);
  }

  private isClaimRewardTransaction() {
    return this.commands.some(
      (command) => command.$kind === 'MoveCall' && command.MoveCall.function.includes('claim_reward'),
    );
  }

  private isEntryBorrowTransaction() {
    return !!this.getMoveCallCommand(`${config.ProtocolPackage}::incentive_v3::entry_borrow_v2`);
  }

  private isEntryBorrowWithFeeTransaction() {
    return !!this.getMoveCallCommand(`${config.ProtocolPackage}::incentive_v3::borrow_v2`);
  }

  private isEntryMultiDepositTransaction() {
    const target = `${config.ProtocolPackage}::incentive_v3::entry_deposit`;
    const depositCommands = this.commands.filter((command) => getMoveCallTarget(command) === target);
    const claimCommand = this.commands.find(
      (command) => command.$kind === 'MoveCall' && command.MoveCall.function.includes('claim_reward'),
    );
    if (claimCommand) {
      return false;
    }
    return depositCommands.length > 1;
  }

  private isEntryClaimAndDepositTransaction() {
    const target = `${config.ProtocolPackage}::incentive_v3::entry_deposit`;
    const depositCommands = this.commands.filter((command) => getMoveCallTarget(command) === target);
    const claimCommand = this.commands.find(
      (command) => command.$kind === 'MoveCall' && command.MoveCall.function.includes('claim_reward'),
    );
    if (claimCommand && depositCommands.length > 0) {
      return true;
    }
    return false;
  }

  private isEntryDepositTransaction() {
    return !!this.getMoveCallCommand(`${config.ProtocolPackage}::incentive_v3::entry_deposit`);
  }

  private isEntryRepayTransaction(): boolean {
    return !!this.getMoveCallCommand(`${config.ProtocolPackage}::incentive_v3::entry_repay`);
  }

  private isEntryWithdrawTransaction(): boolean {
    return !!this.getMoveCallCommand(`${config.ProtocolPackage}::incentive_v3::withdraw_v2`);
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
    this.commands.forEach((command) => {
      if (getMoveCallTarget(command) === target) {
        const helper = new MoveCallHelper(command, this.txb);
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
    const moveCall = this.commands.find(
      (command) => command.$kind === 'MoveCall' && command.MoveCall.package === config.ProtocolPackage,
    );
    if (!moveCall) {
      throw new Error('MoveCall not found');
    }
    return new MoveCallHelper(moveCall, this.txb);
  }
}

export class MoveCallHelper {
  constructor(
    public readonly moveCall: TransactionCommand,
    public readonly txb: Transaction,
  ) {}

  private get moveCallData(): MoveCallCommand['MoveCall'] {
    if (this.moveCall.$kind !== 'MoveCall') {
      throw new Error('not move call command');
    }
    return this.moveCall.MoveCall;
  }

  private get inputs() {
    return this.txb.getData().inputs;
  }

  private getInputIndex(argIndex: number): number {
    const arg = this.moveCallData.arguments[argIndex];
    if (arg.$kind !== 'Input') {
      throw new Error('not input type');
    }
    return arg.Input;
  }

  private getInputParam(argIndex: number): TransactionInput {
    return this.inputs[this.getInputIndex(argIndex)];
  }

  decodeSharedObjectId(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return MoveCallHelper.getSharedObjectId(input);
  }

  decodeOwnedObjectId(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return MoveCallHelper.getOwnedObjectId(input);
  }

  decodeInputU64(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return Number(bcs.u64().parse(Uint8Array.from(fromBase64(input.Pure!.bytes))));
  }

  decodeInputU8(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return Number(bcs.u8().parse(Uint8Array.from(fromBase64(input.Pure!.bytes))));
  }

  decodeInputAddress(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return normalizeSuiAddress(bcs.Address.parse(Uint8Array.from(fromBase64(input.Pure!.bytes))));
  }

  decodeInputString(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return bcs.string().parse(Uint8Array.from(fromBase64(input.Pure!.bytes)));
  }

  decodeInputBool(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return bcs.bool().parse(Uint8Array.from(fromBase64(input.Pure!.bytes)));
  }

  static getOwnedObjectId(input: TransactionInput) {
    const objectId =
      input.Object?.ImmOrOwnedObject?.objectId ?? input.Object?.Receiving?.objectId ?? input.UnresolvedObject?.objectId;
    if (!objectId) {
      throw new Error(`not object argument: ${JSON.stringify(input)}`);
    }
    return normalizeSuiAddress(objectId);
  }

  static getSharedObjectId(input: TransactionInput) {
    const objectId = input.Object?.SharedObject?.objectId ?? input.UnresolvedObject?.objectId;
    if (!objectId) {
      throw new Error(`not shared object argument: ${JSON.stringify(input)}`);
    }
    return normalizeSuiAddress(objectId);
  }

  typeArg(index: number) {
    return normalizeStructTag(this.moveCallData.typeArguments[index]);
  }

  txArg(index: number) {
    return this.moveCallData.arguments[index];
  }
}
