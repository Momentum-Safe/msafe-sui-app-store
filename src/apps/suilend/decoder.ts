import { TransactionType } from '@msafe/sui3-utils';
import { DevInspectResults } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeStructTag } from '@mysten/sui/utils';
import { maxU64 } from '@suilend/sdk';

import { SuilendIntentionData } from './helper';
import { BorrowIntentionData } from './intentions/borrow';
import { ClaimIntentionData } from './intentions/claim';
import { ClaimAndDepositIntentionData } from './intentions/claimAndDeposit';
import { DepositIntentionData } from './intentions/deposit';
import { RepayIntentionData } from './intentions/repay';
import { WithdrawIntentionData } from './intentions/withdraw';
import { TransactionSubType } from './types';

type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: SuilendIntentionData;
};

export class Decoder {
  constructor(
    public readonly transaction: Transaction,
    public readonly simResult: DevInspectResults,
  ) {}

  decode() {
    if (this.isDepositTransaction()) {
      return this.decodeDeposit();
    }
    if (this.isWithdrawTransaction()) {
      return this.decodeWithdraw();
    }
    if (this.isBorrowTransaction()) {
      return this.decodeBorrow();
    }
    if (this.isRepayTransaction()) {
      return this.decodeRepay();
    }
    if (this.isClaimTransaction()) {
      return this.decodeClaim();
    }
    if (this.isClaimAndDepositTransaction()) {
      return this.decodeClaimAndDeposit();
    }

    throw new Error(`Unknown transaction type`);
  }

  private get commands() {
    return this.transaction.getData().commands;
  }

  private getMoveCallCommand(fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall' && command.MoveCall.function === fn);
  }

  // is*
  private isDepositTransaction() {
    return (
      !!this.getMoveCallCommand('deposit_liquidity_and_mint_ctokens') &&
      !!this.getMoveCallCommand('deposit_ctokens_into_obligation')
    );
  }

  private isWithdrawTransaction() {
    return (
      !!this.getMoveCallCommand('withdraw_ctokens') &&
      !!this.getMoveCallCommand('redeem_ctokens_and_withdraw_liquidity_request')
    );
  }

  private isBorrowTransaction() {
    return !!this.getMoveCallCommand('borrow_request');
  }

  private isRepayTransaction() {
    return !!this.getMoveCallCommand('repay');
  }

  private isClaimTransaction() {
    return !!this.getMoveCallCommand('claim_rewards') && !this.isDepositTransaction();
  }

  private isClaimAndDepositTransaction() {
    return !!this.getMoveCallCommand('claim_rewards') && this.isDepositTransaction();
  }

  // decode*
  private decodeDeposit(): DecodeResult {
    const events = {
      MintEvent: this.simResult.events.find((event) => event.type.includes('lending_market::MintEvent')),
    };

    const coinType = normalizeStructTag((events.MintEvent.parsedJson as any).coin_type.name as string);
    const value = (events.MintEvent.parsedJson as any).liquidity_amount as string;
    console.log('Decoder.decodeDeposit', coinType, value);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.DEPOSIT,
      intentionData: {
        coinType,
        value,
      } as DepositIntentionData,
    };
  }

  private decodeWithdraw(): DecodeResult {
    const commands = {
      withdraw_ctokens: this.getMoveCallCommand('withdraw_ctokens'),
    };
    const events = {
      RedeemEvent: this.simResult.events.find((event) => event.type.includes('lending_market::RedeemEvent')),
    };

    const coinType = normalizeStructTag((events.RedeemEvent.parsedJson as any).coin_type.name as string);
    let value = (events.RedeemEvent.parsedJson as any).liquidity_amount as string;
    console.log('Decoder.decodeWithdraw', coinType, value);

    const isMax = (commands.withdraw_ctokens.MoveCall.arguments[4] as any).value === maxU64.toString();
    console.log('XXX decodeWithdraw - isMax:', isMax, commands.withdraw_ctokens.MoveCall.arguments[4] as any);
    if (isMax) {
      value = maxU64.toString();
    }

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.WITHDRAW,
      intentionData: {
        coinType,
        value,
      } as WithdrawIntentionData,
    };
  }

  private decodeBorrow(): DecodeResult {
    const commands = {
      borrow_request: this.getMoveCallCommand('borrow_request'),
    };
    const events = {
      BorrowEvent: this.simResult.events.find((event) => event.type.includes('lending_market::BorrowEvent')),
    };

    const coinType = normalizeStructTag((events.BorrowEvent.parsedJson as any).coin_type.name as string);
    let value = `${+(events.BorrowEvent.parsedJson as any).liquidity_amount - +(events.BorrowEvent.parsedJson as any).origination_fee_amount}`;
    console.log('Decoder.decodeBorrow', coinType, value);

    const isMax = (commands.borrow_request.MoveCall.arguments[4] as any).value === maxU64.toString();
    console.log('XXX decodeBorrow - isMax:', isMax, commands.borrow_request.MoveCall.arguments[4] as any);
    if (isMax) {
      value = maxU64.toString();
    }

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.BORROW,
      intentionData: {
        coinType,
        value,
      } as BorrowIntentionData,
    };
  }

  private decodeRepay(): DecodeResult {
    const events = {
      RepayEvent: this.simResult.events.find((event) => event.type.includes('lending_market::RepayEvent')),
    };

    const coinType = normalizeStructTag((events.RepayEvent.parsedJson as any).coin_type.name as string);
    const value = (events.RepayEvent.parsedJson as any).liquidity_amount as string;
    console.log('Decoder.decodeRepay', coinType, value);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.REPAY,
      intentionData: {
        coinType,
        value,
      } as RepayIntentionData,
    };
  }

  private decodeClaim(): DecodeResult {
    const events = {
      ClaimReward: this.simResult.events.filter((event) => event.type.includes('lending_market::ClaimReward')),
    };

    const result: Record<string, string> = {};
    for (let i = 0; i < events.ClaimReward.length; i++) {
      const claimRewardEvent = events.ClaimReward[i];

      const coinType = normalizeStructTag((claimRewardEvent.parsedJson as any).coin_type.name as string);
      const value = (claimRewardEvent.parsedJson as any).liquidity_amount as string;

      result[coinType] = `${+(result[coinType] ?? '0') + +value}`;
    }
    console.log('Decoder.decodeClaimRewards', result);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CLAIM,
      intentionData: {
        value: result,
      } as ClaimIntentionData,
    };
  }

  private decodeClaimAndDeposit(): DecodeResult {
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CLAIM_AND_DEPOSIT,
      intentionData: this.decodeClaim().intentionData as ClaimAndDepositIntentionData,
    };
  }
}
