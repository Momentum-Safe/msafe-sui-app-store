import { TransactionType } from '@msafe/sui3-utils';
import { MoveCallTransaction, SplitCoinsTransaction } from '@mysten/sui.js/dist/cjs/transactions';

import { Decoder } from './decoder';
import { OLD_BORROW_INCENTIVE_PROTOCOL_ID } from '../constants';
import { DecodeResult } from '../types';
import { TransactionSubType } from '../types/utils';
import { MoveCallHelper } from '../utils/moveCallHelper';
import { SplitCoinHelper } from '../utils/splitCoinHelper';

export class DecoderVesca extends Decoder {
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
    return undefined;
  }

  private isStakeScaFirsTime() {
    return !!this.getMoveCallTransaction(`${this.coreId.veScaPkgId}::ve_sca::mint_ve_sca_key`);
  }

  private isExtendPeriodAndStakeMoreSca() {
    const extendPeriod = this.getMoveCallTransaction(`${this.coreId.veScaPkgId}::ve_sca::extend_lock_period`);
    const stakeMoreSca = this.getMoveCallTransaction(`${this.coreId.veScaPkgId}::ve_sca::lock_more_sca`);
    return !!extendPeriod && !!stakeMoreSca;
  }

  private isRedeemSca() {
    return !!this.getMoveCallTransaction(`${this.coreId.veScaPkgId}::ve_sca::redeem`);
  }

  private isStakeMoreSca() {
    return !!this.getMoveCallTransaction(`${this.coreId.veScaPkgId}::ve_sca::lock_more_sca`);
  }

  private isExtendPeriod() {
    return !!this.getMoveCallTransaction(`${this.coreId.veScaPkgId}::ve_sca::extend_lock_period`);
  }

  private isRenewExpiredVeSca() {
    return !!this.getMoveCallTransaction(`${this.coreId.veScaPkgId}::ve_sca::renew_expired_ve_sca`);
  }

  private get helperStakeMoreSca() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.veScaPkgId}::ve_sca::lock_more_sca`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperStakeSca() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.veScaPkgId}::ve_sca::mint_ve_sca_key`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperExtendStakePeriod() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.veScaPkgId}::ve_sca::extend_lock_period`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperRedeemSca() {
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.veScaPkgId}::ve_sca::redeem`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperRenewExpired() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.veScaPkgId}::ve_sca::renew_expired_ve_sca`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperOldUnstakeObligation() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' && trans.target.startsWith(`${OLD_BORROW_INCENTIVE_PROTOCOL_ID}::user::unstake`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperUnstakeObligation() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.borrowIncentivePkg}::user::unstake`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperStakeObligationWithVeSca() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' &&
        trans.target.startsWith(`${this.coreId.borrowIncentivePkg}::user::stake_with_ve_sca`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
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
    const lockSca = this.helperRenewExpired.getNestedInputParam<SplitCoinsTransaction>(4);
    const unlockTime = this.helperRenewExpired.decodeInputU64(5);
    const amountFromSplitCoin = new SplitCoinHelper(lockSca, this.txb).getAmountInput().reduce((a, b) => a + b, 0);
    const veScaKey = this.helperRenewExpired.decodeOwnedObjectId(1);
    const isHaveRedeem = !!this.helperRedeemSca.moveCall;
    let oldUnstakeObligation: string[] = [];
    let unstakeObligation: string[] = [];
    let stakeObligation: string[] = [];
    if (this.helperOldUnstakeObligation.moveCall) {
      oldUnstakeObligation = [
        this.helperOldUnstakeObligation.decodeSharedObjectId(2), // Obligation key
        this.helperOldUnstakeObligation.decodeSharedObjectId(3), // Obligation Id
      ];
    }
    if (this.helperUnstakeObligation.moveCall) {
      unstakeObligation = [
        this.helperUnstakeObligation.decodeSharedObjectId(3), // Obligation key
        this.helperUnstakeObligation.decodeSharedObjectId(4), // Obligation Id
      ];
    }
    if (this.helperStakeObligationWithVeSca.moveCall) {
      stakeObligation = [
        this.helperStakeObligationWithVeSca.decodeSharedObjectId(3), // Obligation key
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
        lockPeriodInDays: unlockTime,
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
        this.helperOldUnstakeObligation.decodeSharedObjectId(2), // Obligation key
        this.helperOldUnstakeObligation.decodeSharedObjectId(3), // Obligation Id
      ];
    }
    if (this.helperUnstakeObligation.moveCall) {
      unstakeObligation = [
        this.helperUnstakeObligation.decodeSharedObjectId(3), // Obligation key
        this.helperUnstakeObligation.decodeSharedObjectId(4), // Obligation Id
      ];
    }
    if (this.helperStakeObligationWithVeSca.moveCall) {
      stakeObligation = [
        this.helperStakeObligationWithVeSca.decodeSharedObjectId(3), // Obligation key
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
        lockPeriodInDays: unlockTime,
        obligationId,
        obligationKey,
        veScaKey,
        isObligationLocked,
        isOldBorrowIncentive,
      },
    };
  }

  private decodePeriodAndStakeMoreSca(): DecodeResult {
    const lockSca = this.helperStakeMoreSca.getNestedInputParam<SplitCoinsTransaction>(4);
    const unlockTime = this.helperExtendStakePeriod.decodeInputU64(4);
    const amountFromSplitCoin = new SplitCoinHelper(lockSca, this.txb).getAmountInput().reduce((a, b) => a + b, 0);
    let oldUnstakeObligation: string[] = [];
    let unstakeObligation: string[] = [];
    let veScaKey;
    let stakeObligation: string[] = [];
    if (this.helperOldUnstakeObligation.moveCall) {
      oldUnstakeObligation = [
        this.helperOldUnstakeObligation.decodeSharedObjectId(2), // Obligation key
        this.helperOldUnstakeObligation.decodeSharedObjectId(3), // Obligation Id
      ];
    }
    if (this.helperUnstakeObligation.moveCall) {
      unstakeObligation = [
        this.helperUnstakeObligation.decodeSharedObjectId(3), // Obligation key
        this.helperUnstakeObligation.decodeSharedObjectId(4), // Obligation Id
      ];
    }
    if (this.helperStakeMoreSca.moveCall) {
      veScaKey = this.helperStakeMoreSca.decodeOwnedObjectId(1);
    }
    if (this.helperStakeObligationWithVeSca.moveCall) {
      stakeObligation = [
        this.helperStakeObligationWithVeSca.decodeSharedObjectId(3), // Obligation key
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
        lockPeriodInDays: unlockTime,
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
      lockSca = this.helperStakeSca.getNestedInputParam<SplitCoinsTransaction>(3);
      unlockTime = this.helperStakeSca.decodeInputU64(4);
    } else {
      lockSca = this.helperStakeMoreSca.getNestedInputParam<SplitCoinsTransaction>(4);
    }
    const amountFromSplitCoin = new SplitCoinHelper(lockSca, this.txb).getAmountInput().reduce((a, b) => a + b, 0);
    let oldUnstakeObligation: string[] = [];
    let unstakeObligation: string[] = [];
    let veScaKey;
    let stakeObligation: string[] = [];
    if (this.helperOldUnstakeObligation.moveCall) {
      oldUnstakeObligation = [
        this.helperOldUnstakeObligation.decodeSharedObjectId(2), // Obligation key
        this.helperOldUnstakeObligation.decodeSharedObjectId(3), // Obligation Id
      ];
    }
    if (this.helperUnstakeObligation.moveCall) {
      unstakeObligation = [
        this.helperUnstakeObligation.decodeSharedObjectId(3), // Obligation key
        this.helperUnstakeObligation.decodeSharedObjectId(4), // Obligation Id
      ];
    }
    if (this.helperStakeMoreSca.moveCall) {
      veScaKey = this.helperStakeMoreSca.decodeOwnedObjectId(1);
    }
    if (this.helperStakeObligationWithVeSca.moveCall) {
      stakeObligation = [
        this.helperStakeObligationWithVeSca.decodeSharedObjectId(3), // Obligation key
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
        lockPeriodInDays: unlockTime,
        obligationId,
        obligationKey,
        veScaKey,
        isObligationLocked,
        isOldBorrowIncentive,
      },
    };
  }
}
