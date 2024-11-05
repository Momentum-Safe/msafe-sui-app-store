import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { SuiEvent } from '@mysten/sui.js/client';

import { SuilendIntentionData } from './helper';
import { BorrowIntentionData } from './intentions/borrow';
import { DepositIntentionData } from './intentions/deposit';
import { RepayIntentionData } from './intentions/repay';
import { WithdrawIntentionData } from './intentions/withdraw';
import { TransactionSubType } from './types';

const PACKAGE_ID = '0x93b70b8e21d77f695507558839715d900d05e0ee54acf25d176a179112001d7a';
const MODULE = 'lending_market';

type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: SuilendIntentionData;
};

export class Decoder {
  constructor(
    public readonly transaction: Transaction,
    public readonly transactionEvents: SuiEvent[],
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

    throw new Error(`Unknown transaction type`);
  }

  private get commands() {
    return this.transaction
      .getData()
      .commands.filter((command) => command.MoveCall.package === PACKAGE_ID && command.MoveCall.module === MODULE);
  }

  private getMoveCallCommand(fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall' && command.MoveCall.function === fn);
  }

  private getSplitCoinsCommands(indexFilter: (index: number) => boolean = () => true) {
    return this.commands.filter((command, index) => command.$kind === 'SplitCoins' && indexFilter(index));
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

  // decode*
  private decodeDeposit(): DecodeResult {
    const commands = {
      splitCoins: this.getSplitCoinsCommands()[0],
      deposit_liquidity_and_mint_ctokens: this.getMoveCallCommand('deposit_liquidity_and_mint_ctokens'),
    };

    const coinType = commands.deposit_liquidity_and_mint_ctokens.MoveCall.typeArguments[1];
    const value = (commands.splitCoins.SplitCoins.amounts[0] as any).value as string;
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
      redeem: this.transactionEvents.find((event) => event.type.endsWith('lending_market::RedeemEvent')),
    };

    const coinType = commands.withdraw_ctokens.MoveCall.typeArguments[1];
    const value = (events.redeem.parsedJson as any).liquidity_amount as string;
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
    const commands = {
      borrow: this.getMoveCallCommand('borrow'),
    };

    const coinType = commands.borrow.MoveCall.typeArguments[1];
    const value = (commands.borrow.MoveCall.arguments[4] as any).value as string;
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
    const commands = {
      splitCoins: this.getSplitCoinsCommands()[0],
      repay: this.getMoveCallCommand('repay'),
    };

    const coinType = commands.repay.MoveCall.typeArguments[1];
    const value = (commands.splitCoins.SplitCoins.amounts[0] as any).value as string;
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
}
