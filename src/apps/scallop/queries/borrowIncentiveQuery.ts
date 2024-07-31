import { TransactionBlock } from '@mysten/sui.js/transactions';
import { normalizeStructTag } from '@mysten/sui.js/utils';
import BigNumber from 'bignumber.js';

import { SUPPORT_BORROW_INCENTIVE_POOLS } from '../constants';
import type { ScallopQuery } from '../models';
import type {
  BorrowIncentiveAccountsQueryInterface,
  BorrowIncentiveAccounts,
  SupportBorrowIncentiveCoins,
  BorrowIncentivePoolsQueryInterface,
  BorrowIncentivePools,
  OptionalKeys,
  BorrowIncentivePoolPoints,
  SupportBorrowIncentiveRewardCoins,
} from '../types';
import { parseOriginBorrowIncentiveAccountData, parseOriginBorrowIncentivePoolData } from '../utils';

/**
 * Query borrow incentive accounts data.
 *
 * @param query - The Scallop query instance.
 * @param borrowIncentiveCoinNames - Specific an array of support borrow incentive coin name.
 * @return Borrow incentive accounts data.
 */
export const queryBorrowIncentiveAccounts = async (
  query: ScallopQuery,
  obligationId: string,
  sender: string,
  borrowIncentiveCoinNames?: SupportBorrowIncentiveCoins[],
) => {
  const coinName = borrowIncentiveCoinNames || [...SUPPORT_BORROW_INCENTIVE_POOLS];
  const queryPkgId = await query.address.get('borrowIncentive.query');
  const incentiveAccountsId = await query.address.get('borrowIncentive.incentiveAccounts');
  const queryTarget =
    `${queryPkgId}::incentive_account_query::incentive_account_data` as `${string}::${string}::${string}`;
  const txBlock = new TransactionBlock();
  txBlock.moveCall({
    target: queryTarget,
    arguments: [txBlock.object(incentiveAccountsId), txBlock.object(obligationId)],
  });
  const queryResult = await query.client.devInspectTransactionBlock({
    transactionBlock: txBlock,
    sender,
  });
  const borrowIncentiveAccountsQueryData = queryResult.events[0].parsedJson as BorrowIncentiveAccountsQueryInterface;

  const borrowIncentiveAccounts: BorrowIncentiveAccounts = {};

  borrowIncentiveAccountsQueryData.pool_records.forEach((accountData) => {
    const parsedBorrowIncentiveAccount = parseOriginBorrowIncentiveAccountData(accountData);
    const { poolType } = parsedBorrowIncentiveAccount;
    const parsedCoinName = query.utils.parseCoinNameFromType<SupportBorrowIncentiveCoins>(poolType);
    if (coinName.length >= 1 && coinName.includes(parsedCoinName)) {
      borrowIncentiveAccounts[parsedCoinName] = parsedBorrowIncentiveAccount;
    }
  }, {} as BorrowIncentiveAccounts);
  return borrowIncentiveAccounts;
};

/**
 * Query borrow incentive pools data.
 *
 * @param query - The Scallop query instance.
 * @param borrowIncentiveCoinNames - Specific an array of support borrow incentive coin name.
 * @param indexer - Whether to use indexer.
 * @return Borrow incentive pools data.
 */
export const queryBorrowIncentivePools = async (query: ScallopQuery, coinNames?: SupportBorrowIncentiveCoins[]) => {
  const borrowIncentiveCoinNames = coinNames || [...SUPPORT_BORROW_INCENTIVE_POOLS];
  const queryPkgId = await query.address.get('borrowIncentive.query');
  const incentivePoolsId = await query.address.get('borrowIncentive.incentivePools');

  const txBlock = new TransactionBlock();
  const queryTarget = `${queryPkgId}::incentive_pools_query::incentive_pools_data` as `${string}::${string}::${string}`;
  txBlock.moveCall({ target: queryTarget, arguments: [txBlock.object(incentivePoolsId)] });
  const queryResult = await query.client.devInspectTransactionBlock({
    transactionBlock: txBlock,
    sender: query.walletAddress,
  });
  const borrowIncentivePoolsQueryData = queryResult.events[0].parsedJson as BorrowIncentivePoolsQueryInterface;

  const borrowIncentivePools: BorrowIncentivePools = {};

  for (let i = 0; i < borrowIncentivePoolsQueryData.incentive_pools.length; i++) {
    const pool = borrowIncentivePoolsQueryData.incentive_pools[i];
    const borrowIncentivePoolPoints: OptionalKeys<Record<'sui' | 'sca', BorrowIncentivePoolPoints>> = {};
    const parsedBorrowIncentivePoolData = parseOriginBorrowIncentivePoolData(pool);
    const poolCoinType = normalizeStructTag(pool.pool_type.name);
    const poolCoinName = query.utils.parseCoinNameFromType<SupportBorrowIncentiveCoins>(poolCoinType);

    // Filter pools not yet supported by the SDK.
    if (!borrowIncentiveCoinNames.includes(poolCoinName)) {
      continue;
    }
    // pool points for borrow incentive reward ('sui' and 'sca')

    Object.entries(parsedBorrowIncentivePoolData.poolPoints).forEach(([coinName, poolPoint]) => {
      const baseIndexRate = 1_000_000_000;
      const rewardCoinType = normalizeStructTag(poolPoint.pointType);
      const rewardCoinName = query.utils.parseCoinNameFromType<SupportBorrowIncentiveRewardCoins>(rewardCoinType);
      const timeDelta = BigNumber(Math.floor(new Date().getTime() / 1000) - poolPoint.lastUpdate)
        .dividedBy(poolPoint.period)
        .toFixed(0);

      const accumulatedPoints = BigNumber.minimum(
        BigNumber(timeDelta).multipliedBy(poolPoint.distributedPointPerPeriod),
        BigNumber(poolPoint.points),
      );

      const currentPointIndex = BigNumber(poolPoint.index).plus(
        accumulatedPoints.dividedBy(poolPoint.weightedAmount).isFinite()
          ? BigNumber(baseIndexRate).multipliedBy(accumulatedPoints).dividedBy(poolPoint.weightedAmount)
          : 0,
      );
      borrowIncentivePoolPoints[coinName as SupportBorrowIncentiveRewardCoins] = {
        points: poolPoint.points,
        coinDecimal: query.utils.getCoinDecimal(rewardCoinName),
        distributedPoint: poolPoint.distributedPoint,
        weightedAmount: poolPoint.weightedAmount,
        currentPointIndex: currentPointIndex.toNumber(),
      };
    });

    borrowIncentivePools[poolCoinName] = {
      coinName: poolCoinName,
      symbol: query.utils.parseSymbol(poolCoinName),
      coinType: poolCoinType,
      points: borrowIncentivePoolPoints,
    };
  }

  return borrowIncentivePools;
};
