import { ScallopAddress } from './scallopAddress';
import { ADDRESSES_ID, SUPPORT_SPOOLS } from '../constants';
import {
  queryMarket,
  getObligations,
  queryObligation,
  getStakeAccounts,
  getStakePool,
  getStakeRewardPool,
  getPythPrice,
  getMarketPools,
  getMarketPool,
  getMarketCollaterals,
  getMarketCollateral,
  getSpools,
  getSpool,
  queryBorrowIncentivePools,
  queryBorrowIncentiveAccounts,
  getCoinAmounts,
  getCoinAmount,
  getMarketCoinAmounts,
  getMarketCoinAmount,
  getLendings,
  getLending,
  getObligationAccounts,
  getObligationAccount,
  getTotalValueLocked,
} from '../queries';
import {
  ScallopQueryParams,
  ScallopInstanceParams,
  SupportStakeMarketCoins,
  SupportAssetCoins,
  SupportPoolCoins,
  SupportCollateralCoins,
  SupportMarketCoins,
  StakePools,
  StakeRewardPools,
  SupportBorrowIncentiveCoins,
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

  public constructor(params: ScallopQueryParams, instance?: ScallopInstanceParams) {
    this.params = params;
    this.address =
      instance?.address ??
      new ScallopAddress({
        id: params?.addressesId || ADDRESSES_ID,
        network: params?.networkType,
      });
  }

  /**
   * Request the scallop API to initialize data.
   *
   * @param force - Whether to force initialization.
   * @param address - ScallopAddress instance.
   */
  public async init(force = false, address?: ScallopAddress) {
    if (force || !this.address.getAddresses() || !address?.getAddresses()) {
      await this.address.read();
    } else {
      this.address = address;
    }
  }

  /* ==================== Core Query Methods ==================== */

  /**
   * Query market data.
   * @param indexer - Whether to use indexer.
   * @return Market data.
   */
  public async queryMarket(indexer = false) {
    return queryMarket(this, indexer);
  }

  /**
   * Get market pools.
   *
   * @description
   * To obtain all market pools at once, it is recommended to use
   * the `queryMarket` method to reduce time consumption.
   *
   * @param poolCoinNames - Specific an array of support pool coin name.
   * @param indexer - Whether to use indexer.
   * @return Market pools data.
   */
  public async getMarketPools(poolCoinNames?: SupportPoolCoins[], indexer = false) {
    return getMarketPools(this, poolCoinNames, indexer);
  }

  /**
   * Get  market pool
   *
   * @param poolCoinName - Specific support pool coin name.
   * @param indexer - Whether to use indexer.
   * @return Market pool data.
   */
  public async getMarketPool(poolCoinName: SupportPoolCoins, indexer = false) {
    return getMarketPool(this, poolCoinName, indexer);
  }

  /**
   * Get market collaterals.
   *
   * @description
   * To obtain all market collaterals at once, it is recommended to use
   * the `queryMarket` method to reduce time consumption.
   *
   * @param collateralCoinNames - Specific an array of support collateral coin name.
   * @param indexer - Whether to use indexer.
   * @return Market collaterals data.
   */
  public async getMarketCollaterals(collateralCoinNames?: SupportCollateralCoins[], indexer = false) {
    return getMarketCollaterals(this, collateralCoinNames, indexer);
  }

  /**
   * Get market collateral
   *
   * @param collateralCoinName - Specific support collateral coin name.
   * @param indexer - Whether to use indexer.
   * @return Market collateral data.
   */
  public async getMarketCollateral(collateralCoinName: SupportCollateralCoins, indexer = false) {
    return getMarketCollateral(this, collateralCoinName, indexer);
  }

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
   * Query obligation data.
   *
   * @param obligationId - The obligation id.
   * @return Obligation data.
   */
  public async queryObligation(obligationId: string) {
    return queryObligation(this, obligationId);
  }

  /**
   * Get all asset coin amounts.
   *
   * @param assetCoinNames - Specific an array of support asset coin name.
   * @param ownerAddress - The owner address.
   * @return All coin amounts.
   */
  public async getCoinAmounts(assetCoinNames?: SupportAssetCoins[], ownerAddress?: string) {
    return getCoinAmounts(this, assetCoinNames, ownerAddress);
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
  public async getMarketCoinAmounts(marketCoinNames?: SupportMarketCoins[], ownerAddress?: string) {
    return getMarketCoinAmounts(this, marketCoinNames, ownerAddress);
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
   * Get spools data.
   *
   * @param stakeMarketCoinNames - Specific an array of support stake market coin name.
   * @param indexer - Whether to use indexer.
   * @return Spools data.
   */
  public async getSpools(stakeMarketCoinNames?: SupportStakeMarketCoins[], indexer = false) {
    return getSpools(this, stakeMarketCoinNames, indexer);
  }

  /**
   * Get spool data.
   *
   * @param stakeMarketCoinName - Specific support stake market coin name.
   * @param indexer - Whether to use indexer.
   * @return Spool data.
   */
  public async getSpool(stakeMarketCoinName: SupportStakeMarketCoins, indexer = false) {
    return getSpool(this, stakeMarketCoinName, indexer);
  }

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
    marketCoinNames.forEach(async (stakeMarketCoinName) => {
      const stakePool = await getStakePool(this, stakeMarketCoinName);

      if (stakePool) {
        stakePools[stakeMarketCoinName] = stakePool;
      }
    });
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
    marketCoinNames.forEach(async (stakeMarketCoinName) => {
      const stakeRewardPool = await getStakeRewardPool(this, stakeMarketCoinName);

      if (stakeRewardPool) {
        stakeRewardPools[stakeMarketCoinName] = stakeRewardPool;
      }
    });
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
   * Get borrow incentive pools data.
   *
   * @param coinNames - Specific an array of support borrow incentive coin name.
   * @param indexer - Whether to use indexer.
   * @return Borrow incentive pools data.
   */
  public async getBorrowIncentivePools(coinNames?: SupportBorrowIncentiveCoins[], indexer = false) {
    return queryBorrowIncentivePools(this, coinNames, indexer);
  }

  /**
   * Get borrow incentive accounts data.
   *
   * @param coinNames - Specific support borrow incentive coin name.
   * @param ownerAddress - The owner address.
   * @return Borrow incentive accounts data.
   */
  public async getBorrowIncentiveAccounts(obligationId: string, coinNames?: SupportBorrowIncentiveCoins[]) {
    return queryBorrowIncentiveAccounts(this, obligationId, coinNames);
  }

  /**
   * Get user lending and spool infomation for specific pools.
   *
   * @param poolCoinNames - Specific an array of support pool coin name.
   * @param ownerAddress - The owner address.
   * @param indexer - Whether to use indexer.
   * @return All lending and spool infomation.
   */
  public async getLendings(poolCoinNames?: SupportPoolCoins[], ownerAddress?: string, indexer = false) {
    return getLendings(this, poolCoinNames, ownerAddress, indexer);
  }

  /**
   * Get user lending and spool information for specific pool.
   *
   * @param poolCoinName - Specific support pool coin name.
   * @param ownerAddress - The owner address.
   * @param indexer - Whether to use indexer.
   * @return Lending pool data.
   */
  public async getLending(poolCoinName: SupportPoolCoins, ownerAddress?: string, indexer = false) {
    return getLending(this, poolCoinName, ownerAddress, indexer);
  }

  /**
   * Get user all obligation accounts information.
   *
   * @description
   * All collateral and borrowing information in all obligation accounts owned by the user.
   *
   * @param ownerAddress - The owner address.
   * @param indexer - Whether to use indexer.
   * @return All obligation accounts information.
   */
  public async getObligationAccounts(ownerAddress?: string, indexer = false) {
    return getObligationAccounts(this, ownerAddress, indexer);
  }

  /**
   * Get obligation account information for specific id.
   *
   * @description
   * borrowing and obligation information for specific pool.
   *
   * @param obligationId - The obligation id.
   * @param ownerAddress - The owner address.
   * @param indexer - Whether to use indexer.
   * @return Borrowing and collateral information.
   */
  public async getObligationAccount(obligationId: string, ownerAddress?: string, indexer = false) {
    return getObligationAccount(this, obligationId, ownerAddress, indexer);
  }

  /**
   * Get total value locked.
   *
   * @param indexer - Whether to use indexer.
   * @description
   * Include total supplied value and total borrowed value.
   *
   * @return Total value locked.
   */
  public async getTvl(indexer = false) {
    return getTotalValueLocked(this, indexer);
  }
}
