import { TransactionType } from '@msafe/sui3-utils';
import { DevInspectResults } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag } from '@mysten/sui/utils';

import {
  ConvertAndDepositIntentionData,
  ConvertIntentionData,
  StakeAndDepositIntentionData,
  StakeIntentionData,
  UnstakeIntentionData,
} from '@/apps/springSui/types/intention';

import { DecodeResult, TransactionSubType } from './types/helper';

export class Decoder {
  constructor(
    public readonly transaction: Transaction,
    public readonly simResult: DevInspectResults,
  ) {}

  decode() {
    if (this.isStakeTransaction()) {
      return this.decodeStake();
    }
    if (this.isStakeAndDepositTransaction()) {
      return this.decodeStakeAndDeposit();
    }
    if (this.isConvertTransaction()) {
      return this.decodeConvert();
    }
    if (this.isConvertAndDepositTransaction()) {
      return this.decodeConvertAndDeposit();
    }
    if (this.isUnstakeTransaction()) {
      return this.decodeUnstake();
    }

    throw new Error(`Unknown transaction type`);
  }

  private get commands() {
    return this.transaction.getData().commands;
  }

  private getMoveCallCommand(fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall' && command.MoveCall.function === fn);
  }

  private hasSuilendDepositTransactionMoveCallCommands() {
    return (
      !!this.getMoveCallCommand('deposit_liquidity_and_mint_ctokens') &&
      !!this.getMoveCallCommand('deposit_ctokens_into_obligation')
    );
  }

  private hasMintMoveCallCommands() {
    return !!this.getMoveCallCommand('mint');
  }

  private hasRedeemMoveCallCommands() {
    return !!this.getMoveCallCommand('redeem');
  }

  // is*
  private isStakeTransaction() {
    return (
      this.hasMintMoveCallCommands() &&
      !this.hasRedeemMoveCallCommands() &&
      !this.hasSuilendDepositTransactionMoveCallCommands()
    );
  }

  private isStakeAndDepositTransaction() {
    return (
      this.hasMintMoveCallCommands() &&
      !this.hasRedeemMoveCallCommands() &&
      this.hasSuilendDepositTransactionMoveCallCommands()
    );
  }

  private isConvertTransaction() {
    return (
      this.hasMintMoveCallCommands() &&
      this.hasRedeemMoveCallCommands() &&
      !this.hasSuilendDepositTransactionMoveCallCommands()
    );
  }

  private isConvertAndDepositTransaction() {
    return (
      this.hasMintMoveCallCommands() &&
      this.hasRedeemMoveCallCommands() &&
      this.hasSuilendDepositTransactionMoveCallCommands()
    );
  }

  private isUnstakeTransaction() {
    return (
      !this.hasMintMoveCallCommands() &&
      this.hasRedeemMoveCallCommands() &&
      !this.hasSuilendDepositTransactionMoveCallCommands()
    );
  }

  // decode*
  private decodeStake(): DecodeResult {
    const events = {
      MintEvent: this.simResult.events.find((event) => event.type.includes('liquid_staking::MintEvent')),
    };

    const outCoinType = normalizeStructTag((events.MintEvent.parsedJson as any).event.typename.name as string);
    const amount = (events.MintEvent.parsedJson as any).event.sui_amount_in as string;
    console.log('Decoder.decodeStake', amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.STAKE,
      intentionData: {
        amount,
        outCoinType,
      } as StakeIntentionData,
    };
  }

  private decodeStakeAndDeposit(): DecodeResult {
    const events = {
      MintEvent: this.simResult.events.find((event) => event.type.includes('liquid_staking::MintEvent')),
    };

    const outCoinType = normalizeStructTag((events.MintEvent.parsedJson as any).event.typename.name as string);
    const amount = (events.MintEvent.parsedJson as any).event.sui_amount_in as string;
    console.log('Decoder.decodeStakeAndDeposit', amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.STAKE_AND_DEPOSIT,
      intentionData: {
        amount,
        outCoinType,
      } as StakeAndDepositIntentionData,
    };
  }

  private decodeConvert(): DecodeResult {
    const events = {
      RedeemEvent: this.simResult.events.find((event) => event.type.includes('liquid_staking::RedeemEvent')),
      MintEvent: this.simResult.events.find((event) => event.type.includes('liquid_staking::MintEvent')),
    };

    const inCoinType = normalizeStructTag((events.RedeemEvent.parsedJson as any).event.typename.name as string);
    const outCoinType = normalizeStructTag((events.MintEvent.parsedJson as any).event.typename.name as string);
    const amount = (events.RedeemEvent.parsedJson as any).event.lst_amount_in as string;
    console.log('Decoder.decodeConvert', amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CONVERT,
      intentionData: {
        amount,
        inCoinType,
        outCoinType,
      } as ConvertIntentionData,
    };
  }

  private decodeConvertAndDeposit(): DecodeResult {
    const events = {
      RedeemEvent: this.simResult.events.find((event) => event.type.includes('liquid_staking::RedeemEvent')),
      MintEvent: this.simResult.events.find((event) => event.type.includes('liquid_staking::MintEvent')),
    };

    const inCoinType = normalizeStructTag((events.RedeemEvent.parsedJson as any).event.typename.name as string);
    const outCoinType = normalizeStructTag((events.MintEvent.parsedJson as any).event.typename.name as string);
    const amount = (events.RedeemEvent.parsedJson as any).event.lst_amount_in as string;
    console.log('Decoder.decodeConvertAndDeposit', amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CONVERT_AND_DEPOSIT,
      intentionData: {
        amount,
        inCoinType,
        outCoinType,
      } as ConvertAndDepositIntentionData,
    };
  }

  private decodeUnstake(): DecodeResult {
    const events = {
      RedeemEvent: this.simResult.events.find((event) => event.type.includes('liquid_staking::RedeemEvent')),
    };

    const inCoinType = normalizeStructTag((events.RedeemEvent.parsedJson as any).event.typename.name as string);
    const amount = (events.RedeemEvent.parsedJson as any).event.lst_amount_in as string;
    console.log('Decoder.decodeUnstake', amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.UNSTAKE,
      intentionData: {
        amount,
        inCoinType,
      } as UnstakeIntentionData,
    };
  }
}
