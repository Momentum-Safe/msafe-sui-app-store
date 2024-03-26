import type { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock, TransactionResult } from '@mysten/sui.js/transactions';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';

import { ScallopAddress } from './scallopAddress';
import { ScallopBuilder } from './scallopBuilder';
import { ScallopQuery } from './scallopQuery';
import { ScallopUtils } from './scallopUtils';
import { generateBorrowIncentiveQuickMethod } from '../builders/borrowIncentiveBuilder';
import { generateCoreQuickMethod } from '../builders/coreBuilder';
import { generateSpoolQuickMethod } from '../builders/spoolBuilder';
import { generateQuickVeScaMethod } from '../builders/vescaBuilder';
import { ADDRESSES_ID, SUPPORT_BORROW_INCENTIVE_POOLS, SUPPORT_BORROW_INCENTIVE_REWARDS } from '../constants';
import type {
  ScallopInstanceParams,
  ScallopClientParams,
  SupportPoolCoins,
  SupportCollateralCoins,
  SupportStakeMarketCoins,
  SupportBorrowIncentiveCoins,
} from '../types';

/**
 * @description
 * It provides contract interaction operations for general users.
 *
 * @example
 * ```typescript
 * const scallopClient  = new ScallopClient(<parameters>);
 * await scallopClient.init();
 * scallopClient.<client functions>();
 * await scallopClient.<client async functions>();
 * ```
 */
export class ScallopClient {
  public readonly params: ScallopClientParams;

  public client: SuiClient;

  public address: ScallopAddress;

  public builder: ScallopBuilder;

  public query: ScallopQuery;

  public utils: ScallopUtils;

  public walletAddress: string;

  public constructor(params: ScallopClientParams, instance?: ScallopInstanceParams) {
    this.params = params;
    this.client = params.client;
    this.address =
      instance?.address ??
      new ScallopAddress({
        id: params?.addressesId || ADDRESSES_ID,
        network: params?.networkType,
      });
    this.query =
      instance?.query ??
      new ScallopQuery(params, {
        address: this.address,
      });
    this.utils =
      instance?.utils ??
      new ScallopUtils(params, {
        address: this.address,
        query: this.query,
      });
    this.builder =
      instance?.builder ??
      new ScallopBuilder(params, {
        address: this.address,
        query: this.query,
        utils: this.utils,
      });
    this.walletAddress = normalizeSuiAddress(params.walletAddress);
  }

  /**
   * Request the scallop API to initialize data.
   *
   * @param force - Whether to force initialization.
   */
  public async init(force = false) {
    if (force || !this.address.getAddresses()) {
      await this.address.read();
    }

    await this.builder.init(force, this.address);
    await this.query.init(force, this.address);
    await this.utils.init(force, this.address);
  }

  /* ==================== Query Method ==================== */

  /**
   * Get obligations data.
   *
   * @description
   * This method might be @deprecated in the future, please use the {@link ScallopQuery} query instance instead.
   *
   * @param ownerAddress - The owner address.
   * @return Obligations data.
   */
  public async getObligations(ownerAddress?: string) {
    const owner = ownerAddress || this.walletAddress;
    return this.query.getObligations(owner);
  }

  /**
   * Query all stake accounts data.
   *
   * @description
   * This method might be @deprecated in the future, please use the {@link ScallopQuery} query instance instead.
   *
   * @param ownerAddress - The owner address.
   * @return All stake accounts data.
   */
  async getAllStakeAccounts(ownerAddress?: string) {
    const owner = ownerAddress || this.walletAddress;
    return this.query.getAllStakeAccounts(owner);
  }

  /**
   * Query stake account data.
   *
   * @description
   * This method might be @deprecated in the future, please use the {@link ScallopQuery} query instance instead.
   *
   * @param stakeMarketCoinName - Support stake market coin.
   * @param ownerAddress - The owner address.
   * @return Stake accounts data.
   */
  async getStakeAccounts(stakeMarketCoinName: SupportStakeMarketCoins, ownerAddress?: string) {
    const owner = ownerAddress || this.walletAddress;
    return this.query.getStakeAccounts(stakeMarketCoinName, owner);
  }

  /**
   * Query stake pool data.
   *
   * @description
   * This method might be @deprecated in the future, please use the {@link ScallopQuery} query instance instead.
   *
   * @param stakeMarketCoinName - Support stake market coin.
   * @return Stake pool data.
   */
  async getStakePool(stakeMarketCoinName: SupportStakeMarketCoins) {
    return this.query.getStakePool(stakeMarketCoinName);
  }

  /**
   * Query reward pool data.
   *
   * @description
   * This method might be @deprecated in the future, please use the {@link ScallopQuery} query instance instead.
   *
   * @param stakeMarketCoinName - Support stake market coin.
   * @return Reward pool data.
   */
  async getStakeRewardPool(stakeMarketCoinName: SupportStakeMarketCoins) {
    return this.query.getStakeRewardPool(stakeMarketCoinName);
  }

  /* ==================== Core Method ==================== */

  /**
   * Open obligation.
   *
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @return Transaction block response or transaction block.
   */
  public async openObligation(walletAddress?: string): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const coreQuickMethod = generateCoreQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);
    coreQuickMethod.normalMethod.openObligationEntry();
    return txBlock;
  }

  /**
   * Deposit collateral into the specific pool.
   *
   * @param collateralCoinName - Types of collateral coin.
   * @param amount - The amount of coins would deposit.
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @param obligationId - The obligation object.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async depositCollateral(
    collateralCoinName: SupportCollateralCoins,
    amount: number,
    obligationId?: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);
    const quickMethod = generateCoreQuickMethod({ builder: this.builder, txBlock });

    const obligations = await this.query.getObligations(sender);
    const specificObligationId = obligationId || obligations?.[0]?.id;
    if (specificObligationId) {
      await quickMethod.addCollateralQuick(amount, collateralCoinName, specificObligationId);
    } else {
      const [obligation, obligationKey, hotPotato] = quickMethod.normalMethod.openObligation();
      await quickMethod.addCollateralQuick(amount, collateralCoinName, obligation);
      quickMethod.normalMethod.returnObligation(obligation, hotPotato);
      txBlock.transferObjects([obligationKey], sender);
    }
    return txBlock;
  }

  /**
   * Withdraw collateral from the specific pool.
   *
   * @param collateralCoinName - Types of collateral coin.
   * @param amount - The amount of coins would deposit.
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @param obligationId - The obligation object.
   * @param obligationKey - The obligation key object to verifying obligation authority.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async withdrawCollateral(
    collateralCoinName: SupportCollateralCoins,
    amount: number,
    obligationId: string,
    obligationKey: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const quickMethod = generateCoreQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    const collateralCoin = await quickMethod.takeCollateralQuick(
      amount,
      collateralCoinName,
      obligationId,
      obligationKey,
    );
    txBlock.transferObjects([collateralCoin], sender);
    return txBlock;
  }

  /**
   * Deposit asset into the specific pool.
   *
   * @param poolCoinName - Types of pool coin.
   * @param amount - The amount of coins would deposit.
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async deposit(
    poolCoinName: SupportPoolCoins,
    amount: number,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const quickMethod = generateCoreQuickMethod({
      builder: this.builder,
      txBlock,
    });
    const sender = walletAddress || this.walletAddress;
    txBlock.splitCoins(txBlock.gas, [amount]);
    txBlock.setSender(sender);

    const marketCoin = await quickMethod.depositQuick(amount, poolCoinName, walletAddress);
    txBlock.transferObjects([marketCoin], sender);
    return txBlock;
  }

  /**
   * Withdraw asset from the specific pool, must return market coin.
   *
   * @param poolCoinName - Specific support pool coin name.
   * @param amount - The amount of coins would withdraw.
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async withdraw(
    poolCoinName: SupportPoolCoins,
    amount: number,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const sender = walletAddress || this.walletAddress;
    const quickMethod = generateCoreQuickMethod({
      builder: this.builder,
      txBlock,
    });
    txBlock.setSender(sender);

    const coin = await quickMethod.withdrawQuick(amount, poolCoinName);
    txBlock.transferObjects([coin], sender);
    return txBlock;
  }

  /**
   * Borrow asset from the specific pool.
   *
   * @param poolCoinName - Specific support pool coin name.
   * @param amount - The amount of coins would borrow.
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @param obligationId - The obligation object.
   * @param obligationKey - The obligation key object to verifying obligation authority.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async borrow(
    poolCoinName: SupportPoolCoins,
    amount: number,
    obligationId: string,
    obligationKey: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const quickMethod = generateCoreQuickMethod({ builder: this.builder, txBlock });
    const borrowIncentiveQuickMethod = generateBorrowIncentiveQuickMethod({
      builder: this.builder,
      txBlock,
    });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    const availableStake = (SUPPORT_BORROW_INCENTIVE_POOLS as readonly SupportPoolCoins[]).includes(poolCoinName);
    if (availableStake) {
      await borrowIncentiveQuickMethod.unstakeObligationQuick(obligationId, obligationKey);
    }
    const coin = await quickMethod.borrowQuick(amount, poolCoinName, obligationId, obligationKey);
    txBlock.transferObjects([coin], sender);
    if (availableStake) {
      await borrowIncentiveQuickMethod.stakeObligationQuick(obligationId, obligationKey);
    }
    return txBlock;
  }

  /**
   * Borrow asset from the specific pool with boost from SCA stake.
   *
   * @param poolCoinName - Specific support pool coin name.
   * @param amount - The amount of coins would borrow.
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @param obligationId - The obligation object.
   * @param obligationKey - The obligation key object to verifying obligation authority.
   * @param vescaKey - The vesca key object to verifying sca staker.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async borrowWithBoost(
    poolCoinName: SupportPoolCoins,
    amount: number,
    obligationId: string,
    obligationKey: string,
    vescaKey: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const quickMethod = generateCoreQuickMethod({ builder: this.builder, txBlock });
    const borrowIncentiveQuickMethod = generateBorrowIncentiveQuickMethod({
      builder: this.builder,
      txBlock,
    });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    const availableStake = (SUPPORT_BORROW_INCENTIVE_POOLS as readonly SupportPoolCoins[]).includes(poolCoinName);
    if (availableStake) {
      await borrowIncentiveQuickMethod.unstakeObligationQuick(obligationId, obligationKey);
    }
    const coin = await quickMethod.borrowQuick(amount, poolCoinName, obligationId, obligationKey);
    txBlock.transferObjects([coin], sender);
    if (availableStake) {
      await borrowIncentiveQuickMethod.stakeObligationWithVeScaQuick(obligationId, obligationKey, vescaKey);
    }
    return txBlock;
  }

  /**
   * Repay asset into the specific pool.
   *
   * @param poolCoinName - Specific support pool coin name.
   * @param amount - The amount of coins would repay.
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @param obligationId - The obligation object.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async repay(
    poolCoinName: SupportPoolCoins,
    amount: number,
    obligationId: string,
    obligationKey: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const quickMethod = generateCoreQuickMethod({ builder: this.builder, txBlock });
    const borrowIncentiveQuickMethod = generateBorrowIncentiveQuickMethod({
      builder: this.builder,
      txBlock,
    });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    const availableStake = (SUPPORT_BORROW_INCENTIVE_POOLS as readonly SupportPoolCoins[]).includes(poolCoinName);
    if (availableStake) {
      await borrowIncentiveQuickMethod.unstakeObligationQuick(obligationId, obligationKey);
    }
    await quickMethod.repayQuick(amount, poolCoinName, obligationId);
    if (availableStake) {
      await borrowIncentiveQuickMethod.stakeObligationQuick(obligationId, obligationKey);
    }
    return txBlock;
  }

  /* ==================== Spool Method ==================== */

  /**
   * Create stake account.
   *
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async createStakeAccount(
    marketCoinName: SupportStakeMarketCoins,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const spoolQuickMethod = generateSpoolQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    const stakeAccount = spoolQuickMethod.normalMethod.createStakeAccount(marketCoinName);
    txBlock.transferObjects([stakeAccount], sender);
    return txBlock;
  }

  /**
   * Stake market coin into the specific spool.
   *
   * @param marketCoinName - Types of market coin.
   * @param amount - The amount of coins would deposit.
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @param stakeAccountId - The stake account object.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async stake(
    stakeMarketCoinName: SupportStakeMarketCoins,
    amount: number,
    stakeAccountId?: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const spoolQuickMethod = generateSpoolQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    const stakeAccounts = await this.query.getStakeAccounts(stakeMarketCoinName, sender);
    const targetStakeAccount = stakeAccountId || stakeAccounts[0].id;
    if (targetStakeAccount) {
      await spoolQuickMethod.stakeQuick(amount, stakeMarketCoinName, targetStakeAccount);
    } else {
      const account = spoolQuickMethod.normalMethod.createStakeAccount(stakeMarketCoinName);
      await spoolQuickMethod.stakeQuick(amount, stakeMarketCoinName, account);
      txBlock.transferObjects([account], sender);
    }
    return txBlock;
  }

  /**
   * Unstake market coin from the specific spool.
   *
   * @param stakeMarketCoinName - Types of mak coin.
   * @param amount - The amount of coins would deposit.
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @param accountId - The stake account object.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async unstake(
    stakeMarketCoinName: SupportStakeMarketCoins,
    amount: number,
    stakeAccountId?: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const spoolQuickMethod = generateSpoolQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    const marketCoins = await spoolQuickMethod.unstakeQuick(amount, stakeMarketCoinName, stakeAccountId);
    txBlock.transferObjects(marketCoins, sender);
    return txBlock;
  }

  /**
   * Claim reward coin from the specific spool.
   *
   * @param stakeMarketCoinName - Types of mak coin.
   * @param amount - The amount of coins would deposit.
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @param accountId - The stake account object.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async claim(
    stakeMarketCoinName: SupportStakeMarketCoins,
    stakeAccountId?: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const spoolQuickMethod = generateSpoolQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    const rewardCoins = await spoolQuickMethod.claimQuick(stakeMarketCoinName, stakeAccountId);
    txBlock.transferObjects(rewardCoins, sender);
    return txBlock;
  }

  /* ==================== Borrow Incentive Method ==================== */

  /**
   * stake obligaion.
   *
   * @param obligationId - The obligation account object.
   * @param obligationKeyId - The obligation key account object.
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block
   */
  public async stakeObligation(
    obligationId: string,
    obligationKeyId: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = this.builder.createTxBlock();
    const borrowIncentiveQuickMethod = generateBorrowIncentiveQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    await borrowIncentiveQuickMethod.stakeObligationQuick(obligationId, obligationKeyId);
    return txBlock;
  }

  /**
   * unstake obligaion.
   *
   * @param obligationId - The obligation account object.
   * @param obligationKeyId - The obligation key account object.
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block
   */
  public async unstakeObligation(
    obligationId: string,
    obligationKeyId: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = this.builder.createTxBlock();
    const borrowIncentiveQuickMethod = generateBorrowIncentiveQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    await borrowIncentiveQuickMethod.unstakeObligationQuick(obligationId, obligationKeyId);
    return txBlock;
  }

  /**
   * unstake market coin from the specific spool.
   *
   * @param marketCoinName - Types of mak coin.
   * @param amount - The amount of coins would deposit.
   * @param sign - Decide to directly sign the transaction or return the transaction block.
   * @param accountId - The stake account object.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block
   */
  public async claimBorrowIncentive(
    coinName: SupportBorrowIncentiveCoins,
    obligationId: string,
    obligationKeyId: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const borrowIncentiveQuickMethod = generateBorrowIncentiveQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    const rewardCoins: TransactionResult[] = [];
    SUPPORT_BORROW_INCENTIVE_REWARDS.forEach(async (rewardCoinName) => {
      const rewardCoin = await borrowIncentiveQuickMethod.claimBorrowIncentiveQuick(
        coinName,
        rewardCoinName,
        obligationId,
        obligationKeyId,
      );
      rewardCoins.push(rewardCoin);
    });
    txBlock.transferObjects(rewardCoins, sender);
    return txBlock;
  }

  /**
   * Stake SCA.
   *
   * @param amount - Types of mak coin.
   * @param lockPeriod - The amount of coins would deposit.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async stakeSca(amount: number, lockPeriod: number, walletAddress?: string): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const vescaQuickMethod = generateQuickVeScaMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    await vescaQuickMethod.lockScaQuick(amount, lockPeriod);
    return txBlock;
  }

  /**
   * Stake more SCA.
   *
   * @param amount - Types of mak coin.
   * @param vescaKey - The vesca key object.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async stakeMoreSca(amount: number, vescaKey?: string, walletAddress?: string): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const vescaQuickMethod = generateQuickVeScaMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    await vescaQuickMethod.extendLockAmountQuick(amount, vescaKey);
    return txBlock;
  }

  /**
   * Extend stake lock period.
   *
   * @param lockPeriodInDays
   * @param vescaKey
   * @param walletAddress
   * @returns Transaction block response or transaction block.
   */
  public async extendStakeScaLockPeriod(
    lockPeriodInDays: number,
    vescaKey?: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const vescaQuickMethod = generateQuickVeScaMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    await vescaQuickMethod.extendLockPeriodQuick(lockPeriodInDays, vescaKey);
    return txBlock;
  }

  /**
   * Renew expired stake SCA.
   *
   * @param amount
   * @param lockPeriodInDays
   * @param vescaKey
   * @param walletAddress
   * @returns Transaction block response or transaction block.
   */
  public async renewExpiredStakeSca(
    amount: number,
    lockPeriodInDays: number,
    vescaKey?: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const vescaQuickMethod = generateQuickVeScaMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    await vescaQuickMethod.renewExpiredVeScaQuick(amount, lockPeriodInDays, vescaKey);
    return txBlock;
  }

  /**
   * Withdraw unlocked SCA.
   *
   * @param vescaKey
   * @param walletAddress
   * @returns Transaction block response or transaction block.
   */
  public async withdrawUnlockedSca(vescaKey?: string, walletAddress?: string): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const vescaQuickMethod = generateQuickVeScaMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    await vescaQuickMethod.redeemScaQuick(vescaKey);
    return txBlock;
  }
}
