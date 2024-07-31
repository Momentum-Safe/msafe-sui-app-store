import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SUI_TYPE_ARG, normalizeStructTag } from '@mysten/sui.js/utils';

import { ScallopAddress } from './scallopAddress';
import {
  ADDRESSES_ID,
  PROTOCOL_OBJECT_ID,
  spoolRewardCoins,
  borrowIncentiveRewardCoins,
  coinDecimals,
  wormholeCoinIds,
  voloCoinIds,
  coinIds,
  UNLOCK_ROUND_DURATION,
  MAX_LOCK_DURATION,
  sCoinIds,
  SUPPORT_SCOIN,
} from '../constants';
import type {
  ScallopUtilsParams,
  ScallopInstanceParams,
  SupportCoins,
  SupportAssetCoins,
  SupportMarketCoins,
  SupportStakeMarketCoins,
  SupportBorrowIncentiveCoins,
  CoinWrappedType,
  SupportPoolCoins,
  SuiTxArg,
  SupportSCoin,
} from '../types';
import { findClosestUnlockRound, isMarketCoin, parseAssetSymbol } from '../utils';

/**
 * @description
 * Integrates some helper functions frequently used in interactions with the Scallop contract.
 *
 * @example
 * ```typescript
 * const scallopUtils  = new ScallopUtils(<parameters>);
 * await scallopUtils.init();
 * scallopUtils.<utils functions>();
 * await scallopUtils.<utils functions>();
 * ```
 */
export class ScallopUtils {
  public readonly params: ScallopUtilsParams;

  public readonly isTestnet: boolean;

  private _address: ScallopAddress;

  public client: SuiClient;

  public constructor(params: ScallopUtilsParams, instance?: ScallopInstanceParams) {
    this.params = params;
    this._address =
      instance?.address ??
      new ScallopAddress({
        id: params?.addressesId || ADDRESSES_ID,
      });
    this.isTestnet = params.networkType ? params.networkType === 'testnet' : false;
    this.client = params.client;
  }

  /**
   * Request the scallop API to initialize data.
   *
   * @param force - Whether to force initialization.
   * @param address - ScallopAddress instance.
   */
  public async init(force = false, address?: ScallopAddress) {
    if (force || !this._address.getAddresses() || !address?.getAddresses()) {
      await this._address.read();
    } else {
      this._address = address;
    }
  }

  /**
   * Convert coin name to symbol.
   *
   * @param coinName - Specific support coin name.
   * @return Symbol string.
   */
  public parseSymbol(coinName: SupportCoins) {
    if (isMarketCoin(coinName)) {
      const assetCoinName = coinName.slice(1).toLowerCase() as SupportAssetCoins;
      return coinName.slice(0, 1).toLowerCase() + parseAssetSymbol(assetCoinName);
    }
    return parseAssetSymbol(coinName);
  }

  /**
   * Convert coin name to coin type.
   *
   * @description
   * The Coin type of wormhole is fixed `coin:Coin`. Here using package id
   * to determine and return the type.
   *
   * @param coinPackageId - Package id of coin.
   * @param coinName - Specific support coin name.
   * @return Coin type.
   */
  public parseCoinType(coinName: SupportCoins) {
    const validCoinName = isMarketCoin(coinName) ? this.parseCoinName(coinName) : coinName;
    const coinPackageId =
      this._address.get(`core.coins.${validCoinName as SupportPoolCoins}.id`) ||
      coinIds[coinName as SupportPoolCoins] ||
      undefined;
    if (!coinPackageId) {
      throw Error(`Coin ${coinName} is not supported`);
    }
    if (coinName === 'sui') {
      return normalizeStructTag(`${coinPackageId}::sui::SUI`);
    }
    const wormHolePckageIds = [
      this._address.get('core.coins.usdc.id') ?? wormholeCoinIds.usdc,
      this._address.get('core.coins.usdt.id') ?? wormholeCoinIds.usdt,
      this._address.get('core.coins.eth.id') ?? wormholeCoinIds.eth,
      this._address.get('core.coins.btc.id') ?? wormholeCoinIds.btc,
      this._address.get('core.coins.sol.id') ?? wormholeCoinIds.sol,
      this._address.get('core.coins.apt.id') ?? wormholeCoinIds.apt,
    ];
    const voloPckageIds = [this._address.get('core.coins.vsui.id') ?? voloCoinIds.vsui];
    if (wormHolePckageIds.includes(coinPackageId)) {
      return `${coinPackageId}::coin::COIN`;
    }
    if (voloPckageIds.includes(coinPackageId)) {
      return `${coinPackageId}::cert::CERT`;
    }
    return `${coinPackageId}::${validCoinName}::${validCoinName.toUpperCase()}`;
  }

  /**
   * Convert coin name to market coin type.
   *
   * @param coinPackageId - Package id of coin.
   * @param coinName - Specific support coin name.
   * @return Market coin type.
   */
  public parseMarketCoinType(coinName: SupportCoins) {
    const protocolObjectId = this._address.get('core.object') || PROTOCOL_OBJECT_ID;
    const coinType = this.parseCoinType(coinName);
    return `${protocolObjectId}::reserve::MarketCoin<${coinType}>`;
  }

  /**
   * Convert coin type to coin name.
   *
   * @description
   * The coin name cannot be obtained directly from the wormhole type. Here
   * the package id is used to determine and return a specific name.
   *
   * @param coinType - Specific support coin type.
   * @return Coin Name.
   */
  public parseCoinNameFromType<T extends SupportAssetCoins>(
    coinType: string,
  ): T extends SupportAssetCoins ? T : SupportAssetCoins;
  public parseCoinNameFromType<T extends SupportMarketCoins>(
    coinType: string,
  ): T extends SupportMarketCoins ? T : SupportMarketCoins;
  public parseCoinNameFromType<T extends SupportCoins>(coinType: string): T extends SupportCoins ? T : SupportCoins;
  public parseCoinNameFromType(coinType: string) {
    let type = normalizeStructTag(coinType);
    const coinTypeRegex = /((0x[^:]+::[^:]+::[^<>]+))(?![^<>]*<)/;
    const coinTypeMatch = coinType.match(coinTypeRegex);
    const isMarketCoinType = coinType.includes('reserve::MarketCoin');
    type = coinTypeMatch?.[1] || coinType;

    const wormHoleCoinTypeMap: Record<string, SupportAssetCoins> = {
      [`${this._address.get('core.coins.usdc.id') ?? wormholeCoinIds.usdc}::coin::COIN`]: 'usdc',
      [`${this._address.get('core.coins.usdt.id') ?? wormholeCoinIds.usdt}::coin::COIN`]: 'usdt',
      [`${this._address.get('core.coins.eth.id') ?? wormholeCoinIds.eth}::coin::COIN`]: 'eth',
      [`${this._address.get('core.coins.btc.id') ?? wormholeCoinIds.btc}::coin::COIN`]: 'btc',
      [`${this._address.get('core.coins.sol.id') ?? wormholeCoinIds.sol}::coin::COIN`]: 'sol',
      [`${this._address.get('core.coins.apt.id') ?? wormholeCoinIds.apt}::coin::COIN`]: 'apt',
    };
    const voloCoinTypeMap: Record<string, SupportAssetCoins> = {
      [`${this._address.get('core.coins.vsui.id') ?? voloCoinIds.vsui}::cert::CERT`]: 'vsui',
    };

    const assetCoinName =
      wormHoleCoinTypeMap[type] || voloCoinTypeMap[type] || (type.split('::')[2].toLowerCase() as SupportAssetCoins);

    return isMarketCoinType ? this.parseMarketCoinName(assetCoinName) : assetCoinName;
  }

  /**
   * Convert marke coin name to coin name.
   *
   * @param marketCoinName - Specific support market coin name.
   * @return Coin Name.
   */
  public parseCoinName<T extends SupportAssetCoins>(marketCoinName: string) {
    return marketCoinName.slice(1) as T;
  }

  /**
   * Convert coin name to market coin name.
   *
   * @param coinName - Specific support coin name.
   * @return Market coin name.
   */
  public parseMarketCoinName<T extends SupportMarketCoins>(coinName: SupportCoins) {
    return `s${coinName}` as T;
  }

  /**
   * Get reward type of spool.
   *
   * @param stakeMarketCoinName - Support stake market coin.
   * @return Spool reward coin name.
   */
  public getSpoolRewardCoinName = (stakeMarketCoinName: SupportStakeMarketCoins) =>
    spoolRewardCoins[stakeMarketCoinName];

  /**
   * Get reward type of borrow incentive pool.
   *
   * @param borrowIncentiveCoinName - Support borrow incentive coin.
   * @return Borrow incentive reward coin name.
   */
  public getBorrowIncentiveRewardCoinName = (borrowIncentiveCoinName: SupportBorrowIncentiveCoins) =>
    borrowIncentiveRewardCoins[borrowIncentiveCoinName];

  /**
   * Get coin decimal.
   *
   * return Coin decimal.
   */
  public getCoinDecimal(coinName: SupportCoins) {
    return coinDecimals[coinName];
  }

  /**
   * Get coin wrapped type.
   *
   * return Coin wrapped type.
   */
  public getCoinWrappedType(assetCoinName: SupportAssetCoins): CoinWrappedType {
    return assetCoinName === 'usdc' ||
      assetCoinName === 'usdt' ||
      assetCoinName === 'eth' ||
      assetCoinName === 'btc' ||
      assetCoinName === 'apt' ||
      assetCoinName === 'sol'
      ? {
          from: 'Wormhole',
          type: 'Portal from Ethereum',
        }
      : undefined;
  }

  /**
   * Convert sCoin name into sCoin type
   * @param sCoinName
   * @returns sCoin type
   */
  public parseSCoinType(sCoinName: SupportSCoin) {
    return sCoinIds[sCoinName];
  }

  /**
   * Convert sCoin name into its underlying coin type
   * @param sCoinName
   * @returns coin type
   */
  public parseUnderlyingSCoinType(sCoinName: SupportSCoin) {
    const coinName = this.parseCoinName(sCoinName);
    return this.parseCoinType(coinName);
  }

  /**
   * Get sCoin treasury id from sCoin name
   * @param sCoinName
   * @returns sCoin treasury id
   */
  public getSCoinTreasury(sCoinName: SupportSCoin) {
    return this._address.get(`scoin.coins.${sCoinName}.treasury`);
  }

  /**
   * Select coin id  that add up to the given amount as transaction arguments.
   *
   * @param ownerAddress - The address of the owner.
   * @param amount - The amount that including coin decimals.
   * @param coinType - The coin type, default is 0x2::SUI::SUI.
   * @return The selected transaction coin arguments.
   */
  public async selectCoins(amount: number, coinType: string = SUI_TYPE_ARG, ownerAddress?: string) {
    const address = ownerAddress;

    const selectedCoins: {
      objectId: string;
      digest: string;
      version: string;
      balance: string;
    }[] = [];
    let totalAmount = 0;
    let hasNext = true;
    let nextCursor: string | null | undefined = null;
    while (hasNext && totalAmount < amount) {
      const coins = await this.client.getCoins({
        owner: address,
        coinType,
        cursor: nextCursor,
      });
      // Sort the coins by balance in descending order
      coins.data.sort((a, b) => parseInt(b.balance, 10) - parseInt(a.balance, 10));
      for (let i = 0; i < coins.data.length; i++) {
        selectedCoins.push({
          objectId: coins.data[i].coinObjectId,
          digest: coins.data[i].digest,
          version: coins.data[i].version,
          balance: coins.data[i].balance,
        });
        totalAmount += parseInt(coins.data[i].balance, 10);
        if (totalAmount >= amount) {
          break;
        }
      }
      nextCursor = coins.nextCursor;
      hasNext = coins.hasNextPage;
    }

    if (!selectedCoins.length) {
      throw new Error('No valid coins found for the transaction.');
    }
    return selectedCoins;
  }

  public async selectCoinIds(amount: number, coinType: string = SUI_TYPE_ARG, ownerAddress?: string) {
    const selectedCoins = await this.selectCoins(amount, coinType, ownerAddress);
    return selectedCoins.map((coin) => coin.objectId);
  }

  /**
   * Convert apr to apy.
   *
   * @param apr The annual percentage rate (APR).
   * @param compoundFrequency How often interest is compounded per year. Default is daily (365 times a year).
   * @return The equivalent annual percentage yield (APY) for the given APR and compounding frequency.
   */
  public parseAprToApy(apr: number, compoundFrequency = 365) {
    return (1 + apr / compoundFrequency) ** compoundFrequency - 1;
  }

  /**
   * Convert apr to apy.
   *
   * @param apr The equivalent annual percentage yield (APY).
   * @param compoundFrequency How often interest is compounded per year. Default is daily (365 times a year).
   * @return The equivalent annual percentage rate (APR) for the given APY and compounding frequency.
   */
  public parseApyToApr(apy: number, compoundFrequency = 365) {
    return ((1 + apy) ** (1 / compoundFrequency) - 1) * compoundFrequency;
  }

  public takeAmountFromCoins(txBlock: TransactionBlock, coinObjectId: string[], amount: SuiTxArg) {
    const coinObjects = coinObjectId.map((objectId) => txBlock.object(objectId));
    const mergedCoin = coinObjects[0];
    if (coinObjects.length > 1) {
      txBlock.mergeCoins(mergedCoin, coinObjects.slice(1));
    }
    const [sendCoin] = txBlock.splitCoins(mergedCoin, [txBlock.pure(amount)]);
    return [sendCoin, mergedCoin];
  }

  /**
   * Give extend lock period to get unlock at in seconds timestamp.
   *
   * @description
   * - When the user without remaining unlock period, If the extended unlock day is not specified,
   *   the unlock period will be increased by one day by default.
   * - When the given extended day plus the user's remaining unlock period exceeds the maximum
   *    unlock period, the maximum unlock period is used as unlock period.
   *
   * @param extendLockPeriodInDay The extend lock period in day.
   * @param unlockAtInSecondTimestamp The unlock timestamp from veSca object.
   * @return New unlock at in seconds timestamp.
   */
  public getUnlockAt(extendLockPeriodInDay?: number, unlockAtInSecondTimestamp?: number) {
    const now = Math.floor(new Date().getTime() / 1000);
    const remainingLockPeriod = unlockAtInSecondTimestamp ? Math.max(unlockAtInSecondTimestamp - now, 0) : 0;

    let newUnlockAtInSecondTimestamp = 0;

    if (remainingLockPeriod === 0) {
      const lockPeriod = (extendLockPeriodInDay ?? 1) * UNLOCK_ROUND_DURATION;
      newUnlockAtInSecondTimestamp = Math.min(now + lockPeriod, now + MAX_LOCK_DURATION);
    } else {
      const lockPeriod = Math.min(
        extendLockPeriodInDay
          ? extendLockPeriodInDay * UNLOCK_ROUND_DURATION + remainingLockPeriod
          : remainingLockPeriod,
        MAX_LOCK_DURATION,
      );
      newUnlockAtInSecondTimestamp = now + lockPeriod;
    }
    return findClosestUnlockRound(newUnlockAtInSecondTimestamp);
  }

  /**
   * Convert coin name to sCoin name.
   *
   * @param coinName - Specific support coin name.
   * @return sCoin name.
   */
  public parseSCoinName<T extends SupportSCoin>(coinName: SupportCoins | SupportMarketCoins) {
    // need more check because sbtc, ssol and sapt has no sCoin type
    if (isMarketCoin(coinName) && SUPPORT_SCOIN.includes(coinName as SupportSCoin)) {
      return coinName as T;
    }
    const marketCoinName = `s${coinName}`;
    if (SUPPORT_SCOIN.includes(marketCoinName as SupportSCoin)) {
      return marketCoinName as T;
    }
    return undefined;
  }
}
