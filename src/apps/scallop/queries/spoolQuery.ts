import type { SuiObjectResponse } from '@mysten/sui.js/client';
import { normalizeStructTag } from '@mysten/sui.js/utils';

import type { ScallopQuery } from '../models';
import type { StakePool, StakeRewardPool, StakeAccounts, SupportStakeMarketCoins, SupportStakeCoins } from '../types';

/**
 * Get all stake accounts of the owner.
 *
 * @param query - The Scallop query instance.
 * @param ownerAddress - Owner address.
 * @return Stake accounts.
 */
export const getStakeAccounts = async (query: ScallopQuery, ownerAddress: string) => {
  const owner = ownerAddress;
  const spoolObjectId = query.address.get('spool.object');
  const stakeAccountType = `${spoolObjectId}::spool_account::SpoolAccount`;
  const stakeObjectsResponse: SuiObjectResponse[] = [];
  let hasNextPage = false;
  let nextCursor: string | null = null;
  do {
    const paginatedStakeObjectsResponse = await query.client.getOwnedObjects({
      owner,
      filter: { StructType: stakeAccountType },
      options: {
        showContent: true,
        showType: true,
      },
      cursor: nextCursor,
    });
    stakeObjectsResponse.push(...paginatedStakeObjectsResponse.data);
    if (paginatedStakeObjectsResponse.hasNextPage && paginatedStakeObjectsResponse.nextCursor) {
      hasNextPage = true;
      nextCursor = paginatedStakeObjectsResponse.nextCursor;
    } else {
      hasNextPage = false;
    }
  } while (hasNextPage);

  const stakeAccounts: StakeAccounts = {
    seth: [],
    ssui: [],
    susdc: [],
    susdt: [],
    scetus: [],
    safsui: [],
    shasui: [],
    svsui: [],
  };

  const stakeMarketCoinTypes: Record<SupportStakeMarketCoins, string> = Object.keys(stakeAccounts).reduce(
    (types, stakeMarketCoinName) => {
      const stakeCoinName = query.utils.parseCoinName<SupportStakeCoins>(stakeMarketCoinName);
      const marketCoinType = query.utils.parseMarketCoinType(stakeCoinName);

      const updateTypes = { ...types };
      const newType = `${spoolObjectId}::spool_account::SpoolAccount<${marketCoinType}>`;
      updateTypes[stakeMarketCoinName as SupportStakeMarketCoins] = newType;
      return updateTypes;
    },
    {} as Record<SupportStakeMarketCoins, string>,
  );

  const stakeObjectIds: string[] = stakeObjectsResponse
    .map((ref: any) => ref?.data?.objectId)
    .filter((id: any) => id !== undefined);
  const stakeObjects = await query.client.multiGetObjects({ ids: stakeObjectIds });
  stakeObjects.forEach((stakeObject) => {
    const id = stakeObject.data.objectId;
    const type = stakeObject.data.type!;
    if (stakeObject.data.content && 'fields' in stakeObject.data.content) {
      const fields = stakeObject.data.content.fields as any;
      const stakePoolId = String(fields.spool_id);
      const stakeType = String(fields.stake_type.fields.name);
      const staked = Number(fields.stakes);
      const index = Number(fields.index);
      const points = Number(fields.points);
      const totalPoints = Number(fields.total_points);
      if (normalizeStructTag(type) === stakeMarketCoinTypes.seth) {
        stakeAccounts.seth.push({
          id,
          type: normalizeStructTag(type),
          stakePoolId,
          stakeType: normalizeStructTag(stakeType),
          staked,
          index,
          points,
          totalPoints,
        });
      } else if (normalizeStructTag(type) === stakeMarketCoinTypes.ssui) {
        stakeAccounts.ssui.push({
          id,
          type: normalizeStructTag(type),
          stakePoolId,
          stakeType: normalizeStructTag(stakeType),
          staked,
          index,
          points,
          totalPoints,
        });
      } else if (normalizeStructTag(type) === stakeMarketCoinTypes.susdc) {
        stakeAccounts.susdc.push({
          id,
          type: normalizeStructTag(type),
          stakePoolId,
          stakeType: normalizeStructTag(stakeType),
          staked,
          index,
          points,
          totalPoints,
        });
      } else if (normalizeStructTag(type) === stakeMarketCoinTypes.susdt) {
        stakeAccounts.susdt.push({
          id,
          type: normalizeStructTag(type),
          stakePoolId,
          stakeType: normalizeStructTag(stakeType),
          staked,
          index,
          points,
          totalPoints,
        });
      } else if (normalizeStructTag(type) === stakeMarketCoinTypes.scetus) {
        stakeAccounts.scetus.push({
          id,
          type: normalizeStructTag(type),
          stakePoolId,
          stakeType: normalizeStructTag(stakeType),
          staked,
          index,
          points,
          totalPoints,
        });
      } else if (normalizeStructTag(type) === stakeMarketCoinTypes.safsui) {
        stakeAccounts.safsui.push({
          id,
          type: normalizeStructTag(type),
          stakePoolId,
          stakeType: normalizeStructTag(stakeType),
          staked,
          index,
          points,
          totalPoints,
        });
      } else if (normalizeStructTag(type) === stakeMarketCoinTypes.shasui) {
        stakeAccounts.shasui.push({
          id,
          type: normalizeStructTag(type),
          stakePoolId,
          stakeType: normalizeStructTag(stakeType),
          staked,
          index,
          points,
          totalPoints,
        });
      } else if (normalizeStructTag(type) === stakeMarketCoinTypes.svsui) {
        stakeAccounts.svsui.push({
          id,
          type: normalizeStructTag(type),
          stakePoolId,
          stakeType: normalizeStructTag(stakeType),
          staked,
          index,
          points,
          totalPoints,
        });
      }
    }
  });
  return stakeAccounts;
};

/**
 * Get stake pool data.
 *
 * @description
 * For backward compatible, it is recommended to use `getSpool` method
 * to get stake pool info in spool data.
 *
 * @param query - The Scallop query instance.
 * @param marketCoinName - Specific support stake market coin name.
 * @return Stake pool data.
 */
export const getStakePool = async (query: ScallopQuery, marketCoinName: SupportStakeMarketCoins) => {
  const poolId = query.address.get(`spool.pools.${marketCoinName}.id`);
  let stakePool: StakePool | undefined;
  const stakePoolObjectResponse = await query.client.getObject({
    id: poolId,
    options: {
      showContent: true,
      showType: true,
    },
  });
  if (stakePoolObjectResponse.data) {
    const stakePoolObject = stakePoolObjectResponse.data;
    const id = stakePoolObject.objectId;
    const type = stakePoolObject.type!;
    if (stakePoolObject.content && 'fields' in stakePoolObject.content) {
      const fields = stakePoolObject.content.fields as any;
      const maxPoint = Number(fields.max_distributed_point);
      const distributedPoint = Number(fields.distributed_point);
      const pointPerPeriod = Number(fields.distributed_point_per_period);
      const period = Number(fields.point_distribution_time);
      const maxStake = Number(fields.max_stakes);
      const stakeType = String(fields.stake_type.fields.name);
      const totalStaked = Number(fields.stakes);
      const index = Number(fields.index);
      const createdAt = Number(fields.created_at);
      const lastUpdate = Number(fields.last_update);
      stakePool = {
        id,
        type: normalizeStructTag(type),
        maxPoint,
        distributedPoint,
        pointPerPeriod,
        period,
        maxStake,
        stakeType: normalizeStructTag(stakeType),
        totalStaked,
        index,
        createdAt,
        lastUpdate,
      };
    }
  }
  return stakePool;
};

/**
 * Get stake reward pool of the owner.
 *
 * @description
 * For backward compatible, it is recommended to use `getSpool` method
 * to get reward info in spool data.
 *
 * @param query - The Scallop query instance.
 * @param marketCoinName - Specific support stake market coin name.
 * @return Stake reward pool.
 */
export const getStakeRewardPool = async (query: ScallopQuery, marketCoinName: SupportStakeMarketCoins) => {
  const poolId = query.address.get(`spool.pools.${marketCoinName}.rewardPoolId`);
  let stakeRewardPool: StakeRewardPool | undefined;
  const stakeRewardPoolObjectResponse = await query.client.getObject({
    id: poolId,
    options: {
      showContent: true,
      showType: true,
    },
  });
  if (stakeRewardPoolObjectResponse.data) {
    const stakeRewardPoolObject = stakeRewardPoolObjectResponse.data;
    const id = stakeRewardPoolObject.objectId;
    const type = stakeRewardPoolObject.type!;
    if (stakeRewardPoolObject.content && 'fields' in stakeRewardPoolObject.content) {
      const rewardPoolFields = stakeRewardPoolObject.content.fields as any;
      const stakePoolId = String(rewardPoolFields.spool_id);
      const ratioNumerator = Number(rewardPoolFields.exchange_rate_numerator);
      const ratioDenominator = Number(rewardPoolFields.exchange_rate_denominator);
      const rewards = Number(rewardPoolFields.rewards);
      const claimedRewards = Number(rewardPoolFields.claimed_rewards);

      stakeRewardPool = {
        id,
        type: normalizeStructTag(type),
        stakePoolId,
        ratioNumerator,
        ratioDenominator,
        rewards,
        claimedRewards,
      };
    }
  }
  return stakeRewardPool;
};
