import { SuiClient } from '@mysten/sui.js/client';

import { ScallopAddress } from './scallopAddress';
import { ScallopUtils } from './scallopUtils';
import { ADDRESSES_ID, SUPPORT_SPOOLS } from '../constants';
import {
  getObligations,
  getStakeAccounts,
  getStakePool,
  getStakeRewardPool,
  getPythPrice,
  queryBorrowIncentiveAccounts,
  getCoinAmounts,
  getCoinAmount,
  getMarketCoinAmounts,
  getMarketCoinAmount,
  queryObligation,
} from '../queries';
import {
  ScallopQueryParams,
  ScallopInstanceParams,
  SupportStakeMarketCoins,
  SupportAssetCoins,
  SupportMarketCoins,
  StakePools,
  StakeRewardPools,
  SupportBorrowIncentiveCoins,
  SuiAddressArg,
} from '../types';

/**
 * @description
 * It provides methods for getting on-chain data from the Scallop contract.
 *
 * @example
 * ```typescript
 * const scallopQuery  = new ScallopQuery(<parameters>);
 * await scallopQuery.init();
 * scallopQuery.<query functions>();
 * await scallopQuery.<query functions>();
 * ```
 */
export class ScallopQuery {
  public readonly params: ScallopQueryParams;

  public address: ScallopAddress;

  public client: SuiClient;

  public utils: ScallopUtils;

  public walletAddress: string;

  public constructor(params: ScallopQueryParams, instance?: Omit<ScallopInstanceParams, 'query' | 'builder'>) {
    this.params = params;
    this.client = params.client;

    const { address, utils } = instance;
    this.address = address;
    this.utils = utils;
  }

  /**
   * Request the scallop API to initialize data.
   *
   * @param force - Whether to force initialization.
   * @param address - ScallopAddress instance.
   */
  public async init(force = false, address: ScallopAddress) {
    this.address = address;
    this.utils.init(true, this.address);
  }

  /* ==================== Core Query Methods ==================== */

  /**
   * Get obligations data.
   *
   * @param ownerAddress - The owner address.
   * @return Obligations data.
   */
  public async getObligations(ownerAddress?: string) {
    return getObligations(this, ownerAddress);
  }

  /**
   * Get all asset coin amounts.
   *
   * @param assetCoinNames - Specific an array of support asset coin name.
   * @param ownerAddress - The owner address.
   * @return All coin amounts.
   */
  public async getCoinAmounts(ownerAddress: string, assetCoinNames?: SupportAssetCoins[]) {
    return getCoinAmounts(this, ownerAddress, assetCoinNames);
  }

  /**
   * Get asset coin amount.
   *
   * @param assetCoinName - Specific support asset coin name.
   * @param ownerAddress - The owner address.
   * @return Coin amount.
   */
  public async getCoinAmount(assetCoinName: SupportAssetCoins, ownerAddress?: string) {
    return getCoinAmount(this, assetCoinName, ownerAddress);
  }

  /**
   * Get all market coin amounts.
   *
   * @param coinNames - Specific an array of support market coin name.
   * @param ownerAddress - The owner address.
   * @return All market market coin amounts.
   */
  public async getMarketCoinAmounts(ownerAddress: string, marketCoinNames?: SupportMarketCoins[]) {
    return getMarketCoinAmounts(this, ownerAddress, marketCoinNames);
  }

  /**
   * Get market coin amount.
   *
   * @param coinNames - Specific support market coin name.
   * @param ownerAddress - The owner address.
   * @return Market market coin amount.
   */
  public async getMarketCoinAmount(marketCoinName: SupportMarketCoins, ownerAddress?: string) {
    return getMarketCoinAmount(this, marketCoinName, ownerAddress);
  }

  /**
   * Get price from pyth fee object.
   *
   * @param assetCoinName - Specific support asset coin name.
   * @return Asset coin price.
   */
  public async getPriceFromPyth(assetCoinName: SupportAssetCoins) {
    return getPythPrice(this, assetCoinName);
  }

  /* ==================== Spool Query Methods ==================== */

  /**
   * Get stake accounts data for all stake pools (spools).
   *
   * @param ownerAddress - The owner address.
   * @return All Stake accounts data.
   */
  public async getAllStakeAccounts(ownerAddress?: string) {
    return getStakeAccounts(this, ownerAddress);
  }

  /**
   * Get stake accounts data for specific stake pool (spool).
   *
   * @param stakeMarketCoinName - Specific support stake market coin name.
   * @param ownerAddress - The owner address.
   * @return Stake accounts data.
   */
  public async getStakeAccounts(stakeMarketCoinName: SupportStakeMarketCoins, ownerAddress?: string) {
    const allStakeAccount = await this.getAllStakeAccounts(ownerAddress);
    return allStakeAccount[stakeMarketCoinName] ?? [];
  }

  /**
   * Get stake pools (spools) data.
   *
   * @description
   * For backward compatible, it is recommended to use `getSpools` method
   * to get all spools data.
   *
   * @param stakeMarketCoinNames - Specific an array of support stake market coin name.
   * @return Stake pools data.
   */
  public async getStakePools(stakeMarketCoinNames?: SupportStakeMarketCoins[]) {
    const marketCoinNames = stakeMarketCoinNames ?? [...SUPPORT_SPOOLS];
    const stakePools: StakePools = {};
    for (let i = 0; i < marketCoinNames.length; i++) {
      const stakeMarketCoinName = marketCoinNames[i];
      const stakePool = await getStakePool(this, stakeMarketCoinName);

      if (stakePool) {
        stakePools[stakeMarketCoinName] = stakePool;
      }
    }
    return stakePools;
  }

  /**
   * Get stake pool (spool) data.
   *
   * @description
   * For backward compatible, it is recommended to use `getSpool` method
   * to get all spool data.
   *
   * @param stakeMarketCoinName - Specific support stake market coin name.
   * @return Stake pool data.
   */
  public async getStakePool(stakeMarketCoinName: SupportStakeMarketCoins) {
    return getStakePool(this, stakeMarketCoinName);
  }

  /**
   * Get stake reward pools data.
   *
   * @description
   * For backward compatible, it is recommended to use `getSpools` method
   * to get all spools data.
   *
   * @param stakeMarketCoinNames - Specific an array of stake market coin name.
   * @return Stake reward pools data.
   */
  public async getStakeRewardPools(stakeMarketCoinNames?: SupportStakeMarketCoins[]) {
    const marketCoinNames = stakeMarketCoinNames ?? [...SUPPORT_SPOOLS];
    const stakeRewardPools: StakeRewardPools = {};
    for (let i = 0; i < marketCoinNames.length; i++) {
      const stakeRewardPool = await getStakeRewardPool(this, marketCoinNames[i]);

      if (stakeRewardPool) {
        stakeRewardPools[marketCoinNames[i]] = stakeRewardPool;
      }
    }
    return stakeRewardPools;
  }

  /**
   * Get stake reward pool data.
   *
   * @description
   * For backward compatible, it is recommended to use `getSpool` method
   * to get spool data.
   *
   * @param marketCoinName - Specific support stake market coin name.
   * @return Stake reward pool data.
   */
  public async getStakeRewardPool(stakeMarketCoinName: SupportStakeMarketCoins) {
    return getStakeRewardPool(this, stakeMarketCoinName);
  }

  /**
   * Get borrow incentive accounts data.
   *
   * @param coinNames - Specific support borrow incentive coin name.
   * @param ownerAddress - The owner address.
   * @return Borrow incentive accounts data.
   */
  public async getBorrowIncentiveAccounts(
    obligationId: string,
    walletAddress: string,
    coinNames?: SupportBorrowIncentiveCoins[],
  ) {
    return queryBorrowIncentiveAccounts(this, obligationId, walletAddress || this.walletAddress, coinNames);
  }

  /**
   * Get all asset coin names in the obligation record by obligation id.
   *
   * @description
   * This can often be used to determine which assets in an obligation require
   * price updates before interacting with specific instructions of the Scallop contract.
   *
   * @param obligationId - The obligation id.
   * @return Asset coin Names.
   */
  public async getObligationCoinNames(obligationId: SuiAddressArg) {
    const obligation = await queryObligation(this, obligationId);
    const collateralCoinTypes = obligation.collaterals.map((collateral) => `0x${collateral.type.name}`);
    const debtCoinTypes = obligation.debts.map((debt) => `0x${debt.type.name}`);
    const obligationCoinTypes = [...new Set([...collateralCoinTypes, ...debtCoinTypes])];
    const obligationCoinNames = obligationCoinTypes.map((coinType) => this.utils.parseCoinNameFromType(coinType));
    return obligationCoinNames;
  }
}
