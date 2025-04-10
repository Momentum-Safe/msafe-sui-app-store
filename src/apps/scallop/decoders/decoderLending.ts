import { TransactionType } from '@msafe/sui3-utils';
import { OLD_BORROW_INCENTIVE_PROTOCOL_ID } from '@scallop-io/sui-scallop-sdk';

import { Decoder } from './decoder';
import { SplitCoinTransactionType } from '../types/sui';
import { DecodeResult, TransactionSubType } from '../types/utils';
import { MoveCallHelper, SplitCoinHelper } from '../utils';

export class DecoderLending extends Decoder {
  decode() {
    // if (this.isMoveAsset()) {
    //   return this.decodeMoveAsset();
    // }
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
    if (this.isRepayWithBoostTransaction()) {
      return this.decodeRepayWithBoost();
    }
    if (this.isRepayTransaction()) {
      return this.decodeRepay();
    }
    if (this.isUnstakeSpoolTransaction()) {
      return this.decodeUnstakeSpool();
    }
    if (this.isMigrateAndClaim()) {
      return this.decodeMigrateAndClaim();
    }
    if (this.isClaimRewardTransaction()) {
      return this.decodeClaimReward();
    }
    if (this.isOpenObligationTransaction()) {
      return this.decodeOpenObligation();
    }
    if (this.isMigrateScoinTransaction()) {
      return this.decodeMigrateScoin();
    }
    return undefined;
  }

  private isMigrateScoinTransaction() {
    return this.hasMoveCallCommand(`${this.coreId.scoin}::s_coin_converter::mint_s_coin`);
  }

  private isSupplyLendingTransaction() {
    return this.hasMoveCallCommand(`${this.coreId.protocolPkg}::mint::mint`);
  }

  private isSupplyWithStakeSpoolTransaction() {
    const supplyMoveCall = this.hasMoveCallCommand(`${this.coreId.protocolPkg}::mint::mint`);
    const stakeMoveCall = this.hasMoveCallCommand(`${this.coreId.spoolPkg}::user::stake`);
    return supplyMoveCall && stakeMoveCall;
  }

  private isUnstakeAndWithdrawTransaction() {
    const unstakeMoveCall = this.hasMoveCallCommand(`${this.coreId.spoolPkg}::user::unstake`);
    const withdrawMoveCall = this.hasMoveCallCommand(`${this.coreId.protocolPkg}::redeem::redeem`);
    return unstakeMoveCall && withdrawMoveCall;
  }

  private isStakeSpoolTransaction() {
    return this.hasMoveCallCommand(`${this.coreId.spoolPkg}::user::stake`);
  }

  private isWithdrawLendingTransaction() {
    return this.hasMoveCallCommand(`${this.coreId.protocolPkg}::redeem::redeem`);
  }

  private isWithdrawLendingScoinTransaction() {
    const redeem = this.hasMoveCallCommand(`${this.coreId.protocolPkg}::redeem::redeem`);
    const burnScoin = this.hasMoveCallCommand(`${this.coreId.scoin}::s_coin_converter::burn_s_coin`);
    return redeem && burnScoin;
  }

  private isDepositCollateralTransaction() {
    return this.hasMoveCallCommand(`${this.coreId.protocolPkg}::deposit_collateral::deposit_collateral`);
  }

  private isWithdrawCollateralTransaction() {
    return this.hasMoveCallCommand(`${this.coreId.protocolPkg}::withdraw_collateral::withdraw_collateral`);
  }

  private isBorrowTransaction() {
    return this.hasMoveCallCommand(`${this.coreId.protocolPkg}::borrow::borrow`);
  }

  private isBorrowWithBoostTransaction() {
    const borrowMoveCall = this.hasMoveCallCommand(`${this.coreId.protocolPkg}::borrow::borrow`);
    const stakeMoveCall = this.hasMoveCallCommand(`${this.coreId.borrowIncentivePkg}::user::stake_with_ve_sca`);
    return borrowMoveCall && stakeMoveCall;
  }

  private isBorrowWithReferralTransaction() {
    return this.hasMoveCallCommand(`${this.coreId.protocolPkg}::borrow::borrow_with_referral`);
  }

  private isRepayTransaction() {
    return this.hasMoveCallCommand(`${this.coreId.protocolPkg}::repay::repay`);
  }

  private isRepayWithBoostTransaction() {
    const repayMoveCall = this.hasMoveCallCommand(`${this.coreId.protocolPkg}::repay::repay`);
    const stakeMoveCall = this.hasMoveCallCommand(`${this.coreId.borrowIncentivePkg}::user::stake_with_ve_sca`);
    return repayMoveCall && stakeMoveCall;
  }

  private isUnstakeSpoolTransaction() {
    return this.hasMoveCallCommand(`${this.coreId.spoolPkg}::user::unstake`);
  }

  private isCreateStakeAccountTransaction() {
    return this.hasMoveCallCommand(`${this.coreId.spoolPkg}::user::new_spool_account`);
  }

  private isClaimRewardTransaction() {
    const lendingIncentive = this.hasMoveCallCommand(`${this.coreId.spoolPkg}::user::redeem_rewards`);
    const borrowIncentiveV2 = this.hasMoveCallCommand(`${this.coreId.borrowIncentivePkg}::user::redeem_rewards`);
    return lendingIncentive || borrowIncentiveV2;
  }

  private isOpenObligationTransaction() {
    return this.hasMoveCallCommand(`${this.coreId.protocolPkg}::open_obligation::open_obligation`);
  }

  private isMigrateAndClaim() {
    const oldBorrowIncentive = this.hasMoveCallCommand(`${OLD_BORROW_INCENTIVE_PROTOCOL_ID}::user::redeem_rewards`);
    const stakeWithVeSca = this.hasMoveCallCommand(`${this.coreId.borrowIncentivePkg}::user::stake_with_ve_sca`);
    const stakeWithoutVesca = this.hasMoveCallCommand(`${this.coreId.borrowIncentivePkg}::user::stake`);
    return oldBorrowIncentive && (stakeWithVeSca || stakeWithoutVesca);
  }

  private get helperClaimLendingReward() {
    const moveCalls = this.commands
      .filter((command) => this.filterMoveCallCommands(command, `${this.coreId.spoolPkg}::user::redeem_rewards`))
      .map((command) => new MoveCallHelper(command, this.transaction));
    return moveCalls;
  }

  private get helperClaimBorrowV2Reward() {
    const moveCalls = this.commands
      .filter((command) =>
        this.filterMoveCallCommands(command, `${this.coreId.borrowIncentivePkg}::user::redeem_rewards`),
      )
      .map((command) => new MoveCallHelper(command, this.transaction));
    return moveCalls;
  }

  private get helperStakeObligationWithVeSca() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.borrowIncentivePkg}::user::stake_with_ve_sca`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperClaimBorrowReward() {
    const moveCalls = this.commands
      .filter((command) =>
        this.filterMoveCallCommands(command, `${OLD_BORROW_INCENTIVE_PROTOCOL_ID}::user::redeem_rewards`),
      )
      .map((command) => new MoveCallHelper(command, this.transaction));
    return moveCalls;
  }

  private get helperMint() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.protocolPkg}::mint::mint`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperUnstakes() {
    const moveCalls = this.commands
      .filter((command) => this.filterMoveCallCommands(command, `${this.coreId.spoolPkg}::user::unstake`))
      .map((command) => new MoveCallHelper(command, this.transaction));
    return moveCalls;
  }

  private get helperRedeems() {
    const moveCalls = this.commands
      .filter((command) => this.filterMoveCallCommands(command, `${this.coreId.protocolPkg}::redeem::redeem`))
      .map((command) => new MoveCallHelper(command, this.transaction));
    return moveCalls;
  }

  private get helperRedeem() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.protocolPkg}::redeem::redeem`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperBurnScoin() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.scoin}::s_coin_converter::burn_s_coin`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  // private get helperSlippage() {
  //   const moveCall = this.commands.find((command) =>
  //     this.filterMoveCallCommands(
  //       command,
  //       `0x5857d185897aaff40ae37b2eecc895efc1a9dff1b210c4fb894eabbce4ac2603::slippage_check::check_slippage`,
  //     ),
  //   );
  //   return new MoveCallHelper(moveCall, this.transaction);
  // }

  private get helperStake() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.spoolPkg}::user::stake`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperUnstake() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.spoolPkg}::user::unstake`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperDepositCollateral() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.protocolPkg}::deposit_collateral::deposit_collateral`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperWithdrawCollateral() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.protocolPkg}::withdraw_collateral::withdraw_collateral`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperBorrow() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.protocolPkg}::borrow::borrow`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperBorrowWithReferral() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.protocolPkg}::borrow::borrow_with_referral`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
  }

  private get helperRepay() {
    const moveCall = this.commands.find((command) =>
      this.filterMoveCallCommands(command, `${this.coreId.protocolPkg}::repay::repay`),
    );
    return new MoveCallHelper(moveCall, this.transaction);
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
    const obligationKey = this.helperClaimBorrowReward[0].decodeOwnedObjectId(2);
    const obligationId = this.helperClaimBorrowReward[0].decodeSharedObjectId(3);
    const rewardCoinName = this.utils.parseCoinNameFromType(this.helperClaimBorrowReward[0].typeArg(0));
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

  // @TODO: Decode from event rather than from transaction block
  private decodeSupplyLending(): DecodeResult {
    const coinName = this.utils.parseCoinNameFromType(this.helperMint.typeArg(0));
    const amount = this.helperMint.getNestedInputParam<SplitCoinTransactionType>(2);
    const amountFromSplitCoin = new SplitCoinHelper(amount, this.transaction)
      .getAmountInput()
      .reduce((a, b) => a + b, 0);
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
    const coinName = this.utils.parseCoinNameFromType(this.helperRedeem.typeArg(0));
    const amount = this.helperRedeem.getNestedInputParam<SplitCoinTransactionType>(2);
    const amountFromSplitCoin = new SplitCoinHelper(amount, this.transaction)
      .getAmountInput()
      .reduce((a, b) => a + b, 0);
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
    const coinName = this.utils.parseCoinNameFromType(this.helperRedeem.typeArg(0));
    console.log({ coinName });
    const amount = this.helperBurnScoin.getNestedInputParam<SplitCoinTransactionType>(1);
    const amountFromSplitCoin = new SplitCoinHelper(amount, this.transaction)
      .getAmountInput()
      .reduce((a, b) => a + b, 0);
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
    const coinName = this.utils.parseCoinNameFromType(this.helperDepositCollateral.typeArg(0));
    const amount = this.helperDepositCollateral.getNestedInputParam<SplitCoinTransactionType>(3);
    const amountFromSplitCoin = new SplitCoinHelper(amount, this.transaction)
      .getAmountInput()
      .reduce((a, b) => a + b, 0);
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
    const coinName = this.utils.parseCoinNameFromType(this.helperWithdrawCollateral.typeArg(0));
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
    const coinName = this.utils.parseCoinNameFromType(this.helperBorrow.typeArg(0));
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
    const coinName = this.utils.parseCoinNameFromType(this.helperBorrow.typeArg(0));
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
    const coinName = this.utils.parseCoinNameFromType(this.helperBorrowWithReferral.typeArg(0));
    let veScaKey;
    if (this.helperStakeObligationWithVeSca.moveCall) {
      veScaKey = this.helperStakeObligationWithVeSca.decodeOwnedObjectId(9);
    }
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
    const coinName = this.utils.parseCoinNameFromType(this.helperRepay.typeArg(0));
    const amount = this.helperRepay.getNestedInputParam<SplitCoinTransactionType>(3);
    const amountFromSplitCoin = new SplitCoinHelper(amount, this.transaction)
      .getAmountInput()
      .reduce((a, b) => a + b, 0);
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

  private decodeRepayWithBoost(): DecodeResult {
    const coinName = this.utils.parseCoinNameFromType(this.helperRepay.typeArg(0));
    const veScaKey = this.helperStakeObligationWithVeSca.decodeOwnedObjectId(9);
    const amount = this.helperRepay.getNestedInputParam<SplitCoinTransactionType>(3);
    const amountFromSplitCoin = new SplitCoinHelper(amount, this.transaction)
      .getAmountInput()
      .reduce((a, b) => a + b, 0);
    const obligationId = this.helperRepay.decodeSharedObjectId(1);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.RepayWithBoost,
      intentionData: {
        amount: amountFromSplitCoin,
        obligationId,
        coinName,
        veScaKey,
      },
    };
  }

  private decodeStakeSpool(): DecodeResult {
    let stakeSpoolAccount;
    if (!this.isCreateStakeAccountTransaction()) {
      stakeSpoolAccount = this.helperStake.decodeOwnedObjectId(1);
    }
    let amountFromSplitCoin = 0;
    if (this.helperBurnScoin.moveCall) {
      const amount = this.helperBurnScoin.getNestedInputParam<SplitCoinTransactionType>(1);
      amountFromSplitCoin = new SplitCoinHelper(amount, this.transaction).getAmountInput().reduce((a, b) => a + b, 0);
    }
    if (this.helperStake.moveCall && amountFromSplitCoin === 0) {
      const amount = this.helperStake.getNestedInputParam<SplitCoinTransactionType>(2);
      amountFromSplitCoin = new SplitCoinHelper(amount, this.transaction).getAmountInput().reduce((a, b) => a + b, 0);
    }
    const coinType = this.helperStake.typeArg(0);
    const coinName = this.utils.parseCoinNameFromType(coinType);
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
    const coinName = this.utils.parseCoinNameFromType(coinType);
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
    const coinName = this.utils.parseCoinNameFromType(this.helperMint.typeArg(0));
    const amount = this.helperMint.getNestedInputParam<SplitCoinTransactionType>(2);
    const amountFromSplitCoin = new SplitCoinHelper(amount, this.transaction)
      .getAmountInput()
      .reduce((a, b) => a + b, 0);
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
    const coinName = this.utils.parseCoinNameFromType(this.helperRedeems[0].typeArg(0));
    let amountFromSplitCoin = 0;
    if (this.helperBurnScoin.moveCall) {
      const amount = this.helperBurnScoin.getNestedInputParam<SplitCoinTransactionType>(1);
      amountFromSplitCoin = new SplitCoinHelper(amount, this.transaction).getAmountInput().reduce((a, b) => a + b, 0);
    }
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.WithdrawAndUnstakeLending,
      intentionData: {
        amount: amountFromSplitCoin,
        coinName,
        stakeAccountId: stakeAccountWithAmount,
      },
    };
  }

  // private decodeMoveAsset(): DecodeResult {
  //   const stakeAccountWithAmount: { id: string; coin: number }[] = [];
  //   this.helperUnstakes.forEach((tx) => {
  //     const stakeAccountId = tx.decodeOwnedObjectId(1);
  //     const amount = tx.decodeInputU64(2);
  //     stakeAccountWithAmount.push({ id: stakeAccountId, coin: amount });
  //   });
  //   const coinName = this.utils.parseCoinNameFromType(this.helperRedeems[0].typeArg(0));
  //   let amountFromSplitCoin = 0;
  //   if (this.helperBurnScoin.moveCall) {
  //     const amount = this.helperBurnScoin.getNestedInputParam<SplitCoinTransactionType>(1);
  //     amountFromSplitCoin = new SplitCoinHelper(amount, this.transaction).getAmountInput().reduce((a, b) => a + b, 0);
  //   }
  //   const slippage = this.helperSlippage.decodePureArg(1, 'U64');
  //   const validSwapAmount = this.helperSlippage.decodePureArg(2, 'String');

  //   return {
  //     txType: TransactionType.Other,
  //     type: TransactionSubType.MigrateWusdcToUsdc,
  //     intentionData: {
  //       amount: amountFromSplitCoin,
  //       coinName,
  //       slippage,
  //       validSwapAmount,
  //       stakeAccountId: stakeAccountWithAmount,
  //     },
  //   };
  // }

  private decodeClaimReward(): DecodeResult {
    const lendingReward: {
      stakeMarketCoinName: string;
      stakeAccountId: string;
    }[] = [];
    const borrowRewardV2: {
      obligationId: string;
      obligationKey: string;
      rewardCoinName: string;
    }[] = [];

    const borrowReward: {
      obligationId: string;
      obligationKey: string;
      rewardCoinName: string;
    }[] = [];

    this.helperClaimLendingReward.forEach((tx) => {
      const stakeAccountId = tx.decodeOwnedObjectId(2);
      const stakeMarketCoinName = tx.typeArg(0);
      const coinName = this.utils.parseCoinNameFromType(stakeMarketCoinName);
      lendingReward.push({ stakeMarketCoinName: coinName as string, stakeAccountId });
    });

    this.helperClaimBorrowV2Reward.forEach((tx) => {
      const obligationKey = tx.decodeSharedObjectId(4);
      const obligationId = tx.decodeOwnedObjectId(3);
      const rewardCoinName = this.utils.parseCoinNameFromType(tx.typeArg(0));
      borrowRewardV2.push({ obligationId, obligationKey, rewardCoinName });
    });

    this.helperClaimBorrowReward.forEach((tx) => {
      const obligationKey = tx.decodeSharedObjectId(2);
      const obligationId = tx.decodeOwnedObjectId(3);
      const rewardCoinName = this.utils.parseCoinNameFromType(tx.typeArg(0));
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
