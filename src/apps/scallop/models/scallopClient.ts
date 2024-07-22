import type { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock, TransactionResult } from '@mysten/sui.js/transactions';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';
import BigNumber from 'bignumber.js';

import { ScallopAddress } from './scallopAddress';
import { ScallopBuilder } from './scallopBuilder';
import { ScallopQuery } from './scallopQuery';
import { ScallopUtils } from './scallopUtils';
import { generateBorrowIncentiveQuickMethod } from '../builders/borrowIncentiveBuilder';
import { generateCoreQuickMethod } from '../builders/coreBuilder';
import { generateReferralNormalMethod } from '../builders/referralBuilder';
import { generateSpoolQuickMethod } from '../builders/spoolBuilder';
import { generateQuickVeScaMethod } from '../builders/vescaBuilder';
import { ADDRESSES_ID, SCA_COIN_TYPE, SUPPORT_BORROW_INCENTIVE_POOLS, SUPPORT_SPOOLS } from '../constants';
import type {
  ScallopInstanceParams,
  ScallopClientParams,
  SupportPoolCoins,
  SupportCollateralCoins,
  SupportStakeMarketCoins,
  BorrowIncentiveParams,
  SpoolIncentiveParams,
  SupportBorrowIncentiveRewardCoins,
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
  public init(force = false) {
    if (force || !this.address.getAddresses()) {
      this.address.read();
    }

    this.builder.init(force, this.address);
    this.query.init(force, this.address);
    this.utils.init(force, this.address);
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
   * @param veScaKey - The vesca key object to verifying sca staker.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async borrowWithBoost(
    poolCoinName: SupportPoolCoins,
    amount: number,
    obligationId: string,
    obligationKey: string,
    veScaKey: string,
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
      await borrowIncentiveQuickMethod.stakeObligationWithVeScaQuick(obligationId, obligationKey, veScaKey);
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
   * @param veScaKey - The vesca key object to verifying sca staker.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async borrowWithReferral(
    poolCoinName: SupportPoolCoins,
    amount: number,
    obligationId: string,
    obligationKey: string,
    veScaKey: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const quickMethod = generateCoreQuickMethod({ builder: this.builder, txBlock });
    const borrowIncentiveQuickMethod = generateBorrowIncentiveQuickMethod({
      builder: this.builder,
      txBlock,
    });
    const referralMethod = generateReferralNormalMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    const availableStake = (SUPPORT_BORROW_INCENTIVE_POOLS as readonly SupportPoolCoins[]).includes(poolCoinName);
    if (availableStake) {
      await borrowIncentiveQuickMethod.unstakeObligationQuick(obligationId, obligationKey);
    }
    const borrowReferral = referralMethod.claimReferralTicket(poolCoinName);
    const coin = await quickMethod.borrowWithReferralQuick(
      amount,
      poolCoinName,
      borrowReferral,
      obligationId,
      obligationKey,
    );
    referralMethod.burnReferralTicket(borrowReferral, poolCoinName);
    txBlock.transferObjects([coin], sender);
    if (availableStake) {
      await borrowIncentiveQuickMethod.stakeObligationWithVeScaQuick(obligationId, obligationKey, veScaKey);
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
    await quickMethod.repayQuick(amount, poolCoinName, obligationId, sender);
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

  public async supplyAndStake(
    poolCoinName: SupportPoolCoins,
    amount: number,
    stakeAccountId: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const quickMethod = generateCoreQuickMethod({
      builder: this.builder,
      txBlock,
    });
    const spoolQuickMethod = generateSpoolQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    const marketCoin = await quickMethod.depositQuick(amount, poolCoinName, walletAddress);
    const stakeMarketCoinName = this.utils.parseMarketCoinName(poolCoinName);
    if (!SUPPORT_SPOOLS.find((coin) => coin === stakeMarketCoinName)) {
      return txBlock;
    }
    const stakeAccounts = await this.query.getStakeAccounts(stakeMarketCoinName as SupportStakeMarketCoins, sender);
    const targetStakeAccount = stakeAccountId || (stakeAccounts.length > 0 ? stakeAccounts[0].id : undefined);
    if (targetStakeAccount) {
      await spoolQuickMethod.stakeQuick(marketCoin, stakeMarketCoinName as SupportStakeMarketCoins, targetStakeAccount);
    } else {
      const account = spoolQuickMethod.normalMethod.createStakeAccount(stakeMarketCoinName as SupportStakeMarketCoins);
      await spoolQuickMethod.stakeQuick(marketCoin, stakeMarketCoinName as SupportStakeMarketCoins, account);
      txBlock.transferObjects([account], sender);
    }
    return txBlock;
  }

  public async unstakeAndWithdraw(
    poolCoinName: SupportPoolCoins,
    amount: number,
    unstakeAccount: { id: string; coin: number }[],
  ) {
    const txBlock = new TransactionBlock();
    const quickMethod = generateCoreQuickMethod({
      builder: this.builder,
      txBlock,
    });
    const spoolQuickMethod = generateSpoolQuickMethod({ builder: this.builder, txBlock });
    const sender = this.walletAddress;
    const withdrawCoins = [];
    txBlock.setSender(sender);
    const stakeMarketCoinName = this.utils.parseMarketCoinName(poolCoinName) as SupportStakeMarketCoins;
    for (let i = 0; i < unstakeAccount.length; i++) {
      const account = unstakeAccount[i];
      const [marketCoin] = await spoolQuickMethod.unstakeQuick(account.coin, stakeMarketCoinName, account.id);
      if (marketCoin) {
        const wdScoin = quickMethod.normalMethod.withdraw(marketCoin, poolCoinName);
        withdrawCoins.push(wdScoin);
      }
    }
    if (amount > 0) {
      const wdCoin = await quickMethod.withdrawQuick(amount, poolCoinName);
      withdrawCoins.push(wdCoin);
    }
    txBlock.transferObjects(withdrawCoins, sender);
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
    const targetStakeAccount = stakeAccountId || (stakeAccounts.length > 0 ? stakeAccounts[0].id : undefined);
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
    lendingIncentive: SpoolIncentiveParams[],
    borrowIncentiveV2: BorrowIncentiveParams[],
    borrowIncentive: BorrowIncentiveParams[],
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const spoolQuickMethod = generateSpoolQuickMethod({ builder: this.builder, txBlock });
    const borrowIncentiveRewarad = generateBorrowIncentiveQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    const rewardCoins: { sui: TransactionResult[]; sca: TransactionResult[] } = {
      sui: [],
      sca: [],
    };

    for (let i = 0; i < lendingIncentive.length; i++) {
      const { stakeMarketCoinName, stakeAccountId } = lendingIncentive[i];
      const rewardCoin = spoolQuickMethod.normalMethod.claim(stakeAccountId, stakeMarketCoinName);
      rewardCoins.sui.push(rewardCoin);
    }

    for (let i = 0; i < borrowIncentiveV2.length; i++) {
      const { obligationId, obligationKey, rewardCoinName } = borrowIncentiveV2[i];
      const rewardCoin = borrowIncentiveRewarad.normalMethod.claimBorrowIncentive(
        obligationId,
        obligationKey,
        rewardCoinName,
      );
      rewardCoins[rewardCoinName].push(rewardCoin);
    }

    for (let i = 0; i < borrowIncentive.length; i++) {
      const { obligationId, obligationKey, rewardCoinName } = borrowIncentive[i];
      const rewardCoin = borrowIncentiveRewarad.normalMethod.oldClaimBorrowIncentive(
        obligationId,
        obligationKey,
        rewardCoinName,
      );
      rewardCoins[rewardCoinName].push(rewardCoin);
    }

    if (rewardCoins.sui.length > 0) {
      if (rewardCoins.sui.length > 1) {
        txBlock.mergeCoins(rewardCoins.sui[0], rewardCoins.sui.slice(1));
      }
      txBlock.transferObjects([rewardCoins.sui[0]], txBlock.pure(sender));
    }

    if (rewardCoins.sca.length > 0) {
      if (rewardCoins.sca.length > 1) {
        txBlock.mergeCoins(rewardCoins.sca[0], rewardCoins.sca.slice(1));
      }
      txBlock.transferObjects([rewardCoins.sca[0]], txBlock.pure(sender));
    }
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
   * Stake SCA.
   *
   * @param amount - Types of mak coin.
   * @param lockPeriod - The amount of coins would deposit.
   * @param walletAddress - The wallet address of the owner.
   * @return Transaction block response or transaction block.
   */
  public async stakeSca(
    amount: number,
    isObligationLocked = false,
    isOldBorrowIncentive = false,
    obligationId?: string,
    obligationKey?: string,
    lockPeriod?: number,
    vescaKey?: string,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const vescaQuickMethod = generateQuickVeScaMethod({ builder: this.builder, txBlock });
    const borrowIncentive = generateBorrowIncentiveQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    // Get all SCA and merge them into one.
    const coins = await this.builder.utils.selectCoinIds(amount, SCA_COIN_TYPE, sender);
    const [takeCoin, leftCoin] = this.builder.utils.takeAmountFromCoins(txBlock, coins, amount);

    let newVescaKey;
    if (!vescaKey) {
      newVescaKey = vescaQuickMethod.normalMethod.lockSca(takeCoin, lockPeriod);
    } else {
      vescaQuickMethod.normalMethod.extendLockAmount(vescaKey, takeCoin);
    }

    if (obligationId && obligationKey) {
      if (isObligationLocked) {
        if (isOldBorrowIncentive) {
          borrowIncentive.normalMethod.oldUnstakeObligation(obligationId, obligationKey);
        } else {
          borrowIncentive.normalMethod.unstakeObligation(obligationId, obligationKey);
        }
      }
      borrowIncentive.normalMethod.stakeObligationWithVesca(obligationId, obligationKey, vescaKey || newVescaKey);
    }

    if (!vescaKey) {
      txBlock.transferObjects([newVescaKey, leftCoin], sender);
    }

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
    // const vescaQuickMethod = generateQuickVeScaMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    // await vescaQuickMethod.extendLockAmountQuick(amount, vescaKey);
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
    vescaKey: string,
    obligationId?: string,
    obligationKey?: string,
    isObligationLocked = false,
    isOldBorrowIncentive = false,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const vescaQuickMethod = generateQuickVeScaMethod({ builder: this.builder, txBlock });
    const borrowIncentive = generateBorrowIncentiveQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    vescaQuickMethod.normalMethod.extendLockPeriod(vescaKey, lockPeriodInDays);
    if (obligationId && obligationKey) {
      if (isObligationLocked) {
        if (isOldBorrowIncentive) {
          borrowIncentive.normalMethod.oldUnstakeObligation(obligationId, obligationKey);
        } else {
          borrowIncentive.normalMethod.unstakeObligation(obligationId, obligationKey);
        }
      }
      borrowIncentive.normalMethod.stakeObligationWithVesca(obligationId, obligationKey, vescaKey);
    }
    return txBlock;
  }

  public async extendPeriodAndStakeMoreSca(
    amount: number,
    vescaKey: string,
    lockPeriodInDays: number,
    obligation?: string,
    obligationKey?: string,
    isObligationLocked = false,
    isOldBorrowIncentive = false,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const vescaQuickMethod = generateQuickVeScaMethod({ builder: this.builder, txBlock });
    const borrowIncentive = generateBorrowIncentiveQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    // Get all SCA and merge them into one.
    const coins = await this.builder.utils.selectCoinIds(amount, SCA_COIN_TYPE, sender);
    const [takeCoin, leftCoin] = this.builder.utils.takeAmountFromCoins(txBlock, coins, amount);
    vescaQuickMethod.normalMethod.extendLockPeriod(vescaKey, lockPeriodInDays);
    vescaQuickMethod.normalMethod.extendLockAmount(vescaKey, takeCoin);
    txBlock.transferObjects([leftCoin], sender);
    if (!obligation || !obligationKey) {
      return txBlock;
    }
    if (isObligationLocked) {
      if (isOldBorrowIncentive) {
        borrowIncentive.normalMethod.oldUnstakeObligation(obligation, obligationKey);
      } else {
        borrowIncentive.normalMethod.unstakeObligation(obligation, obligationKey);
      }
    }
    borrowIncentive.normalMethod.stakeObligationWithVesca(obligation, obligationKey, vescaKey);
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
    vescaKey: string,
    isHaveRedeem = false,
    obligation?: string,
    obligationKey?: string,
    isObligationLocked = false,
    isOldBorrowIncentive = false,
    walletAddress?: string,
  ): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const vescaQuickMethod = generateQuickVeScaMethod({ builder: this.builder, txBlock });
    const borrowIncentive = generateBorrowIncentiveQuickMethod({ builder: this.builder, txBlock });
    const sender = walletAddress || this.walletAddress;
    txBlock.setSender(sender);

    if (isHaveRedeem) {
      const redeem = vescaQuickMethod.normalMethod.redeemSca(vescaKey);
      txBlock.transferObjects([redeem], sender);
    }

    // Get all SCA and merge them into one.
    const coins = await this.builder.utils.selectCoinIds(amount, SCA_COIN_TYPE, sender);
    const [takeCoin, leftCoin] = this.builder.utils.takeAmountFromCoins(txBlock, coins, amount);
    txBlock.transferObjects([leftCoin], sender);
    // renew veSCA
    vescaQuickMethod.normalMethod.renewExpiredVeSca(vescaKey, takeCoin, lockPeriodInDays);
    if (!obligation || !obligationKey) {
      return txBlock;
    }
    if (isObligationLocked) {
      if (isOldBorrowIncentive) {
        borrowIncentive.normalMethod.oldUnstakeObligation(obligation, obligationKey);
      } else {
        borrowIncentive.normalMethod.unstakeObligation(obligation, obligationKey);
      }
    }
    borrowIncentive.normalMethod.stakeObligationWithVesca(obligation, obligationKey, vescaKey);
    return txBlock;
  }

  public async redeemSca(veScaKey: string): Promise<TransactionBlock> {
    const txBlock = new TransactionBlock();
    const vescaQuickMethod = generateQuickVeScaMethod({ builder: this.builder, txBlock });
    const sender = this.walletAddress;
    txBlock.setSender(sender);

    await vescaQuickMethod.redeemScaQuick(veScaKey);
    return txBlock;
  }

  public async migrateAndClaim(
    veScaKey: string,
    obligationKey: string,
    obligationId: string,
    rewardCoinName: SupportBorrowIncentiveRewardCoins,
  ) {
    const txBlock = new TransactionBlock();
    const borrowIncentive = generateBorrowIncentiveQuickMethod({ builder: this.builder, txBlock });
    const sender = this.walletAddress;
    txBlock.setSender(sender);

    const rewardCoin = borrowIncentive.normalMethod.oldClaimBorrowIncentive(
      obligationId,
      obligationKey,
      rewardCoinName,
    );
    txBlock.transferObjects([rewardCoin], sender);
    borrowIncentive.stakeObligationWithVeScaQuick(obligationId, obligationKey, veScaKey);
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

  private calculateAvailableClaimCoin(accountPoint: any, poolPoint: any): BigNumber {
    const borrowAmount = new BigNumber(accountPoint.weightedAmount);
    const baseIndexRate = 1e9;
    const increasePointRate = poolPoint.currentPointIndex
      ? BigNumber(poolPoint.currentPointIndex - accountPoint.index).dividedBy(baseIndexRate)
      : 1;
    return borrowAmount
      .multipliedBy(increasePointRate)
      .plus(accountPoint.points)
      .shiftedBy(-1 * poolPoint.coinDecimal);
  }
}
