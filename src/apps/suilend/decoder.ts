import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { DepositIntentionData } from './intentions/deposit';
import { SuilendIntentionData, TransactionSubType } from './types';

const PACKAGE_ID = '0x93b70b8e21d77f695507558839715d900d05e0ee54acf25d176a179112001d7a';
const MODULE = 'lending_market';

type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: SuilendIntentionData;
};

export class Decoder {
  constructor(public readonly transaction: Transaction) {}

  decode() {
    if (this.isDepositTransaction()) {
      return this.decodeDeposit();
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

  private getSplitCoinsCommands() {
    return this.commands.filter((command) => command.$kind === 'SplitCoins');
  }

  private isDepositTransaction() {
    return (
      !!this.getMoveCallCommand('deposit_liquidity_and_mint_ctokens') &&
      !!this.getMoveCallCommand('deposit_ctokens_into_obligation')
    );
  }

  private decodeDeposit(): DecodeResult {
    const splitCoinsCommand = this.getSplitCoinsCommands()[0];
    const depositLiquidityAndMintCtokensCommand = this.getMoveCallCommand('deposit_liquidity_and_mint_ctokens');

    const coinType = depositLiquidityAndMintCtokensCommand.MoveCall.typeArguments[1];
    const { value } = splitCoinsCommand.SplitCoins.amounts[0] as any;
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
}
