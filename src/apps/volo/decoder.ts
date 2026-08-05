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
    if (this.isStakeTransaction()) {
      return this.decodeStake();
    }

    if (this.isUnStakeTransaction()) {
      return this.decodeUnStake();
    }

    if (this.isClaimTicketTransaction()) {
      return this.decodeClaimTicket();
    }

    throw new Error(`Unknown transaction type`);
  }

  private get commands() {
    return this.txb.getData().commands;
  }

  private getMoveCallCommand(target: string) {
    return this.commands.find((command) => getMoveCallTarget(command) === target);
  }

  private isStakeTransaction() {
    return !!this.getMoveCallCommand(`${config.packageId}::native_pool::stake`);
  }

  private isUnStakeTransaction() {
    return !!this.getMoveCallCommand(`${config.packageId}::native_pool::unstake`);
  }

  private isClaimTicketTransaction() {
    return !!this.getMoveCallCommand(`${config.packageId}::native_pool::burn_ticket`);
  }

  private decodeSplitAmount(): number {
    const splitCoin = this.commands.find((command) => command.$kind === 'SplitCoins');
    if (!splitCoin || splitCoin.$kind !== 'SplitCoins') {
      throw new Error('SplitCoins command not found');
    }
    const amountArg = splitCoin.SplitCoins.amounts[0];
    if (amountArg.$kind !== 'Input') {
      throw new Error('SplitCoins amount is not an Input');
    }
    const input = this.txb.getData().inputs[amountArg.Input];
    return Number(bcs.u64().parse(Uint8Array.from(fromBase64(input.Pure!.bytes))));
  }

  private decodeStake(): DecodeResult {
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.Stake,
      intentionData: {
        amount: this.decodeSplitAmount(),
      },
    };
  }

  private decodeUnStake(): DecodeResult {
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.UnStake,
      intentionData: {
        amount: this.decodeSplitAmount(),
      },
    };
  }

  private decodeClaimTicket(): DecodeResult {
    const ticketId = this.helper.decodeOwnedObjectId(2);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.ClaimTicket,
      intentionData: {
        ticketId,
      },
    };
  }

  private get helper() {
    const moveCall = this.commands.find(
      (command) => command.$kind === 'MoveCall' && command.MoveCall.package === config.packageId,
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

  decodeOwnedObjectId(argIndex: number) {
    const input = this.getInputParam(argIndex);
    return MoveCallHelper.getOwnedObjectId(input);
  }

  static getOwnedObjectId(input: TransactionInput) {
    const objectId =
      input.Object?.ImmOrOwnedObject?.objectId ?? input.Object?.Receiving?.objectId ?? input.UnresolvedObject?.objectId;
    if (!objectId) {
      throw new Error(`not object argument: ${JSON.stringify(input)}`);
    }
    return normalizeSuiAddress(objectId);
  }
}
