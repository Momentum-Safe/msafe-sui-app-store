import { TransactionType } from '@msafe/sui3-utils';
import { DevInspectResults } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

import { SuilendIntentionData } from './helper';
import { BorrowIntentionData } from './intentions/borrow';
import { ClaimRewardsIntentionData } from './intentions/claimRewards';
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
    if (this.isClaimRewardsTransaction()) {
      return this.decodeClaimRewards();
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
      !!this.getMoveCallCommand('redeem_ctokens_and_withdraw_liquidity')
    );
  }

  private isBorrowTransaction() {
    return !!this.getMoveCallCommand('borrow');
  }

  private isRepayTransaction() {
    return !!this.getMoveCallCommand('repay');
  }

  private isClaimRewardsTransaction() {
    return !!this.getMoveCallCommand('claim_rewards');
  }

  // decode*
  private decodeDeposit(): DecodeResult {
    const events = {
      MintEvent: this.simResult.events.find((event) => event.type.endsWith('lending_market::MintEvent')),
    };

    const coinType = (events.MintEvent.parsedJson as any).coin_type.name as string;
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
    const events = {
      RedeemEvent: this.simResult.events.find((event) => event.type.endsWith('lending_market::RedeemEvent')),
    };

    const coinType = (events.RedeemEvent.parsedJson as any).coin_type.name as string;
    const value = (events.RedeemEvent.parsedJson as any).liquidity_amount as string;
    console.log('Decoder.decodeWithdraw', coinType, value);

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
    const events = {
      BorrowEvent: this.simResult.events.find((event) => event.type.endsWith('lending_market::BorrowEvent')),
    };

    const coinType = (events.BorrowEvent.parsedJson as any).coin_type.name as string;
    const value = `${+(events.BorrowEvent.parsedJson as any).liquidity_amount - +(events.BorrowEvent.parsedJson as any).origination_fee_amount}`;
    console.log('Decoder.decodeBorrow', coinType, value);

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
      RepayEvent: this.simResult.events.find((event) => event.type.endsWith('lending_market::RepayEvent')),
    };

    const coinType = (events.RepayEvent.parsedJson as any).coin_type.name as string;
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

  private decodeClaimRewards(): DecodeResult {
    const events = {
      ClaimReward: this.simResult.events.filter((event) => event.type.endsWith('lending_market::ClaimReward')),
    };

    const result: Record<string, string> = {};
    for (let i = 0; i < events.ClaimReward.length; i++) {
      const claimRewardEvent = events.ClaimReward[i];

      const coinType = (claimRewardEvent.parsedJson as any).coin_type.name as string;
      const value = (claimRewardEvent.parsedJson as any).liquidity_amount as string;

      result[coinType] = `${+(result[coinType] ?? '0') + +value}`;
    }
    console.log('Decoder.decodeClaimRewards', result);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CLAIM_REWARDS,
      intentionData: {
        value: result,
      } as ClaimRewardsIntentionData,
    };
  }
}
