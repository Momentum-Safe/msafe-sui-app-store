import { TransactionType } from '@msafe/sui3-utils';
import { MoveCallTransaction, SplitCoinsTransaction } from '@mysten/sui.js/dist/cjs/transactions';

import { Decoder } from './decoder';
import { OLD_BORROW_INCENTIVE_PROTOCOL_ID } from '../constants';
import { SupportBorrowIncentiveRewardCoins, SupportStakeMarketCoins } from '../types';
import { DecodeResult, TransactionSubType } from '../types/utils';
import { MoveCallHelper } from '../utils/moveCallHelper';
import { SplitCoinHelper } from '../utils/splitCoinHelper';

export class DecoderLending extends Decoder {
  decode() {
    if (this.isSupplyWithStakeSpoolTransaction()) {
      return this.decodeSupplyWithStakeSpool();
    }
    if (this.isUnstakeAndWithdrawTransaction()) {
      return this.decodeUnstakeAndWithdraw();
    }
    if (this.isStakeSpoolTransaction()) {
      return this.decodeStakeSpool();
    }
    if (this.isDepositCollateralTransaction()) {
      return this.decodeDepositCollateral();
    }
    if (this.isWithdrawCollateralTransaction()) {
      return this.decodeWithdrawCollateral();
    }
    if (this.isWithdrawLendingScoinTransaction()) {
      return this.decodeWithdrawLendingScoin();
    }
    if (this.isWithdrawLendingTransaction()) {
      return this.decodeWithdrawLending();
    }
    if (this.isSupplyLendingTransaction()) {
      return this.decodeSupplyLending();
    }
    if (this.isBorrowWithReferralTransaction()) {
      return this.decodeBorrowWithReferral();
    }
    if (this.isBorrowWithBoostTransaction()) {
      return this.decodeBorrowWithBoost();
    }
    if (this.isBorrowTransaction()) {
      return this.decodeBorrow();
    }
    if (this.isRepayTransaction()) {
      return this.decodeRepay();
    }
    if (this.isUnstakeSpoolTransaction()) {
      return this.decodeUnstakeSpool();
    }
    if (this.isClaimRewardTransaction()) {
      return this.decodeClaimReward();
    }
    if (this.isOpenObligationTransaction()) {
      return this.decodeOpenObligation();
    }
    if (this.isMigrateAndClaim()) {
      return this.decodeMigrateAndClaim();
    }
    if (this.isMigrateScoinTransaction()) {
      return this.decodeMigrateScoin();
    }
    return undefined;
  }

  private isMigrateScoinTransaction() {
    return !!this.getMoveCallTransaction(`${this.coreId.scoin}::s_coin_converter::mint_s_coin`);
  }

  private isSupplyLendingTransaction() {
    return !!this.getMoveCallTransaction(`${this.coreId.protocolPkg}::mint::mint`);
  }

  private isSupplyWithStakeSpoolTransaction() {
    const supplyMoveCall = this.getMoveCallTransaction(`${this.coreId.protocolPkg}::mint::mint`);
    const stakeMoveCall = this.getMoveCallTransaction(`${this.coreId.spoolPkg}::user::stake`);
    return !!supplyMoveCall && !!stakeMoveCall;
  }

  private isUnstakeAndWithdrawTransaction() {
    const unstakeMoveCall = this.getMoveCallTransaction(`${this.coreId.spoolPkg}::user::unstake`);
    const withdrawMoveCall = this.getMoveCallTransaction(`${this.coreId.protocolPkg}::redeem::redeem`);
    return !!unstakeMoveCall && !!withdrawMoveCall;
  }

  private isStakeSpoolTransaction() {
    return !!this.getMoveCallTransaction(`${this.coreId.spoolPkg}::user::stake`);
  }

  private isWithdrawLendingTransaction() {
    return !!this.getMoveCallTransaction(`${this.coreId.protocolPkg}::redeem::redeem`);
  }

  private isWithdrawLendingScoinTransaction() {
    const redeem = !!this.getMoveCallTransaction(`${this.coreId.protocolPkg}::redeem::redeem`);
    const burnScoin = !!this.getMoveCallTransaction(`${this.coreId.scoin}::s_coin_converter::burn_s_coin`);
    return !!redeem && !!burnScoin;
  }

  private isDepositCollateralTransaction() {
    return !!this.getMoveCallTransaction(`${this.coreId.protocolPkg}::deposit_collateral::deposit_collateral`);
  }

  private isWithdrawCollateralTransaction() {
    return !!this.getMoveCallTransaction(`${this.coreId.protocolPkg}::withdraw_collateral::withdraw_collateral`);
  }

  private isBorrowTransaction() {
    return !!this.getMoveCallTransaction(`${this.coreId.protocolPkg}::borrow::borrow`);
  }

  private isBorrowWithBoostTransaction() {
    const borrowMoveCall = this.getMoveCallTransaction(`${this.coreId.protocolPkg}::borrow::borrow`);
    const stakeMoveCall = this.getMoveCallTransaction(`${this.coreId.borrowIncentivePkg}::user::stake_with_ve_sca`);
    return !!borrowMoveCall && !!stakeMoveCall;
  }

  private isBorrowWithReferralTransaction() {
    const stakeMoveCall = this.getMoveCallTransaction(`${this.coreId.borrowIncentivePkg}::user::stake_with_ve_sca`);
    const borrowWithReferral = this.getMoveCallTransaction(`${this.coreId.protocolPkg}::borrow::borrow_with_referral`);
    return !!borrowWithReferral && !!stakeMoveCall;
  }

  private isRepayTransaction() {
    return !!this.getMoveCallTransaction(`${this.coreId.protocolPkg}::repay::repay`);
  }

  private isUnstakeSpoolTransaction() {
    return !!this.getMoveCallTransaction(`${this.coreId.spoolPkg}::user::unstake`);
  }

  private isCreateStakeAccountTransaction() {
    return !!this.getMoveCallTransaction(`${this.coreId.spoolPkg}::user::new_spool_account`);
  }

  private isClaimRewardTransaction() {
    const lendingIncentive = this.getMoveCallTransaction(`${this.coreId.spoolPkg}::user::redeem_rewards`);
    const borrowIncentiveV2 = this.getMoveCallTransaction(`${this.coreId.borrowIncentivePkg}::user::redeem_rewards`);
    return !!lendingIncentive || !!borrowIncentiveV2;
  }

  private isOpenObligationTransaction() {
    return !!this.getMoveCallTransaction(`${this.coreId.protocolPkg}::open_obligation::open_obligation_entry`);
  }

  private isMigrateAndClaim() {
    const oldBorrowIncentive = this.getMoveCallTransaction(`${OLD_BORROW_INCENTIVE_PROTOCOL_ID}::user::redeem_rewards`);
    const stakeWithVeSca = this.getMoveCallTransaction(`${this.coreId.borrowIncentivePkg}::user::stake_with_ve_sca`);
    const stakeWithoutVesca = this.getMoveCallTransaction(`${this.coreId.borrowIncentivePkg}::user::stake`);
    return !!oldBorrowIncentive && (!!stakeWithVeSca || !!stakeWithoutVesca);
  }

  private get helperClaimLendingReward() {
    const moveCalls = this.transactions
      .filter(
        (trans) =>
          trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.spoolPkg}::user::redeem_rewards`),
      )
      .map((trans) => new MoveCallHelper(trans as MoveCallTransaction, this.txb));
    return moveCalls;
  }

  private get helperClaimBorrowV2Reward() {
    const moveCalls = this.transactions
      .filter(
        (trans) =>
          trans.kind === 'MoveCall' &&
          trans.target.startsWith(`${this.coreId.borrowIncentivePkg}::user::redeem_rewards`),
      )
      .map((trans) => new MoveCallHelper(trans as MoveCallTransaction, this.txb));
    return moveCalls;
  }

  private get helperStakeObligationWithVeSca() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' &&
        trans.target.startsWith(`${this.coreId.borrowIncentivePkg}::user::stake_with_ve_sca`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperClaimBorrowReward() {
    const moveCalls = this.transactions
      .filter(
        (trans) =>
          trans.kind === 'MoveCall' &&
          trans.target.startsWith(`${OLD_BORROW_INCENTIVE_PROTOCOL_ID}::user::redeem_rewards`),
      )
      .map((trans) => new MoveCallHelper(trans as MoveCallTransaction, this.txb));
    return moveCalls;
  }

  private get helperMint() {
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.protocolPkg}::mint::mint`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperUnstakes() {
    const moveCalls = this.transactions
      .filter((trans) => trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.spoolPkg}::user::unstake`))
      .map((trans) => new MoveCallHelper(trans as MoveCallTransaction, this.txb));
    return moveCalls;
  }

  private get helperRedeems() {
    const moveCalls = this.transactions
      .filter(
        (trans) => trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.protocolPkg}::redeem::redeem`),
      )
      .map((trans) => new MoveCallHelper(trans as MoveCallTransaction, this.txb));
    return moveCalls;
  }

  private get helperRedeem() {
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.protocolPkg}::redeem::redeem`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperBurnScoin() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.scoin}::s_coin_converter::burn_s_coin`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperStake() {
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.spoolPkg}::user::stake`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperUnstake() {
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.spoolPkg}::user::unstake`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperDepositCollateral() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' &&
        trans.target.startsWith(`${this.coreId.protocolPkg}::deposit_collateral::deposit_collateral`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperWithdrawCollateral() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' &&
        trans.target.startsWith(`${this.coreId.protocolPkg}::withdraw_collateral::withdraw_collateral`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperBorrow() {
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.protocolPkg}::borrow::borrow`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperBorrowWithReferral() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' &&
        trans.target.startsWith(`${this.coreId.protocolPkg}::borrow::borrow_with_referral`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private get helperRepay() {
    const moveCall = this.transactions.find(
      (trans) => trans.kind === 'MoveCall' && trans.target.startsWith(`${this.coreId.protocolPkg}::repay::repay`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private decodeMigrateScoin(): DecodeResult {
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.MigrateScoin,
      intentionData: {},
    };
  }

  private decodeMigrateAndClaim(): DecodeResult {
    let veScaKey;
    if (this.helperStakeObligationWithVeSca.moveCall) {
      veScaKey = this.helperStakeObligationWithVeSca.decodeOwnedObjectId(9);
    }
    const obligationKey = this.helperClaimBorrowReward[0].decodeSharedObjectId(2);
    const obligationId = this.helperClaimBorrowReward[0].decodeOwnedObjectId(3);
    const rewardCoinName = this._builder.utils.parseCoinNameFromType(
      this.helperClaimBorrowReward[0].typeArg(0),
    ) as SupportBorrowIncentiveRewardCoins;
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.MigrateAndClaim,
      intentionData: {
        obligationKey,
        obligationId,
        rewardCoinName,
        veScaKey,
      },
    };
  }

  private decodeOpenObligation(): DecodeResult {
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.OpenObligation,
      intentionData: {},
    };
  }

  private decodeSupplyLending(): DecodeResult {
    const coinName = this._builder.utils.parseCoinNameFromType(this.helperMint.typeArg(0));
    const amount = this.helperMint.getNestedInputParam<SplitCoinsTransaction>(2);
    const amountFromSplitCoin = new SplitCoinHelper(amount, this.txb).getAmountInput().reduce((a, b) => a + b, 0);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SupplyLending,
      intentionData: {
        amount: amountFromSplitCoin,
        coinName,
      },
    };
  }

  private decodeWithdrawLending(): DecodeResult {
    const coinName = this._builder.utils.parseCoinNameFromType(this.helperRedeem.typeArg(0));
    const amount = this.helperRedeem.getNestedInputParam<SplitCoinsTransaction>(2);
    const amountFromSplitCoin = new SplitCoinHelper(amount, this.txb).getAmountInput().reduce((a, b) => a + b, 0);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.WithdrawLending,
      intentionData: {
        amount: amountFromSplitCoin,
        coinName,
      },
    };
  }

  private decodeWithdrawLendingScoin(): DecodeResult {
    const coinName = this._builder.utils.parseCoinNameFromType(this.helperRedeem.typeArg(0));
    const amount = this.helperBurnScoin.getNestedInputParam<SplitCoinsTransaction>(1);
    const amountFromSplitCoin = new SplitCoinHelper(amount, this.txb).getAmountInput().reduce((a, b) => a + b, 0);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.WithdrawLending,
      intentionData: {
        amount: amountFromSplitCoin,
        coinName,
      },
    };
  }

  private decodeDepositCollateral(): DecodeResult {
    const coinName = this._builder.utils.parseCoinNameFromType(this.helperDepositCollateral.typeArg(0));
    const amount = this.helperDepositCollateral.getNestedInputParam<SplitCoinsTransaction>(3);
    const amountFromSplitCoin = new SplitCoinHelper(amount, this.txb).getAmountInput().reduce((a, b) => a + b, 0);
    const obligationId = this.helperDepositCollateral.decodeSharedObjectId(1);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.DepositCollateral,
      intentionData: {
        amount: amountFromSplitCoin,
        obligationId,
        collateralCoinName: coinName,
      },
    };
  }

  private decodeWithdrawCollateral(): DecodeResult {
    const coinName = this._builder.utils.parseCoinNameFromType(this.helperWithdrawCollateral.typeArg(0));
    const amount = this.helperWithdrawCollateral.decodeInputU64(5);
    const obligationId = this.helperWithdrawCollateral.decodeSharedObjectId(1);
    const obligationKey = this.helperWithdrawCollateral.decodeOwnedObjectId(2);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.WithdrawCollateral,
      intentionData: {
        amount,
        collateralCoinName: coinName,
        obligationKey,
        obligationId,
      },
    };
  }

  private decodeBorrow(): DecodeResult {
    const coinName = this._builder.utils.parseCoinNameFromType(this.helperBorrow.typeArg(0));
    const amount = this.helperBorrow.decodeInputU64(5);
    const obligationId = this.helperBorrow.decodeSharedObjectId(1);
    const obligationKey = this.helperBorrow.decodeOwnedObjectId(2);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.Borrow,
      intentionData: {
        amount,
        coinName,
        obligationKey,
        obligationId,
      },
    };
  }

  private decodeBorrowWithBoost(): DecodeResult {
    const coinName = this._builder.utils.parseCoinNameFromType(this.helperBorrow.typeArg(0));
    const veScaKey = this.helperStakeObligationWithVeSca.decodeOwnedObjectId(9);
    const amount = this.helperBorrow.decodeInputU64(5);
    const obligationId = this.helperBorrow.decodeSharedObjectId(1);
    const obligationKey = this.helperBorrow.decodeOwnedObjectId(2);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.BorrowWithBoost,
      intentionData: {
        amount,
        coinName,
        obligationKey,
        obligationId,
        veScaKey,
      },
    };
  }

  private decodeBorrowWithReferral(): DecodeResult {
    const coinName = this._builder.utils.parseCoinNameFromType(this.helperBorrowWithReferral.typeArg(0));
    const veScaKey = this.helperStakeObligationWithVeSca.decodeOwnedObjectId(9);
    const amount = this.helperBorrowWithReferral.decodeInputU64(6);
    const obligationId = this.helperBorrowWithReferral.decodeSharedObjectId(1);
    const obligationKey = this.helperBorrowWithReferral.decodeOwnedObjectId(2);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.BorrowWithReferral,
      intentionData: {
        amount,
        coinName,
        obligationKey,
        obligationId,
        veScaKey,
      },
    };
  }

  private decodeRepay(): DecodeResult {
    const coinName = this._builder.utils.parseCoinNameFromType(this.helperRepay.typeArg(0));
    const amount = this.helperRepay.getNestedInputParam<SplitCoinsTransaction>(3);
    const amountFromSplitCoin = new SplitCoinHelper(amount, this.txb).getAmountInput().reduce((a, b) => a + b, 0);
    const obligationId = this.helperRepay.decodeSharedObjectId(1);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.Repay,
      intentionData: {
        amount: amountFromSplitCoin,
        obligationId,
        coinName,
      },
    };
  }

  private decodeStakeSpool(): DecodeResult {
    let stakeSpoolAccount;
    if (!this.isCreateStakeAccountTransaction()) {
      stakeSpoolAccount = this.helperStake.decodeOwnedObjectId(1);
    }
    const amount = this.helperStake.getNestedInputParam<SplitCoinsTransaction>(2);
    const amountFromSplitCoin = new SplitCoinHelper(amount, this.txb).getAmountInput().reduce((a, b) => a + b, 0);
    const coinType = this.helperStake.typeArg(0);
    const coinName = this._builder.utils.parseCoinNameFromType(coinType);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.StakeSpool,
      intentionData: {
        amount: amountFromSplitCoin,
        marketCoinName: coinName,
        stakeAccountId: stakeSpoolAccount,
      },
    };
  }

  private decodeUnstakeSpool(): DecodeResult {
    const stakeSpoolAccount = this.helperUnstake.decodeOwnedObjectId(1);
    const amount = this.helperUnstake.decodeInputU64(2);
    const coinType = this.helperUnstake.typeArg(0);
    const coinName = this._builder.utils.parseCoinNameFromType(coinType);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.UnstakeSpool,
      intentionData: {
        amount,
        marketCoinName: coinName,
        stakeAccountId: stakeSpoolAccount,
      },
    };
  }

  private decodeSupplyWithStakeSpool(): DecodeResult {
    const coinName = this._builder.utils.parseCoinNameFromType(this.helperMint.typeArg(0));
    const amount = this.helperMint.getNestedInputParam<SplitCoinsTransaction>(2);
    const amountFromSplitCoin = new SplitCoinHelper(amount, this.txb).getAmountInput().reduce((a, b) => a + b, 0);
    let stakeSpoolAccount;
    if (!this.isCreateStakeAccountTransaction()) {
      stakeSpoolAccount = this.helperStake.decodeOwnedObjectId(1);
    }
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.SupplyAndStakeLending,
      intentionData: {
        amount: amountFromSplitCoin,
        coinName,
        stakeAccountId: stakeSpoolAccount,
      },
    };
  }

  private decodeUnstakeAndWithdraw(): DecodeResult {
    const stakeAccountWithAmount: { id: string; coin: number }[] = [];
    this.helperUnstakes.forEach((tx) => {
      const stakeAccountId = tx.decodeOwnedObjectId(1);
      const amount = tx.decodeInputU64(2);
      stakeAccountWithAmount.push({ id: stakeAccountId, coin: amount });
    });
    const coinName = this._builder.utils.parseCoinNameFromType(this.helperRedeems[0].typeArg(0));
    const findWithdrawWithNested = this.helperRedeems.find((tx) => tx.isHaveNestedInput(2));
    let amount;
    if (findWithdrawWithNested) {
      amount = new SplitCoinHelper(findWithdrawWithNested.getNestedInputParam<SplitCoinsTransaction>(2), this.txb)
        .getAmountInput()
        .reduce((a, b) => a + b, 0);
    }

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.WithdrawAndUnstakeLending,
      intentionData: {
        amount,
        coinName,
        stakeAccountId: stakeAccountWithAmount,
      },
    };
  }

  private decodeClaimReward(): DecodeResult {
    const lendingReward: {
      stakeMarketCoinName: SupportStakeMarketCoins;
      stakeAccountId: string;
    }[] = [];
    const borrowRewardV2: {
      obligationId: string;
      obligationKey: string;
      rewardCoinName: SupportBorrowIncentiveRewardCoins;
    }[] = [];

    const borrowReward: {
      obligationId: string;
      obligationKey: string;
      rewardCoinName: SupportBorrowIncentiveRewardCoins;
    }[] = [];

    this.helperClaimLendingReward.forEach((tx) => {
      const stakeAccountId = tx.decodeOwnedObjectId(2);
      const stakeMarketCoinName = tx.typeArg(0);
      const coinName = this._builder.utils.parseCoinNameFromType(stakeMarketCoinName);
      lendingReward.push({ stakeMarketCoinName: coinName as SupportStakeMarketCoins, stakeAccountId });
    });

    this.helperClaimBorrowV2Reward.forEach((tx) => {
      const obligationKey = tx.decodeSharedObjectId(3);
      const obligationId = tx.decodeOwnedObjectId(4);
      const rewardCoinName = this._builder.utils.parseCoinNameFromType(
        tx.typeArg(0),
      ) as SupportBorrowIncentiveRewardCoins;
      borrowRewardV2.push({ obligationId, obligationKey, rewardCoinName });
    });

    this.helperClaimBorrowReward.forEach((tx) => {
      const obligationKey = tx.decodeSharedObjectId(2);
      const obligationId = tx.decodeOwnedObjectId(3);
      const rewardCoinName = this._builder.utils.parseCoinNameFromType(
        tx.typeArg(0),
      ) as SupportBorrowIncentiveRewardCoins;
      borrowReward.push({ obligationId, obligationKey, rewardCoinName });
    });

    return {
      txType: TransactionType.Other,
      type: TransactionSubType.ClaimIncentiveReward,
      intentionData: {
        lendingIncentive: lendingReward,
        borrowIncentiveV2: borrowRewardV2,
        borrowIncentive: borrowReward,
      },
    };
  }
}
