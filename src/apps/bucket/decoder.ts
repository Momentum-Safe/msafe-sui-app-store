import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';

import { TransactionSubType } from './types';
import { SBUCK_FOUNTAIN_PACKAGE_ID } from 'bucket-protocol-sdk';
import { BucketIntentionData } from './helper';
import { PsmIntentionData } from './api/psm';
import { bcs } from "@mysten/sui/bcs";
import { BorrowIntentionData, RepayIntentionData, CloseIntentionData, WithdrawIntentionData } from './api/lending';
import { SBUCKClaimIntentionData, SBUCKDepositIntentionData, SBUCKUnstakeIntentionData } from './api/sbuck';
import { LockClaimIntentionData } from './api/lock';

type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: BucketIntentionData;
};

export class Decoder {
  constructor(public readonly transaction: Transaction) { }

  decode() {
    // this.commands.map((command) => {
    //   if (command.$kind === 'MoveCall') {
    //     console.log(command);
    //   }
    // });

    // Check sBUCK commands
    if (this.isSBUCKDepositTransaction()) {
      return this.decodeSBUCKDeposit();
    } else if (this.isSBUCKUnstakeTransaction()) {
      return this.decodeSBUCKUnstake();
    } else if (this.isSBUCKClaimTransaction()) {
      return this.decodeSBUCKClaim();
    }

    // Check lock commands
    if (this.isLockedClaimTransaction()) {
      return this.decodeLockedClaim();
    }

    // Check borrow commands
    if (this.isBorrowTransaction()) {
      return this.decodeBorrow();
    }
    else if (this.isRepayTransaction()) {
      return this.decodeRepay();
    }
    // else if (this.isWithdrawTransaction()) {
    //   return this.decodeWithdraw();
    // }
    // else if (this.isCloseTransaction()) {
    //   return this.decodeClose();
    // }

    // Check PSM commands
    if (this.isPsmInTransaction()) {
      return this.decodePsmIn();
    }
    else if (this.isPsmOutTransaction()) {
      return this.decodePsmOut();
    }

    throw new Error(`Unknown transaction type`);
  }

  private get commands() {
    return this.transaction
      .getData()
      .commands;
  }

  private get inputs() {
    return this.transaction
      .getData()
      .inputs;
  }

  private getMoveCallCommand(fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall' && command.MoveCall.function === fn);
  }

  private getMoveCallModuleCommand(module: string, fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall'
      && command.MoveCall.module === module
      && command.MoveCall.function === fn);
  }

  private getMoveCallPackageModuleCommand(package_: string, module: string, fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall'
      && command.MoveCall.package === package_
      && command.MoveCall.module === module
      && command.MoveCall.function === fn);
  }

  private getMoveCallModuleCommands(module: string, fn: string) {
    return this.commands.filter((command) => command.$kind === 'MoveCall'
      && command.MoveCall.module === module
      && command.MoveCall.function === fn);
  }

  private getSplitCoinsCommands() {
    return this.commands.filter((command) => command.$kind === 'SplitCoins');
  }

  private getTransferCommands() {
    return this.commands.filter((command) => command.$kind === 'TransferObjects');
  }

  private isPsmInTransaction() {
    return !!this.getMoveCallCommand('charge_reservoir');
  }
  private isPsmOutTransaction() {
    return !!this.getMoveCallCommand('discharge_reservoir');
  }
  private isBorrowTransaction() {
    return !!this.getMoveCallCommand('high_top_up')
      || !!this.getMoveCallCommand('high_borrow')
      || !!this.getMoveCallCommand('high_borrow_with_strap');
  }
  private isRepayTransaction() {
    return !!this.getMoveCallCommand('fully_repay')
      || !!this.getMoveCallCommand('fully_repay_with_strap')
      || !!this.getMoveCallCommand('repay_and_withdraw')
      || !!this.getMoveCallCommand('repay_and_withdraw_with_strap');
  }
  private isSBUCKDepositTransaction() {
    return !!this.getMoveCallModuleCommand('buck', 'buck_to_sbuck');
  }
  private isSBUCKStakeTransaction() {
    return !!this.getMoveCallPackageModuleCommand(SBUCK_FOUNTAIN_PACKAGE_ID, 'fountain_core', 'stake');
  }
  private isSBUCKUnstakeTransaction() {
    return !!this.getMoveCallPackageModuleCommand(SBUCK_FOUNTAIN_PACKAGE_ID, 'fountain_core', 'force_unstake');
  }
  private isSBUCKClaimTransaction() {
    return !!this.getMoveCallPackageModuleCommand(SBUCK_FOUNTAIN_PACKAGE_ID, 'fountain_core', 'claim');
  }

  private isLockedClaimTransaction() {
    return !!this.getMoveCallModuleCommand('proof_rule', 'claim')
      || !!this.getMoveCallModuleCommand('lst_proof_rule', 'claim');
  }

  private decodePsmIn(): DecodeResult {
    let amount = "0";
    const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins.amounts[0];
    if (inputCoinObject.$kind == "Input") {
      amount = this.getPureInputU64(inputCoinObject.Input);
    }

    const psmCommand = this.getMoveCallCommand('charge_reservoir').MoveCall;
    const coinType = psmCommand.typeArguments[0];
    console.log('Decoder.decodePsmIn', coinType, amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.PsmIn,
      intentionData: {
        coinType,
        amount,
      } as PsmIntentionData,
    };
  }

  private decodePsmOut(): DecodeResult {
    let amount = "0";
    const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins.amounts[0];
    if (inputCoinObject.$kind == "Input") {
      amount = this.getPureInputU64(inputCoinObject.Input);
    }

    const psmCommand = this.getMoveCallCommand('discharge_reservoir').MoveCall;
    const coinType = psmCommand.typeArguments[0];
    console.log('Decoder.decodePsmOut', coinType, amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.PsmOut,
      intentionData: {
        coinType,
        amount,
      } as PsmIntentionData,
    };
  }

  private decodeBorrow(): DecodeResult {
    let collateralType = "";
    let borrowAmount = "0";
    let insertionPlace = "";
    let strapId = "";

    if (!!this.getMoveCallCommand('high_top_up')) {
      const topupCommand = this.getMoveCallCommand('high_top_up').MoveCall;
      collateralType = topupCommand.typeArguments[0];
      const strapArgument = topupCommand.arguments[2];
    }
    else if (!!this.getMoveCallCommand('high_borrow')) {
      const borrowCommand = this.getMoveCallCommand('high_borrow').MoveCall;
      collateralType = borrowCommand.typeArguments[0];
      const buckAmount = borrowCommand.arguments[4];
      if (buckAmount.$kind == "Input") {
        borrowAmount = this.getPureInputU64(buckAmount.Input);
      }
    }
    else if (!!this.getMoveCallCommand('high_borrow_with_strap')) {
      const borrowCommand = this.getMoveCallCommand('high_borrow_with_strap').MoveCall;
      collateralType = borrowCommand.typeArguments[0];
    }

    let collateralAmount = "0";
    const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins.amounts[0];
    if (inputCoinObject.$kind == "Input") {
      collateralAmount = this.getPureInputU64(inputCoinObject.Input);
    }

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.Borrow,
      intentionData: {
        collateralType,
        collateralAmount,
        borrowAmount,
        insertionPlace,
        strapId,
      } as BorrowIntentionData,
    };
  }

  private decodeRepay(): DecodeResult {
    let collateralType = "";
    let repayAmount = "0";
    let withdrawAmount = "0";
    let isSurplus = false;
    let insertionPlace = "";
    let strapId = "";

    if (!!this.getMoveCallCommand('fully_repay')) {
      const repayCommand = this.getMoveCallCommand('fully_repay').MoveCall;
      collateralType = repayCommand.typeArguments[0];
    }
    else if (!!this.getMoveCallCommand('fully_repay_with_strap')) {
      const repayCommand = this.getMoveCallCommand('fully_repay_with_strap').MoveCall;
      collateralType = repayCommand.typeArguments[0];
      const strapInput = repayCommand.arguments[1];
      const buckInput = repayCommand.arguments[2];
      if (buckInput.$kind == "Input") {
        console.log(this.getPureInputU64(buckInput.Input));
      }
    }
    else if (!!this.getMoveCallCommand('repay_and_withdraw')) {
      const repayCommand = this.getMoveCallCommand('repay_and_withdraw').MoveCall;
      collateralType = repayCommand.typeArguments[0];
      const buckAmount = repayCommand.arguments[4];
      if (buckAmount.$kind == "Input") {
        console.log(this.getPureInputU64(buckAmount.Input));
      }
    }
    else if (!!this.getMoveCallCommand('repay_and_withdraw_with_strap')) {
      const repayCommand = this.getMoveCallCommand('repay_and_withdraw_with_strap').MoveCall;
      collateralType = repayCommand.typeArguments[0];
      const buckAmount = repayCommand.arguments[4];
      if (buckAmount.$kind == "Input") {
        console.log(this.getPureInputU64(buckAmount.Input));
      }
    }

    let collateralAmount = "0";
    const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins.amounts[0];
    if (inputCoinObject.$kind == "Input") {
      collateralAmount = this.getPureInputU64(inputCoinObject.Input);
    }

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.Repay,
      intentionData: {
        collateralType,
        repayAmount,
        withdrawAmount,
        isSurplus,
        insertionPlace,
        strapId,
      } as RepayIntentionData,
    };
  }

  private decodeSBUCKDeposit(): DecodeResult {
    let coinType = "";
    let amount = "0";

    const balanceObject = this.getMoveCallCommand("into_balance");
    coinType = balanceObject.MoveCall.typeArguments[0];

    const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins;
    const inputAmount = inputCoinObject.amounts[0];
    if (inputAmount.$kind == "Input") {
      amount = this.getPureInputU64(inputAmount.Input);
    }

    console.log('Decoder.decodeSBUCKDeposit', coinType, amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SBUCKDeposit,
      intentionData: {
        coinType,
        amount,
      } as SBUCKDepositIntentionData,
    };
  }

  private decodeSBUCKUnstake(): DecodeResult {
    let isStaked = false;
    let toBuck = false;
    let stakeProofs: string[] = [];
    let amount = "0";

    const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins;
    const inputAmount = inputCoinObject.amounts[0];
    if (inputAmount.$kind == "Input") {
      amount = this.getPureInputU64(inputAmount.Input);
    }

    const intentionData = {
      stakeProofs,
      amount,
      isStaked,
      toBuck,
    } as SBUCKUnstakeIntentionData;
    console.log('Decoder.decodeSBUCKUnstake', intentionData);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SBUCKUnstake,
      intentionData,
    };
  }

  private decodeSBUCKClaim(): DecodeResult {
    let stakeProofs: string[] = [];

    const commands = this.getMoveCallModuleCommands("fountain_core", "claim");
    for (const command of commands) {
      const proofObj = command.MoveCall.arguments[2];
      console.log(proofObj);
    }

    console.log('Decoder.decodeSBUCKClaim', stakeProofs);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SBUCKClaim,
      intentionData: {
        stakeProofs,
      } as SBUCKClaimIntentionData,
    };
  }

  private decodeLockedClaim(): DecodeResult {
    let coinType = "";
    let lockedCount = 0;

    const sbuckClaimCommands = this.getMoveCallModuleCommands("proof_rule", "claim");
    for (const command of sbuckClaimCommands) {
      coinType = command.MoveCall.typeArguments[0];
      lockedCount++;
    }

    const lstClaimCommands = this.getMoveCallModuleCommands("lst_proof_rule", "claim");
    for (const command of lstClaimCommands) {
      coinType = command.MoveCall.typeArguments[0];
      lockedCount++;
    }

    console.log('Decoder.decodeLockedClaim', coinType, lockedCount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.LockClaim,
      intentionData: {
        coinType,
        lockedCount,
      } as LockClaimIntentionData,
    };
  }

  // Helpers
  private getCoinInput(idx: number) {
    const input = this.inputs[idx];
    if (input.$kind !== 'Object') {
      throw new Error('not Object argument');
    }
  }

  private getPureInputU64(idx: number) {
    const input = this.inputs[idx];
    if (input.$kind !== 'Pure') {
      throw new Error('not pure argument');
    }

    return bcs.U64.fromBase64(input.Pure.bytes);
  }

}