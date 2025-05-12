import { TransactionType } from '@msafe/sui3-utils';
import { OLD_BORROW_INCENTIVE_PROTOCOL_ID } from '@scallop-io/sui-scallop-sdk';

import { Decoder } from './decoder';
import { VeScaObligationBindingsIntentData } from '../intentions/staking/ve-sca-obligation-bindings';
import { DecodeResult } from '../types';
import { SplitCoinTransactionType } from '../types/sui';
import { TransactionSubType } from '../types/utils';
import { MoveCallHelper, SplitCoinHelper } from '../utils';

export class DecoderVeSca extends Decoder {
  decode() {
    if (this.isExtendPeriodAndStakeMoreSca()) {
      return this.decodePeriodAndStakeMoreSca();
    }
    if (this.isStakeScaFirsTime() || this.isStakeMoreSca()) {
      return this.decodeStakeSca();
    }
    if (this.isRenewExpiredVeSca()) {
      return this.decodeRenewExpiredVeSca();
    }
    if (this.isExtendPeriod()) {
      return this.decodeExtendStakePeriod();
    }
    if (this.isRedeemSca()) {
      return this.decodeRedeemSca();
    }
    if (this.isMergeVeSca()) {
      return this.decodeMergeVesca();
    }
    if (this.isSplitVeSca()) {
      return this.decodeSplitVesca();
    }
    if (this.isVeScaObligationBindings()) {
      return this.decodeVeScaObligationBindings();
    }
    return undefined;
  }

  private isStakeScaFirsTime() {
    return this.hasMoveCallCommand(`${this.coreId.veScaPkgId}::ve_sca::mint_ve_sca_key`);
  }

  private isExtendPeriodAndStakeMoreSca() {
    const extendPeriod = this.hasMoveCallCommand(`${this.coreId.veScaPkgId}::ve_sca::extend_lock_period`);
    const stakeMoreSca = this.hasMoveCallCommand(`${this.coreId.veScaPkgId}::ve_sca::lock_more_sca`);
    return !!extendPeriod && !!stakeMoreSca;
  }

  private isRedeemSca() {
    return this.hasMoveCallCommand(`${this.coreId.veScaPkgId}::ve_sca::redeem`);
  }

  private isStakeMoreSca() {
    return this.hasMoveCallCommand(`${this.coreId.veScaPkgId}::ve_sca::lock_more_sca`);
  }

  private isExtendPeriod() {
    return this.hasMoveCallCommand(`${this.coreId.veScaPkgId}::ve_sca::extend_lock_period`);
  }

  private isRenewExpiredVeSca() {
    return this.hasMoveCallCommand(`${this.coreId.veScaPkgId}::ve_sca::renew_expired_ve_sca`);
  }

  private isMergeVeSca() {
    return this.hasMoveCallCommand(`${this.coreId.veScaPkgId}::ve_sca::merge`);
  }

  private isSplitVeSca() {
    return this.hasMoveCallCommand(`${this.coreId.veScaPkgId}::ve_sca::split`);
  }

  private isVeScaObligationBindings() {
    const unstakeCommands = this.commands.filter((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.borrowIncentivePkg}::user::unstake_v2`),
    );

    const stakeCommands = this.commands.filter((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.borrowIncentivePkg}::user::stake_with_ve_sca_v2`),
    );

    const deactivateBoostCommands = this.commands.filter((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.borrowIncentivePkg}::user::deactivate_boost_v2`),
    );

    const notEmpty =
      unstakeCommands.length > 0 && stakeCommands.length > 0 && unstakeCommands.length === stakeCommands.length;
    const isDeactivateBoost = deactivateBoostCommands.length > 0;
    const noOtherCommands =
      this.commands.length === unstakeCommands.length + stakeCommands.length + deactivateBoostCommands.length;

    return noOtherCommands && (notEmpty || isDeactivateBoost);
  }

  private get helperStakeMoreSca() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.veScaPkgId}::ve_sca::lock_more_sca`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperStakeSca() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.veScaPkgId}::ve_sca::mint_ve_sca_key`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperExtendStakePeriod() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.veScaPkgId}::ve_sca::extend_lock_period`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperRedeemSca() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.veScaPkgId}::ve_sca::redeem`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperRenewExpired() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.veScaPkgId}::ve_sca::renew_expired_ve_sca`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperOldUnstakeObligation() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${OLD_BORROW_INCENTIVE_PROTOCOL_ID}::user::unstake`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperUnstakeObligation() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.borrowIncentivePkg}::user::unstake_v2`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperStakeObligationWithVeSca() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.borrowIncentivePkg}::user::stake_with_ve_sca_v2`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private getMergeSplitVeScaHelper(type: 'merge' | 'split') {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.veScaPkgId}::ve_sca::${type}`),
    );

    return new MoveCallHelper(moveCall, this.transaction);
  }

  private getVeScaObligationBindingHelpers() {
    const unstakeMoveCall = `${this.coreId.borrowIncentivePkg}::user::unstake_v2`;
    const stakeMoveCall = `${this.coreId.borrowIncentivePkg}::user::stake_with_ve_sca_v2`;
    const deactivateMoveCall = `${this.coreId.borrowIncentivePkg}::user::deactivate_boost_v2`;

    const helpers: {
      action: 'stake' | 'unstake' | 'deactivate';
      helper: MoveCallHelper;
    }[] = [];

    let unstakeHelperIdx = 0;
    let stakeHelperIdx = 0;
    let deactivateIdx = 0;

    this.commands.forEach((command) => {
      if (this.filterMoveCallCommands(command, unstakeMoveCall)) {
        helpers.push({
          action: 'unstake',
          helper: new MoveCallHelper(command, this.transaction, unstakeHelperIdx),
        });
        unstakeHelperIdx++;
      } else if (this.filterMoveCallCommands(command, stakeMoveCall)) {
        helpers.push({
          action: 'stake',
          helper: new MoveCallHelper(command, this.transaction, stakeHelperIdx),
        });
        stakeHelperIdx++;
      } else if (this.filterMoveCallCommands(command, deactivateMoveCall)) {
        helpers.push({
          action: 'deactivate',
          helper: new MoveCallHelper(command, this.transaction, deactivateIdx),
        });
        deactivateIdx++;
      }
    });

    return helpers;
  }

  private decodeRedeemSca(): DecodeResult {
    const veScaKey = this.helperRedeemSca.decodeOwnedObjectId(1);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.RedeemSca,
      intentionData: {
        veScaKey,
      },
    };
  }

  private decodeRenewExpiredVeSca(): DecodeResult {
    const lockSca = this.helperRenewExpired.getNestedInputParam<SplitCoinTransactionType>(4);
    const unlockTime = this.helperRenewExpired.decodeInputU64(5);
    const amountFromSplitCoin = new SplitCoinHelper(lockSca, this.transaction)
      .getAmountInput()
      .reduce((a, b) => a + b, 0);
    const veScaKey = this.helperRenewExpired.decodeOwnedObjectId(1);
    const isHaveRedeem = !!this.helperRedeemSca.moveCall;
    let oldUnstakeObligation: string[] = [];
    let unstakeObligation: string[] = [];
    let stakeObligation: string[] = [];
    if (this.helperOldUnstakeObligation.moveCall) {
      oldUnstakeObligation = [
        this.helperOldUnstakeObligation.decodeOwnedObjectId(2), // Obligation key
        this.helperOldUnstakeObligation.decodeSharedObjectId(3), // Obligation Id
      ];
    }
    if (this.helperUnstakeObligation.moveCall) {
      unstakeObligation = [
        this.helperUnstakeObligation.decodeOwnedObjectId(3), // Obligation key
        this.helperUnstakeObligation.decodeSharedObjectId(4), // Obligation Id
      ];
    }
    if (this.helperStakeObligationWithVeSca.moveCall) {
      stakeObligation = [
        this.helperStakeObligationWithVeSca.decodeOwnedObjectId(3), // Obligation key
        this.helperStakeObligationWithVeSca.decodeSharedObjectId(4), // Obligation Id
      ];
    }
    let isObligationLocked = false;
    let isOldBorrowIncentive = false;
    let obligationId;
    let obligationKey;

    const operations = [
      { condition: oldUnstakeObligation, isOld: true },
      { condition: unstakeObligation, isOld: false },
      { condition: stakeObligation, isOld: false },
    ];

    for (let i = 0; i < operations.length; i++) {
      if (operations[i].condition.length > 1) {
        [obligationKey, obligationId] = operations[i].condition;
        isObligationLocked = true;
        isOldBorrowIncentive = operations[i].isOld;
      }
    }
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.RenewExpStakePeriod,
      intentionData: {
        amount: amountFromSplitCoin,
        unlockTime,
        obligationId,
        obligationKey,
        veScaKey,
        isHaveRedeem,
        isObligationLocked,
        isOldBorrowIncentive,
      },
    };
  }

  private decodeExtendStakePeriod(): DecodeResult {
    const unlockTime = this.helperExtendStakePeriod.decodeInputU64(4);
    const veScaKey = this.helperExtendStakePeriod.decodeOwnedObjectId(1);
    let oldUnstakeObligation: string[] = [];
    let unstakeObligation: string[] = [];
    let stakeObligation: string[] = [];
    if (this.helperOldUnstakeObligation.moveCall) {
      oldUnstakeObligation = [
        this.helperOldUnstakeObligation.decodeOwnedObjectId(2), // Obligation key
        this.helperOldUnstakeObligation.decodeSharedObjectId(3), // Obligation Id
      ];
    }
    if (this.helperUnstakeObligation.moveCall) {
      unstakeObligation = [
        this.helperUnstakeObligation.decodeOwnedObjectId(3), // Obligation key
        this.helperUnstakeObligation.decodeSharedObjectId(4), // Obligation Id
      ];
    }
    if (this.helperStakeObligationWithVeSca.moveCall) {
      stakeObligation = [
        this.helperStakeObligationWithVeSca.decodeOwnedObjectId(3), // Obligation key
        this.helperStakeObligationWithVeSca.decodeSharedObjectId(4), // Obligation Id
      ];
    }
    let isObligationLocked = false;
    let isOldBorrowIncentive = false;
    let obligationId;
    let obligationKey;

    const operations = [
      { condition: oldUnstakeObligation, isOld: true },
      { condition: unstakeObligation, isOld: false },
      { condition: stakeObligation, isOld: false },
    ];

    for (let i = 0; i < operations.length; i++) {
      if (operations[i].condition.length > 1) {
        [obligationKey, obligationId] = operations[i].condition;
        isObligationLocked = true;
        isOldBorrowIncentive = operations[i].isOld;
      }
    }
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.ExtendStakePeriod,
      intentionData: {
        unlockTime,
        obligationId,
        obligationKey,
        veScaKey,
        isObligationLocked,
        isOldBorrowIncentive,
      },
    };
  }

  private decodePeriodAndStakeMoreSca(): DecodeResult {
    const lockSca = this.helperStakeMoreSca.getNestedInputParam<SplitCoinTransactionType>(4);
    const unlockTime = this.helperExtendStakePeriod.decodeInputU64(4);
    const amountFromSplitCoin = new SplitCoinHelper(lockSca, this.transaction)
      .getAmountInput()
      .reduce((a, b) => a + b, 0);
    let oldUnstakeObligation: string[] = [];
    let unstakeObligation: string[] = [];
    let veScaKey;
    let stakeObligation: string[] = [];
    if (this.helperOldUnstakeObligation.moveCall) {
      oldUnstakeObligation = [
        this.helperOldUnstakeObligation.decodeOwnedObjectId(2), // Obligation key
        this.helperOldUnstakeObligation.decodeSharedObjectId(3), // Obligation Id
      ];
    }
    if (this.helperUnstakeObligation.moveCall) {
      unstakeObligation = [
        this.helperUnstakeObligation.decodeOwnedObjectId(3), // Obligation key
        this.helperUnstakeObligation.decodeSharedObjectId(4), // Obligation Id
      ];
    }
    if (this.helperStakeMoreSca.moveCall) {
      veScaKey = this.helperStakeMoreSca.decodeOwnedObjectId(1);
    }
    if (this.helperStakeObligationWithVeSca.moveCall) {
      stakeObligation = [
        this.helperStakeObligationWithVeSca.decodeOwnedObjectId(3), // Obligation key
        this.helperStakeObligationWithVeSca.decodeSharedObjectId(4), // Obligation Id
      ];
    }
    let isObligationLocked = false;
    let isOldBorrowIncentive = false;
    let obligationId;
    let obligationKey;

    const operations = [
      { condition: oldUnstakeObligation, isOld: true },
      { condition: unstakeObligation, isOld: false },
      { condition: stakeObligation, isOld: false },
    ];

    for (let i = 0; i < operations.length; i++) {
      if (operations[i].condition.length > 1) {
        [obligationKey, obligationId] = operations[i].condition;
        isObligationLocked = true;
        isOldBorrowIncentive = operations[i].isOld;
      }
    }
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.ExtendPeriodAndStakeMore,
      intentionData: {
        amount: amountFromSplitCoin,
        veScaKey,
        unlockTime,
        obligationId,
        obligationKey,
        isOldBorrowIncentive,
        isObligationLocked,
      },
    };
  }

  private decodeStakeSca(): DecodeResult {
    let lockSca;
    let unlockTime;
    if (this.helperStakeSca.moveCall && this.helperStakeMoreSca.moveCall === undefined) {
      lockSca = this.helperStakeSca.getNestedInputParam<SplitCoinTransactionType>(3);
      unlockTime = this.helperStakeSca.decodeInputU64(4);
    } else {
      lockSca = this.helperStakeMoreSca.getNestedInputParam<SplitCoinTransactionType>(4);
    }
    const amountFromSplitCoin = new SplitCoinHelper(lockSca, this.transaction)
      .getAmountInput()
      .reduce((a, b) => a + b, 0);
    let oldUnstakeObligation: string[] = [];
    let unstakeObligation: string[] = [];
    let veScaKey;
    let stakeObligation: string[] = [];
    if (this.helperOldUnstakeObligation.moveCall) {
      oldUnstakeObligation = [
        this.helperOldUnstakeObligation.decodeOwnedObjectId(2), // Obligation key
        this.helperOldUnstakeObligation.decodeSharedObjectId(3), // Obligation Id
      ];
    }
    if (this.helperUnstakeObligation.moveCall) {
      unstakeObligation = [
        this.helperUnstakeObligation.decodeOwnedObjectId(3), // Obligation key
        this.helperUnstakeObligation.decodeSharedObjectId(4), // Obligation Id
      ];
    }
    if (this.helperStakeMoreSca.moveCall) {
      veScaKey = this.helperStakeMoreSca.decodeOwnedObjectId(1);
    }
    if (this.helperStakeObligationWithVeSca.moveCall) {
      stakeObligation = [
        this.helperStakeObligationWithVeSca.decodeOwnedObjectId(3), // Obligation key
        this.helperStakeObligationWithVeSca.decodeSharedObjectId(4), // Obligation Id
      ];
    }
    let isObligationLocked = false;
    let isOldBorrowIncentive = false;
    let obligationId;
    let obligationKey;

    const operations = [
      { condition: oldUnstakeObligation, isOld: true },
      { condition: unstakeObligation, isOld: false },
      { condition: stakeObligation, isOld: false },
    ];

    for (let i = 0; i < operations.length; i++) {
      if (operations[i].condition.length > 1) {
        [obligationKey, obligationId] = operations[i].condition;
        isObligationLocked = true;
        isOldBorrowIncentive = operations[i].isOld;
      }
    }
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.StakeSca,
      intentionData: {
        amount: amountFromSplitCoin,
        unlockTime,
        obligationId,
        obligationKey,
        veScaKey,
        isObligationLocked,
        isOldBorrowIncentive,
      },
    };
  }

  private decodeMergeVesca(): DecodeResult {
    const mergeSplithelper = this.getMergeSplitVeScaHelper('merge');
    const intentionData = {
      targetVeScaKey: mergeSplithelper.decodeOwnedObjectId(1),
      sourceVeScaKey: mergeSplithelper.decodeOwnedObjectId(2),
    };

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.MergeVeSca,
      intentionData,
    };
  }

  private decodeSplitVesca(): DecodeResult {
    const helper = this.getMergeSplitVeScaHelper('split');
    const intentionData = {
      targetVeScaKey: helper.decodeOwnedObjectId(1),
      splitAmount: helper.decodeInputU64(4),
    };

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SplitVeSca,
      intentionData,
    };
  }

  private decodeVeScaObligationBindings(): DecodeResult {
    const helpers = this.getVeScaObligationBindingHelpers();

    const parseArgFromHelper = (
      action: 'stake' | 'unstake' | 'deactivate',
      helper: MoveCallHelper,
    ): VeScaObligationBindingsIntentData['bindingDatas'][number]['args'] => {
      switch (action) {
        case 'stake': {
          return {
            veScaKey: helper.decodeOwnedObjectId(9),
            obligationId: helper.decodeSharedObjectId(4),
            obligationKey: helper.decodeOwnedObjectId(3),
          };
        }
        case 'unstake': {
          return {
            obligationId: helper.decodeSharedObjectId(4),
            obligationKey: helper.decodeOwnedObjectId(3),
          };
        }
        case 'deactivate': {
          return {
            veScaKey: helper.decodeOwnedObjectId(4),
            obligationId: helper.decodeSharedObjectId(3),
          };
        }
        default:
          throw new Error(`Invalid action ${action}`);
      }
    };

    const bindingDatas = helpers.map(({ action, helper }) => ({
      action,
      args: parseArgFromHelper(action, helper),
    }));

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.VeScaObligationBindings,
      intentionData: {
        bindingDatas,
      },
    };
  }
}
