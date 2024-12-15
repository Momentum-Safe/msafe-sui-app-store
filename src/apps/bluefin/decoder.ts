import { asIntN } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { TransactionType } from '@msafe/sui3-utils';
import { fromB64 } from '@mysten/bcs';
import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';

import { DecodeResult, OpenAndAddLiquidityIntentionData, TransactionSubType } from './types';

export class Decoder {
  constructor(public readonly transaction: Transaction) {}

  decode() {
    console.log(JSON.stringify(this.commands));
    console.log(JSON.stringify(this.inputs));

    if (this.isOpenPositionTx()) {
      return this.decodeOpenPositionAndAddLiquidityTx();
    }
    throw new Error(`Unknown transaction type`);
  }

  private decodeOpenPositionAndAddLiquidityTx(): DecodeResult {
    const openPosCommand = this.getMoveCallCommand('open_position');
    const addLiqCommand = this.getMoveCallCommand('provide_liquidity_with_fixed_amount');

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.OpenAndAddLiquidity,
      intentionData: {
        pool: this.getSharedObjectID(this.getInputIndex(openPosCommand, 1)),
        lowerTick: Number(asIntN(BigInt(this.getU32(this.getInputIndex(openPosCommand, 2)))).toString()),
        upperTick: Number(asIntN(BigInt(this.getU32(this.getInputIndex(openPosCommand, 3)))).toString()),
        tokenAmount: this.getU64(this.getInputIndex(addLiqCommand, 6)),
        maxAmountTokenA: this.getU64(this.getInputIndex(addLiqCommand, 7)),
        maxAmountTokenB: this.getU64(this.getInputIndex(addLiqCommand, 8)),
        isTokenAFixed: this.getBoolean(this.getInputIndex(addLiqCommand, 9)),
      } as OpenAndAddLiquidityIntentionData,
    };
  }

  private get commands() {
    return this.transaction.getData().commands;
  }

  private get inputs() {
    return this.transaction.getData().inputs;
  }

  private isOpenPositionTx() {
    return !!this.getMoveCallCommand('open_position');
  }

  private getMoveCallCommand(fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall' && command.MoveCall.function === fn);
  }

  private getSharedObjectID(index: number): string {
    return this.inputs[index].Object.SharedObject.objectId as string;
  }

  private getOwnedObjectID(index: number): string {
    return this.inputs[index].Object.ImmOrOwnedObject.objectId as string;
  }

  private getU32(index: number): string {
    return String(bcs.u32().parse(Uint8Array.from(fromB64(this.inputs[index].Pure.bytes))));
  }

  private getU64(index: number): string {
    return bcs.u64().parse(Uint8Array.from(fromB64(this.inputs[index].Pure.bytes)));
  }

  private getU128(index: number): string {
    return bcs.u128().parse(Uint8Array.from(fromB64(this.inputs[index].Pure.bytes)));
  }

  private getBoolean(index: number): boolean {
    return bcs.bool().parse(Uint8Array.from(fromB64(this.inputs[index].Pure.bytes)));
  }

  private getInputIndex(command: any, index: number): number {
    return command.MoveCall.arguments[index].Input;
  }
}
