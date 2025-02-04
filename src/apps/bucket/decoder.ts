import { TransactionType } from '@msafe/sui3-utils';
import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';
import { SBUCK_FOUNTAIN_PACKAGE_ID } from 'bucket-protocol-sdk';

import {
  BorrowIntentionData,
  CloseIntentionData,
  LockClaimIntentionData,
  PsmIntentionData,
  RepayIntentionData,
  SBUCKClaimIntentionData,
  SBUCKDepositIntentionData,
  SBUCKUnstakeIntentionData,
  SBUCKWithdrawIntentionData,
  TankClaimIntentionData,
  TankDepositIntentionData,
  TankWithdrawIntentionData,
  WithdrawIntentionData,
} from './api';
import { DecodeResult, TransactionSubType } from './types';

export class Decoder {
  constructor(public readonly transaction: Transaction) {}

  decode() {
    // this.commands.map((command) => {
    //   if (command.$kind === 'MoveCall') {
    //     console.log(command);
    //   }
    // });

    // Check sBUCK commands
    if (this.isSBUCKDepositTransaction()) {
      return this.decodeSBUCKDeposit();
    }
    if (this.isSBUCKUnstakeTransaction()) {
      return this.decodeSBUCKUnstake();
    }
    if (this.isSBUCKWithdrawTransaction()) {
      return this.decodeSBUCKWithdraw();
    }
    if (this.isSBUCKClaimTransaction()) {
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
    if (this.isRepayTransaction()) {
      return this.decodeRepay();
    }
    if (this.isWithdrawTransaction()) {
      return this.decodeWithdraw();
    }
    if (this.isCloseTransaction()) {
      return this.decodeClose();
    }

    // Get tank commands
    if (this.isTankDepositTransaction()) {
      return this.decodeTankDeposit();
    }
    if (this.isTankWithdrawTransaction()) {
      return this.decodeTankWithdraw();
    }
    if (this.isTankClaimTransaction()) {
      return this.decodeTankClaim();
    }

    // Check PSM commands
    if (this.isPsmTransaction()) {
      return this.decodePsm();
    }

    throw new Error(`Unknown transaction type`);
  }

  private get commands() {
    return this.transaction.getData().commands;
  }

  private get inputs() {
    return this.transaction.getData().inputs;
  }

  private getMoveCallCommand(fn: string) {
    return this.commands.find((command) => command.$kind === 'MoveCall' && command.MoveCall.function === fn);
  }

  private getMoveCallModuleCommand(module: string, fn: string) {
    return this.commands.find(
      (command) =>
        command.$kind === 'MoveCall' && command.MoveCall.module === module && command.MoveCall.function === fn,
    );
  }

  private getMoveCallPackageModuleCommand(package_: string, module: string, fn: string) {
    return this.commands.find(
      (command) =>
        command.$kind === 'MoveCall' &&
        command.MoveCall.package === package_ &&
        command.MoveCall.module === module &&
        command.MoveCall.function === fn,
    );
  }

  private getMoveCallModuleCommands(module: string, fn: string) {
    return this.commands.filter(
      (command) =>
        command.$kind === 'MoveCall' && command.MoveCall.module === module && command.MoveCall.function === fn,
    );
  }

  private getSplitCoinsCommands() {
    return this.commands.filter((command) => command.$kind === 'SplitCoins');
  }

  private getTransferCommands() {
    return this.commands.filter((command) => command.$kind === 'TransferObjects');
  }

  private isPsmTransaction() {
    return !!this.getMoveCallCommand('charge_reservoir') || !!this.getMoveCallCommand('discharge_reservoir');
  }

  private isStrapNewTransaction() {
    return !!this.getMoveCallModuleCommand('strap', 'new');
  }

  private isBorrowTransaction() {
    return (
      !!this.getMoveCallModuleCommand('bucket_operations', 'high_top_up') ||
      !!this.getMoveCallModuleCommand('bucket_operations', 'high_borrow') ||
      !!this.getMoveCallModuleCommand('bucket_operations', 'high_borrow_with_strap')
    );
  }

  private isRepayTransaction() {
    return (
      !!this.getMoveCallModuleCommand('bucket_operations', 'fully_repay') ||
      !!this.getMoveCallModuleCommand('bucket_operations', 'fully_repay_with_strap') ||
      !!this.getMoveCallModuleCommand('bucket_operations', 'repay_and_withdraw') ||
      !!this.getMoveCallModuleCommand('bucket_operations', 'repay_and_withdraw_with_strap')
    );
  }

  private isWithdrawTransaction() {
    return (
      !!this.getMoveCallModuleCommand('buck', 'withdraw') ||
      !!this.getMoveCallModuleCommand('buck', 'withdraw_with_strap')
    );
  }

  private isCloseTransaction() {
    return !!this.getMoveCallModuleCommand('bucket_operations', 'destroy_empty_strap');
  }

  private isTankDepositTransaction() {
    return !!this.getMoveCallModuleCommand('tank_operations', 'deposit');
  }

  private isTankWithdrawTransaction() {
    return !!this.getMoveCallModuleCommand('tank_operations', 'withdraw');
  }

  private isTankClaimTransaction() {
    return !!this.getMoveCallModuleCommand('tank_operations', 'claim');
  }

  private isSBUCKDepositTransaction() {
    return !!this.getMoveCallModuleCommand('buck', 'buck_to_sbuck');
  }

  private isSBUCKWithdrawTransaction() {
    return !!this.getMoveCallModuleCommand('buck', 'sbuck_to_buck');
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
    return (
      !!this.getMoveCallModuleCommand('proof_rule', 'claim') ||
      !!this.getMoveCallModuleCommand('lst_proof_rule', 'claim')
    );
  }

  private isLstUnlockTransaction() {
    return !!this.getMoveCallModuleCommand('lst_proof_rule', 'unlock');
  }

  private decodePsm(): DecodeResult {
    let coinType;
    let buckToCoin;

    let amount = '0';
    const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins.amounts[0];
    if (inputCoinObject.$kind === 'Input') {
      amount = this.getPureInputU64(inputCoinObject.Input);
    }

    if (this.getMoveCallCommand('charge_reservoir')) {
      const psmCommand = this.getMoveCallCommand('charge_reservoir').MoveCall;
      [coinType] = psmCommand.typeArguments;
      buckToCoin = false;
    } else {
      const psmCommand = this.getMoveCallCommand('discharge_reservoir').MoveCall;
      [coinType] = psmCommand.typeArguments;
      buckToCoin = true;
    }

    console.log('Decoder.decodePsm', coinType, amount, buckToCoin);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.Psm,
      intentionData: {
        coinType,
        amount,
        buckToCoin,
      } as PsmIntentionData,
    };
  }

  private decodeBorrow(): DecodeResult {
    let collateralType = '';
    let borrowAmount = '0';
    let insertionPlace: string | undefined;
    const strapId: string | undefined = this.getStrapId();

    let collateralAmount = '0';
    const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins.amounts[0];
    if (inputCoinObject.$kind === 'Input') {
      collateralAmount = this.getPureInputU64(inputCoinObject.Input);
    }

    if (this.getMoveCallCommand('high_top_up')) {
      const command = this.getMoveCallCommand('high_top_up').MoveCall;
      [collateralType] = command.typeArguments;

      const buckAmount = command.arguments[1];
      if (buckAmount.$kind === 'Input') {
        borrowAmount = this.getPureInputU64(buckAmount.Input);
      }

      const insertPlaceArg = command.arguments[3];
      if (insertPlaceArg.$kind === 'Input') {
        const insertionPlaces = this.getPureAddresses(insertPlaceArg.Input);
        if (insertionPlaces.length === 1) {
          [insertionPlace] = insertionPlaces;
        }
      }
    } else if (this.getMoveCallCommand('high_borrow')) {
      const command = this.getMoveCallCommand('high_borrow').MoveCall;
      [collateralType] = command.typeArguments;

      const buckAmount = command.arguments[4];
      if (buckAmount.$kind === 'Input') {
        borrowAmount = this.getPureInputU64(buckAmount.Input);
      }

      const insertPlaceArg = command.arguments[5];
      if (insertPlaceArg.$kind === 'Input') {
        const insertionPlaces = this.getPureAddresses(insertPlaceArg.Input);
        if (insertionPlaces.length === 1) {
          [insertionPlace] = insertionPlaces;
        }
      }
    } else if (this.getMoveCallCommand('high_borrow_with_strap')) {
      const command = this.getMoveCallCommand('high_borrow_with_strap').MoveCall;
      [collateralType] = command.typeArguments;

      const buckOutput = command.arguments[5];
      if (buckOutput.$kind === 'Input') {
        borrowAmount = this.getPureInputU64(buckOutput.Input);
      }

      const insertPlaceArg = command.arguments[6];
      if (insertPlaceArg.$kind === 'Input') {
        const insertionPlaces = this.getPureAddresses(insertPlaceArg.Input);
        if (insertionPlaces.length === 1) {
          [insertionPlace] = insertionPlaces;
        }
      }
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
    let collateralType = '';
    let repayAmount = '0';
    let withdrawAmount = '0';
    const isSurplus = false;
    let insertionPlace: string | undefined;
    const strapId: string | undefined = this.getStrapId();

    if (this.getMoveCallCommand('fully_repay')) {
      const repayCommand = this.getMoveCallCommand('fully_repay').MoveCall;
      [collateralType] = repayCommand.typeArguments;
    } else if (this.getMoveCallCommand('fully_repay_with_strap')) {
      const repayCommand = this.getMoveCallCommand('fully_repay_with_strap').MoveCall;
      [collateralType] = repayCommand.typeArguments;
    } else if (this.getMoveCallCommand('repay_and_withdraw')) {
      const command = this.getMoveCallCommand('repay_and_withdraw').MoveCall;
      [collateralType] = command.typeArguments;
      const withdrawArg = command.arguments[4];
      if (withdrawArg.$kind === 'Input') {
        withdrawAmount = this.getPureInputU64(withdrawArg.Input);
      }
      const insertPlaceArg = command.arguments[5];
      if (insertPlaceArg.$kind === 'Input') {
        const insertionPlaces = this.getPureAddresses(insertPlaceArg.Input);
        if (insertionPlaces.length === 1) {
          [insertionPlace] = insertionPlaces;
        }
      }

      const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins.amounts[0];
      if (inputCoinObject.$kind === 'Input') {
        repayAmount = this.getPureInputU64(inputCoinObject.Input);
      }
    } else if (this.getMoveCallCommand('repay_and_withdraw_with_strap')) {
      const command = this.getMoveCallCommand('repay_and_withdraw_with_strap').MoveCall;
      [collateralType] = command.typeArguments;
      const withdrawArg = command.arguments[5];
      if (withdrawArg.$kind === 'Input') {
        withdrawAmount = this.getPureInputU64(withdrawArg.Input);
      }
      const insertPlaceArg = command.arguments[6];
      if (insertPlaceArg.$kind === 'Input') {
        const insertionPlaces = this.getPureAddresses(insertPlaceArg.Input);
        if (insertionPlaces.length === 1) {
          [insertionPlace] = insertionPlaces;
        }
      }

      const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins.amounts[0];
      if (inputCoinObject.$kind === 'Input') {
        repayAmount = this.getPureInputU64(inputCoinObject.Input);
      }
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

  private decodeWithdraw(): DecodeResult {
    let collateralType = '';
    let withdrawAmount = '0';
    let insertionPlace: string | undefined;
    const strapId: string | undefined = this.getStrapId();

    if (this.getMoveCallCommand('withdraw_with_strap')) {
      const command = this.getMoveCallCommand('withdraw_with_strap').MoveCall;
      [collateralType] = command.typeArguments;

      const withdrawArg = command.arguments[4];
      if (withdrawArg.$kind === 'Input') {
        withdrawAmount = this.getPureInputU64(withdrawArg.Input);
      }

      const insertPlaceArg = command.arguments[5];
      if (insertPlaceArg.$kind === 'Input') {
        const insertionPlaces = this.getPureAddresses(insertPlaceArg.Input);
        if (insertionPlaces.length === 1) {
          [insertionPlace] = insertionPlaces;
        }
      }
    } else if (this.getMoveCallCommand('withdraw')) {
      const command = this.getMoveCallCommand('withdraw').MoveCall;
      [collateralType] = command.typeArguments;

      const withdrawArg = command.arguments[3];
      if (withdrawArg.$kind === 'Input') {
        withdrawAmount = this.getPureInputU64(withdrawArg.Input);
      }

      const insertPlaceArg = command.arguments[4];
      if (insertPlaceArg.$kind === 'Input') {
        const insertionPlaces = this.getPureAddresses(insertPlaceArg.Input);
        if (insertionPlaces.length === 1) {
          [insertionPlace] = insertionPlaces;
        }
      }
    }

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.Withdraw,
      intentionData: {
        collateralType,
        withdrawAmount,
        insertionPlace,
        strapId,
      } as WithdrawIntentionData,
    };
  }

  private decodeClose(): DecodeResult {
    let collateralType = '';
    const strapId: string | undefined = this.getStrapId();

    if (this.getMoveCallCommand('destroy_empty_strap')) {
      const command = this.getMoveCallCommand('destroy_empty_strap').MoveCall;
      [collateralType] = command.typeArguments;
    }

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.Close,
      intentionData: {
        collateralType,
        strapId,
      } as CloseIntentionData,
    };
  }

  private decodeSBUCKDeposit(): DecodeResult {
    const balanceObject = this.getMoveCallCommand('into_balance');
    const coinType = balanceObject.MoveCall.typeArguments[0];

    let amount = '0';
    const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins;
    const inputAmount = inputCoinObject.amounts[0];
    if (inputAmount.$kind === 'Input') {
      amount = this.getPureInputU64(inputAmount.Input);
    }

    const isStake = this.isSBUCKStakeTransaction();
    console.log('Decoder.decodeSBUCKDeposit', coinType, amount, isStake);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SBUCKDeposit,
      intentionData: {
        coinType,
        amount,
        isStake,
      } as SBUCKDepositIntentionData,
    };
  }

  private decodeSBUCKUnstake(): DecodeResult {
    let amount = '0';

    const isStake = this.isSBUCKStakeTransaction();
    if (isStake) {
      const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins;
      const inputAmount = inputCoinObject.amounts[0];
      if (inputAmount.$kind === 'Input') {
        amount = this.getPureInputU64(inputAmount.Input);
      }
    }

    const stakeProofs: string[] = [];
    const unlockCommands = this.getMoveCallModuleCommands('proof_rule', 'unlock');
    if (unlockCommands.length > 0) {
      for (let i = 0; i < unlockCommands.length; i++) {
        const command = unlockCommands[i];
        stakeProofs.push('');
      }
    } else {
      const unstakeCommands = this.getMoveCallModuleCommands('fountain_core', 'force_unstake');
      for (let i = 0; i < unstakeCommands.length; i++) {
        const command = unstakeCommands[i];
        const argument = command.MoveCall.arguments[2];
        if (argument.$kind === 'Input') {
          const { objectId } = this.inputs[argument.Input].UnresolvedObject;
          stakeProofs.push(objectId);
        }
      }
    }

    const toBuck = this.isSBUCKWithdrawTransaction();

    const intentionData = {
      stakeProofs,
      amount,
      isStake,
      toBuck,
    } as SBUCKUnstakeIntentionData;
    console.log('Decoder.decodeSBUCKUnstake', intentionData);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SBUCKUnstake,
      intentionData,
    };
  }

  private decodeSBUCKWithdraw(): DecodeResult {
    let amount = '0';

    const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins;
    const inputAmount = inputCoinObject.amounts[0];
    if (inputAmount.$kind === 'Input') {
      amount = this.getPureInputU64(inputAmount.Input);
    }

    console.log('Decoder.SBUCKWithdraw', amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SBUCKWithdraw,
      intentionData: {
        amount,
      } as SBUCKWithdrawIntentionData,
    };
  }

  private decodeSBUCKClaim(): DecodeResult {
    const stakeProofs: string[] = [];

    const commands = this.getMoveCallModuleCommands('fountain_core', 'claim');
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      const argument = command.MoveCall.arguments[2];
      if (argument.$kind === 'Input') {
        const { objectId } = this.inputs[argument.Input].UnresolvedObject;
        stakeProofs.push(objectId);
      }
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

  private decodeTankDeposit(): DecodeResult {
    let amount = '0';
    const inputCoinObject = this.getSplitCoinsCommands()[0].SplitCoins;
    const inputAmount = inputCoinObject.amounts[0];
    if (inputAmount.$kind === 'Input') {
      amount = this.getPureInputU64(inputAmount.Input);
    }

    const command = this.getMoveCallModuleCommand('tank_operations', 'deposit').MoveCall;
    const coinType = command.typeArguments[0];

    console.log('Decoder.decodeTankDeposit', coinType, amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.TankDeposit,
      intentionData: {
        coinType,
        amount,
      } as TankDepositIntentionData,
    };
  }

  private decodeTankWithdraw(): DecodeResult {
    const command = this.getMoveCallModuleCommand('tank_operations', 'withdraw').MoveCall;
    const coinType = command.typeArguments[0];

    let amount = '0';
    const amountArg = command.arguments[5];
    if (amountArg.$kind === 'Input') {
      amount = this.getPureInputU64(amountArg.Input);
    }

    console.log('Decoder.decodeTankWithdraw', coinType, amount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.TankWithdraw,
      intentionData: {
        coinType,
        amount,
      } as TankWithdrawIntentionData,
    };
  }

  private decodeTankClaim(): DecodeResult {
    const command = this.getMoveCallModuleCommand('tank_operations', 'claim').MoveCall;
    const coinType = command.typeArguments[0];

    console.log('Decoder.decodeTankClaim', coinType);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.TankClaim,
      intentionData: {
        coinType,
      } as TankClaimIntentionData,
    };
  }

  private decodeLockedClaim(): DecodeResult {
    let coinType = '';
    let proofCount = 0;

    const sbuckClaimCommands = this.getMoveCallModuleCommands('proof_rule', 'claim');
    for (let i = 0; i < sbuckClaimCommands.length; i++) {
      const command = sbuckClaimCommands[i];
      [coinType] = command.MoveCall.typeArguments;
      proofCount++;
    }

    const lstClaimCommands = this.getMoveCallModuleCommands('lst_proof_rule', 'claim');
    for (let i = 0; i < lstClaimCommands.length; i++) {
      const command = lstClaimCommands[i];
      [coinType] = command.MoveCall.typeArguments;
      proofCount++;
    }
    console.log('Decoder.decodeLockedClaim', coinType, proofCount);

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.LockClaim,
      intentionData: {
        coinType,
        proofCount,
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

  private getStrapId() {
    let strapId: string | undefined;

    if (this.isStrapNewTransaction()) {
      strapId = 'new';
    } else if (this.isLstUnlockTransaction()) {
      strapId = 'locked';
    }

    if (!strapId) {
      const command = this.getMoveCallModuleCommand('fountain', 'unstake');
      if (command) {
        const strapArg = command.MoveCall.arguments[2];
        if (strapArg.$kind === 'Input') {
          strapId = this.inputs[strapArg.Input].UnresolvedObject.objectId;
        }
      }
    }

    return strapId;
  }

  private getPureInputU64(idx: number) {
    const input = this.inputs[idx];
    if (input.$kind !== 'Pure') {
      throw new Error('not pure argument');
    }

    return bcs.U64.fromBase64(input.Pure.bytes);
  }

  private getPureAddresses(idx: number) {
    const input = this.inputs[idx];
    if (input.$kind !== 'Pure') {
      throw new Error('not pure argument');
    }

    return bcs.vector(bcs.Address).fromBase64(input.Pure.bytes);
  }
}
