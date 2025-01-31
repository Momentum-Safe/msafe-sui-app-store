import { TransactionType } from '@msafe/sui3-utils';
import { DevInspectResults } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

import { MintIntentionData, RedeemIntentionData, StSuiIntentionData, TransactionSubType } from './types';

type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: StSuiIntentionData;
};

type MintEventType = {
  event: {
    sui_amount_in: string;
  };
};

type RedeemEventType = {
  event: {
    lst_amount_in: string;
  };
};

export class Decoder {
  constructor(
    public readonly transaction: Transaction,
    public readonly simResult: DevInspectResults,
  ) {}

  /**
   * Entry point for decoding the transaction. Determines the type of transaction
   * and calls the appropriate decode method.
   */
  decode(): DecodeResult {
    if (this.isMintTransaction()) {
      const liquidityChangeEvent = this.getLiquidityChangeEvent('MintEvent');
      if (!liquidityChangeEvent) {
        throw new Error('No liquidity change event found. Unable to decode transaction.');
      }

      const eventData = liquidityChangeEvent.parsedJson as MintEventType;
      console.log('Decoder event data - ', eventData);

      return this.decodeMint(eventData);
    }

    if (this.isRedeemTransaction()) {
      const liquidityChangeEvent = this.getLiquidityChangeEvent('RedeemEvent');
      if (!liquidityChangeEvent) {
        throw new Error('No liquidity change event found. Unable to decode transaction.');
      }

      const eventData = liquidityChangeEvent.parsedJson as RedeemEventType;
      console.log('Decoder event data - ', eventData);

      return this.decodeRedeem(eventData);
    }

    throw new Error(`Unknown transaction type`);
  }

  // ---- Private Helpers ----

  private get commands() {
    return this.transaction.getData().commands;
  }

  private getMoveCallCommand(fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall' && command.MoveCall.function === fn);
  }

  private getLiquidityChangeEvent(arg: string) {
    return this.simResult.events.find((event) => this.isLiquidityChangeEventType(event.type, arg));
  }

  // is*

  private isLiquidityChangeEventType(eventType: string, arg: string) {
    return eventType.includes(arg);
  }

  private isMintTransaction() {
    return !!this.getMoveCallCommand('mint');
  }

  private isRedeemTransaction() {
    return !!this.getMoveCallCommand('redeem');
  }

  // ---- Decode Methods ----

  private decodeMint(eventData: MintEventType): DecodeResult {
    const {
      event: { sui_amount_in: amount },
    } = eventData;
    console.log('Decoder.decodeMint', amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.MINT,
      intentionData: {
        amount,
      } as MintIntentionData,
    };
  }

  private decodeRedeem(eventData: RedeemEventType): DecodeResult {
    const {
      event: { lst_amount_in: amount },
    } = eventData;
    console.log('Decoder.decodeRedeem', amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.REDEEM,
      intentionData: {
        amount,
      } as RedeemIntentionData,
    };
  }
}
