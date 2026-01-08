/* eslint-disable no-restricted-syntax */
import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { VeMMT } from '@mmt-finance/ve-sdk-v1';
import {
  Transaction,
  TransactionArgument,
  TransactionObjectArgument,
  TransactionObjectInput,
} from '@mysten/sui/transactions';

import { getCoinObject, getLimitSqrtPriceUsingSlippage } from './liquidity';
import { ClaimRoutes, MMT_TOKEN_TYPE, NormalizedPool, Tokens, VeMMTData } from '../types';
import { normalizeSuiCoinType } from './common';

const fetchSyncEpochInfo = async (veMMTSdk: VeMMT) => {
  const syncEpochInfo = await veMMTSdk.getSyncEpochInfo();
  if (!syncEpochInfo) {
    throw new Error('Failed to sync epoch');
  }
  return syncEpochInfo;
};

export const performBond = async (
  mmtSdk: MmtSDK,
  veMMTSdk: VeMMT,
  token: Tokens,
  amount: string,
  address: string,
  enableAutoMaxBond: boolean,
  unbondAt: number | null,
  tx: Transaction,
) => {
  // Validate amount
  const amountNum = Number(amount);
  if (!amount || Number.isNaN(amountNum) || amountNum <= 0) {
    throw new Error(`Bond Failed: Invalid amount: ${amount}. Amount must be greater than 0`);
  }

  if (!enableAutoMaxBond && !unbondAt) {
    throw new Error('Bond Failed: Failed to calculate unbond date');
  }

  if (typeof unbondAt !== 'number' && !enableAutoMaxBond) {
    throw new Error('Bond Failed: Invalid unbond date');
  }

  const coin = await getCoinObject({
    mmt: mmtSdk,
    tx,
    address,
    coinType: token.coinType,
    coinAmount: amount,
    coinDecimals: token.decimals,
  });

  if (!coin) {
    throw new Error(`Bond Failed: Failed to get coin object for ${token.coinType}, amount: ${amount}`);
  }

  const syncEpochInfo = await fetchSyncEpochInfo(veMMTSdk);

  await veMMTSdk.syncOrAdvanceEpoch(tx, syncEpochInfo.currentEpoch, syncEpochInfo.syncedEpoch);

  // Check commands before bond operations
  const commandsBeforeBond = tx.getData().commands.length;

  if (enableAutoMaxBond) {
    await veMMTSdk.createMaxBond(tx, coin as TransactionObjectInput, address);
  } else {
    await veMMTSdk.createBond(tx, coin as TransactionObjectInput, BigInt(unbondAt!), address);
  }

  // Verify that transaction has commands and new commands were added
  const txData = tx.getData();
  const commandsAfterBond = txData.commands.length;

  if (commandsAfterBond === 0) {
    throw new Error(
      `Bond Failed: Transaction has no commands. enableAutoMaxBond: ${enableAutoMaxBond}, unbondAt: ${unbondAt}, amount: ${amount}`,
    );
  }

  if (commandsAfterBond === commandsBeforeBond) {
    throw new Error(
      `Bond Failed: No new commands were added by bond operation. Commands before: ${commandsBeforeBond}, after: ${commandsAfterBond}`,
    );
  }
};

export const performExtend = async (
  veMMTSdk: VeMMT,
  address: string,
  veId: string,
  currentUnbondAt: number,
  isCurrentlyMaxBond: boolean,
  enableAutoMaxBond: boolean,
  unbondAt: number | null,
  tx: Transaction,
) => {
  const syncEpochInfo = await fetchSyncEpochInfo(veMMTSdk);

  await veMMTSdk.syncOrAdvanceEpoch(tx, syncEpochInfo.currentEpoch, syncEpochInfo.syncedEpoch);

  await veMMTSdk.claimReward(tx, veId, address);

  if (isCurrentlyMaxBond) {
    if (!enableAutoMaxBond) {
      await veMMTSdk.setNormal(tx, veId);
    }
  } else if (enableAutoMaxBond) {
    await veMMTSdk.setMaxBond(tx, veId);
  } else {
    if (typeof unbondAt !== 'number') {
      throw new Error('Extend Failed: Failed to calculate unbond date');
    }

    if (unbondAt < currentUnbondAt) {
      throw new Error('Extend Failed: New duration cannot be less than current duration');
    }

    await veMMTSdk.extend(tx, veId, unbondAt);
  }
};

export const performMerge = async (
  veMMTSdk: VeMMT,
  address: string,
  veId: string,
  selectedVeMMTIds: string[],
  tx: Transaction,
) => {
  const syncEpochInfo = await fetchSyncEpochInfo(veMMTSdk);

  await veMMTSdk.syncOrAdvanceEpoch(tx, syncEpochInfo.currentEpoch, syncEpochInfo.syncedEpoch);

  await veMMTSdk.claimReward(tx, veId, address);

  await selectedVeMMTIds.reduce(async (promise, selectedId) => {
    await promise;
    await veMMTSdk.claimReward(tx, selectedId, address);
    await veMMTSdk.merge(tx, veId, selectedId);
  }, Promise.resolve());
};

export const performUnbond = async (veMMTSdk: VeMMT, address: string, veId: string, tx: Transaction) => {
  const syncEpochInfo = await fetchSyncEpochInfo(veMMTSdk);

  await veMMTSdk.syncOrAdvanceEpoch(tx, syncEpochInfo.currentEpoch, syncEpochInfo.syncedEpoch);

  await veMMTSdk.claimReward(tx, veId, address);

  await veMMTSdk.unbond(tx, veId, address);
};

export const claimVeMMTRewards = async (veMMTSdk: VeMMT, address: string, veMMTs: VeMMTData[], tx: Transaction) => {
  if (veMMTs.length > 0 && veMMTs.some((veMMT) => veMMT.userRewardAmount > 0)) {
    const syncEpochInfo = await fetchSyncEpochInfo(veMMTSdk);
    await veMMTSdk.syncOrAdvanceEpoch(tx, syncEpochInfo.currentEpoch, syncEpochInfo.syncedEpoch);
    await veMMTs.reduce(async (promise, veMMTData) => {
      await promise;
      if (veMMTData.userRewardAmount > 0) {
        await veMMTSdk.claimReward(tx, veMMTData.veId, address);
      }
    }, Promise.resolve());
  }
};

export const claimVeMMTRewardsAsTargetCoin = async (
  mmtSdk: MmtSDK,
  veMMTSdk: VeMMT,
  address: string,
  veMMTs: VeMMTData[],
  tx: Transaction,
  targetCoinType: string,
  slippage: number,
  claimRoutes: ClaimRoutes,
  pools: NormalizedPool[],
) => {
  const normalizedTargetCoinType = normalizeSuiCoinType(targetCoinType);

  const coins: TransactionObjectArgument[] = [];
  for (const veMMTData of veMMTs) {
    if (veMMTData.userRewardAmount > 0) {
      const coin = await veMMTSdk.buildClaimRewardCoin(tx, veMMTData.veId);
      coins.push(coin);
    }
  }

  const flatCoins: TransactionArgument[] = [];
  for (const coin of coins) {
    if (Array.isArray(coin)) {
      flatCoins.push(...coin);
    } else {
      flatCoins.push(coin);
    }
  }

  if (flatCoins.length === 0) {
    return;
  }

  if (targetCoinType === normalizeSuiCoinType(MMT_TOKEN_TYPE)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx.transferObjects(flatCoins as any[], tx.pure.address(address));
    return;
  }

  const routes =
    claimRoutes?.[targetCoinType as keyof typeof claimRoutes]?.[
      MMT_TOKEN_TYPE as keyof (typeof claimRoutes)[keyof typeof claimRoutes]
    ];

  if (!routes || routes.length === 0) {
    throw new Error(`No swap route found from ${MMT_TOKEN_TYPE} to ${targetCoinType}`);
  }

  const [primaryCoin, ...otherCoins] = flatCoins;
  if (otherCoins.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx.mergeCoins(primaryCoin as any, otherCoins as any);
  }

  let currentCoin = primaryCoin;
  let currentAmount = tx.moveCall({
    target: '0x2::coin::value',
    arguments: [currentCoin],
    typeArguments: [MMT_TOKEN_TYPE],
  });
  let currentCoinType = normalizeSuiCoinType(MMT_TOKEN_TYPE);

  for (let i = 0; i < routes.length; i++) {
    const poolId = routes[i];
    const swapPool = pools.find((p) => p.poolId === poolId);

    if (!swapPool) {
      throw new Error(`Pool ${poolId} not found`);
    }

    const normalizedTokenX = normalizeSuiCoinType(swapPool.tokenXType || swapPool.tokenX?.coinType || '');
    const isXtoY = normalizedTokenX === currentCoinType;

    const poolModel = {
      objectId: swapPool.poolId,
      tokenXType: swapPool.tokenXType || swapPool.tokenX?.coinType || '',
      tokenYType: swapPool.tokenYType || swapPool.tokenY?.coinType || '',
    };

    const limitSqrtPrice = await getLimitSqrtPriceUsingSlippage({
      suiClient: mmtSdk.rpcClient,
      poolId: swapPool.poolId,
      currentSqrtPrice: swapPool.currentSqrtPrice,
      tokenX: swapPool.tokenX!,
      tokenY: swapPool.tokenY!,
      slippagePercentage: slippage,
      isTokenX: isXtoY,
    });

    const { outputCoin, leftoverCoin } = mmtSdk.Pool.swapV2({
      txb: tx,
      pool: poolModel,
      amount: currentAmount,
      inputCoin: currentCoin,
      isXtoY,
      limitSqrtPrice,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx.transferObjects([leftoverCoin as any], tx.pure.address(address));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentCoin = outputCoin as any;

    currentCoinType = isXtoY
      ? normalizeSuiCoinType(swapPool.tokenYType || swapPool.tokenY?.coinType || '')
      : normalizeSuiCoinType(swapPool.tokenXType || swapPool.tokenX?.coinType || '');

    if (currentCoinType === targetCoinType) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tx.transferObjects([currentCoin as any], tx.pure.address(address));
      return;
    }

    currentAmount = tx.moveCall({
      target: '0x2::coin::value',
      arguments: [currentCoin],
      typeArguments: [currentCoinType],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx.transferObjects([currentCoin as any], tx.pure.address(address));
};
