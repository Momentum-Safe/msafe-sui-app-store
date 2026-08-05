import { MmtSDK, TickMath } from '@mmt-finance/clmm-sui-sdk';
import { Transaction } from '@mysten/sui/transactions';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';

import type { MsafeSuiGrpcClient } from '@/lib/suiGrpcClient';

import { getExactCoinByAmount, normalizeSuiCoinType } from './common';
import { claimV3Rewards } from './reward';
import { V3PositionType, NormalizedPool } from '../types';
// eslint-disable-next-line import/no-cycle

function signedShiftRight(n0: BN, shiftBy: number, bitWidth: number) {
  const twoN0 = n0.toTwos(bitWidth).shrn(shiftBy);
  twoN0.imaskn(bitWidth - shiftBy + 1);
  return twoN0.fromTwos(bitWidth - shiftBy);
}

function tickIndexToSqrtPricePositive(tick: number) {
  let ratio: BN;

  if ((tick & 1) !== 0) {
    ratio = new BN('79232123823359799118286999567');
  } else {
    ratio = new BN('79228162514264337593543950336');
  }

  if ((tick & 2) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('79236085330515764027303304731')), 96, 256);
  }
  if ((tick & 4) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('79244008939048815603706035061')), 96, 256);
  }
  if ((tick & 8) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('79259858533276714757314932305')), 96, 256);
  }
  if ((tick & 16) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('79291567232598584799939703904')), 96, 256);
  }
  if ((tick & 32) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('79355022692464371645785046466')), 96, 256);
  }
  if ((tick & 64) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('79482085999252804386437311141')), 96, 256);
  }
  if ((tick & 128) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('79736823300114093921829183326')), 96, 256);
  }
  if ((tick & 256) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('80248749790819932309965073892')), 96, 256);
  }
  if ((tick & 512) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('81282483887344747381513967011')), 96, 256);
  }
  if ((tick & 1024) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('83390072131320151908154831281')), 96, 256);
  }
  if ((tick & 2048) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('87770609709833776024991924138')), 96, 256);
  }
  if ((tick & 4096) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('97234110755111693312479820773')), 96, 256);
  }
  if ((tick & 8192) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('119332217159966728226237229890')), 96, 256);
  }
  if ((tick & 16384) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('179736315981702064433883588727')), 96, 256);
  }
  if ((tick & 32768) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('407748233172238350107850275304')), 96, 256);
  }
  if ((tick & 65536) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('2098478828474011932436660412517')), 96, 256);
  }
  if ((tick & 131072) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('55581415166113811149459800483533')), 96, 256);
  }
  if ((tick & 262144) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('38992368544603139932233054999993551')), 96, 256);
  }

  return signedShiftRight(ratio, 32, 256);
}

function tickIndexToSqrtPriceNegative(tickIndex: number) {
  const tick = Math.abs(tickIndex);
  let ratio: BN;

  if ((tick & 1) !== 0) {
    ratio = new BN('18445821805675392311');
  } else {
    ratio = new BN('18446744073709551616');
  }

  if ((tick & 2) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('18444899583751176498')), 64, 256);
  }
  if ((tick & 4) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('18443055278223354162')), 64, 256);
  }
  if ((tick & 8) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('18439367220385604838')), 64, 256);
  }
  if ((tick & 16) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('18431993317065449817')), 64, 256);
  }
  if ((tick & 32) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('18417254355718160513')), 64, 256);
  }
  if ((tick & 64) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('18387811781193591352')), 64, 256);
  }
  if ((tick & 128) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('18329067761203520168')), 64, 256);
  }
  if ((tick & 256) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('18212142134806087854')), 64, 256);
  }
  if ((tick & 512) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('17980523815641551639')), 64, 256);
  }
  if ((tick & 1024) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('17526086738831147013')), 64, 256);
  }
  if ((tick & 2048) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('16651378430235024244')), 64, 256);
  }
  if ((tick & 4096) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('15030750278693429944')), 64, 256);
  }
  if ((tick & 8192) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('12247334978882834399')), 64, 256);
  }
  if ((tick & 16384) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('8131365268884726200')), 64, 256);
  }
  if ((tick & 32768) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('3584323654723342297')), 64, 256);
  }
  if ((tick & 65536) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('696457651847595233')), 64, 256);
  }
  if ((tick & 131072) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('26294789957452057')), 64, 256);
  }
  if ((tick & 262144) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN('37481735321082')), 64, 256);
  }

  return ratio;
}

export const tickIndexToSqrtPriceX64 = (tickIndex: number, tickSpacing: number, scaleUp?: boolean): BN => {
  const signedTick = TickMath.convertI32ToSigned(
    scaleUp ? tickIndex + (tickIndex % (tickSpacing ?? 1)) : tickIndex - (tickIndex % (tickSpacing ?? 1)),
  );
  if (signedTick > 0) {
    return new BN(tickIndexToSqrtPricePositive(signedTick));
  }
  return new BN(tickIndexToSqrtPriceNegative(signedTick));
};

export function toBaseUnits(amount: string, decimals: number): bigint {
  if (!/^(\d+)(\.\d+)?$/.test(amount)) {
    return BigInt(0);
  }
  const [whole, fraction = ''] = amount.split('.');
  const fractionPadded = (fraction + '0'.repeat(decimals)).slice(0, decimals);
  const baseStr = whole + fractionPadded;
  const baseStrClean = baseStr.replace(/^0+/, '') || '0';
  return BigInt(baseStrClean);
}

export async function getCoinObject({
  address,
  coinType,
  coinAmount,
  coinDecimals,
  tx,
  mmt,
}: {
  mmt: MmtSDK;
  address: string;
  coinAmount: string;
  coinType: string;
  coinDecimals: number;
  tx: Transaction;
}) {
  const amount = toBaseUnits(coinAmount, coinDecimals);
  let inputCoin;
  if (!Number(coinAmount)) {
    [inputCoin] = tx.moveCall({
      target: `0x2::coin::zero`,
      typeArguments: [coinType],
      arguments: [],
    });
  } else {
    inputCoin = await getExactCoinByAmount(mmt, address, normalizeSuiCoinType(coinType), amount, tx);
  }
  return inputCoin;
}

export function getNewPositionObject({
  mmt,
  tx,
  poolModel,
  selectedLowTick,
  selectedHighTick,
}: {
  mmt: MmtSDK;
  tx: Transaction;
  poolModel: {
    poolId: string;
    tokenXType: string;
    tokenYType: string;
    tickSpacing: number;
    isStable?: boolean;
  };
  selectedLowTick: number;
  selectedHighTick: number;
}) {
  const lowerTickSqrtPrice = tickIndexToSqrtPriceX64(
    TickMath.convertI32ToSigned(selectedLowTick),
    poolModel.tickSpacing!,
  );
  const upperTickSqrtPrice = tickIndexToSqrtPriceX64(
    TickMath.convertI32ToSigned(selectedHighTick),
    poolModel.tickSpacing!,
  );

  return mmt.Position.openPosition({
    txb: tx,
    pool: poolModel,
    lowerTickSqrtPrice: lowerTickSqrtPrice.toString(),
    upperTickSqrtPrice: upperTickSqrtPrice.toString(),
  });
}

const getResultAmountUsingSlippage = (amount: bigint, slippagePercentage: number) => {
  const basisPoints = Math.floor(slippagePercentage * 100); // 0.5% -> 50 basis points
  const remainingBasisPoints = 10000 - basisPoints; // 10000 - 50 = 9950

  return (amount * BigInt(remainingBasisPoints)) / BigInt(10000);
};

export function getMinimalAmountUsingSlippage(
  coinAmount: string,
  decimals: number,
  slippage: number, // (0, 100), 1 = 1%
): bigint {
  const amount = toBaseUnits(coinAmount, decimals);

  if (Number(coinAmount) === 0) {
    return BigInt(0);
  }

  const minimalAmount = getResultAmountUsingSlippage(amount, slippage);
  return minimalAmount;
}

export async function getLimitSqrtPriceUsingSlippage({
  poolId,
  currentSqrtPrice,
  tokenX,
  tokenY,
  slippagePercentage,
  isTokenX,
  suiClient,
}: Pick<NormalizedPool, 'currentSqrtPrice' | 'tokenX' | 'tokenY'> & {
  slippagePercentage: number; // 1 = 1% slippage
  isTokenX: boolean;
  suiClient: Pick<MsafeSuiGrpcClient, 'getObject'>;
  poolId: string;
}) {
  // Align with mmt-dex-v3: gRPC object.json exposes Move fields at the top level.
  const { object: rpcPool } = await suiClient.getObject({
    objectId: poolId,
    include: { json: true },
  });

  const rpcPoolCurrentPrice =
    (rpcPool?.json as { sqrt_price?: unknown } | null | undefined)?.sqrt_price ?? currentSqrtPrice;

  const currentPrice = TickMath.sqrtPriceX64ToPrice(
    new BN(rpcPoolCurrentPrice?.toString()),
    tokenX.decimals,
    tokenY.decimals,
  );

  const minReceiveRate = isTokenX ? (100 - slippagePercentage) / 100 : (100 + slippagePercentage) / 100;

  const limitSqrtPrice = TickMath.priceToSqrtPriceX64(
    currentPrice.mul(minReceiveRate),
    tokenX.decimals,
    tokenY.decimals,
  );

  return BigInt(limitSqrtPrice.toString());
}

/** ========================================== add liquidity to new position ================================================ */
export const executeClmmDeposit = async (
  mmt: MmtSDK,
  tx: Transaction,
  address: string,
  amountA: string,
  amountB: string,
  pool: NormalizedPool,
  poolId: string,
  selectedLowTick: number,
  selectedHighTick: number,
  slippage: number,
) => {
  const inputCoinX = await getCoinObject({
    mmt,
    address,
    coinType: pool.tokenX.coinType,
    coinAmount: amountA,
    coinDecimals: pool.tokenX.decimals,
    tx,
  });

  const inputCoinY = await getCoinObject({
    mmt,
    address,
    coinType: pool.tokenY.coinType,
    coinAmount: amountB,
    coinDecimals: pool.tokenY.decimals,
    tx,
  });

  const poolModel = {
    poolId,
    tokenXType: pool.tokenXType,
    tokenYType: pool.tokenYType,
    tickSpacing: pool.tickSpacing,
    isStable: pool.isStable,
  };

  const position = getNewPositionObject({
    mmt,
    tx,
    poolModel,
    selectedLowTick,
    selectedHighTick,
  });

  const minimalAmountA = getMinimalAmountUsingSlippage(amountA, pool.tokenX.decimals, slippage);
  const minimalAmountB = getMinimalAmountUsingSlippage(amountB, pool.tokenY.decimals, slippage);

  await mmt.Pool.addLiquidity({
    txb: tx,
    pool: poolModel,
    position: position!,
    coinX: inputCoinX!,
    coinY: inputCoinY!,
    minAmountX: minimalAmountA,
    minAmountY: minimalAmountB,
    transferToAddress: address,
    useMvr: true,
  });
  tx.transferObjects([position!], tx.pure.address(address));
};

export const executeSingleSidedClmmDeposit = async (
  mmt: MmtSDK,
  tx: Transaction,
  suiClient: Pick<MsafeSuiGrpcClient, 'getObject'>,
  address: string,
  amount: string,
  isTokenX: boolean,
  pool: NormalizedPool,
  selectedLowTick: number,
  selectedHighTick: number,
  swapSlippage: number,
  addLiquiditySlippage: number,
) => {
  try {
    const inputCoin = await getCoinObject({
      mmt,
      address,
      coinType: isTokenX ? pool.tokenX.coinType : pool.tokenY.coinType,
      coinAmount: amount,
      coinDecimals: isTokenX ? pool.tokenX.decimals : pool.tokenY.decimals,
      tx,
    });

    const poolModel = {
      poolId: pool.poolId,
      tokenXType: normalizeSuiCoinType(pool.tokenX.coinType),
      tokenYType: normalizeSuiCoinType(pool.tokenY.coinType),
      tickSpacing: pool.tickSpacing,
      isStable: pool.isStable,
    };

    const position = getNewPositionObject({
      mmt,
      tx,
      poolModel,
      selectedLowTick,
      selectedHighTick,
    });

    const limitSqrtPrice = await getLimitSqrtPriceUsingSlippage({
      suiClient,
      poolId: pool.poolId,
      currentSqrtPrice: pool.currentSqrtPrice,
      tokenX: pool.tokenX,
      tokenY: pool.tokenY,
      slippagePercentage: swapSlippage,
      isTokenX,
    });

    await mmt.Pool.zapInLiquidity({
      txb: tx,
      pool: poolModel,
      position: position!,
      inputCoin,
      isXtoY: isTokenX,
      limitSqrtPrice,
      slippagePercentage: addLiquiditySlippage,
      transferToAddress: address,
      useMvr: true,
    });

    tx.transferObjects([position!], tx.pure.address(address));
  } catch (error) {
    console.error(error);
  }
};

/** ======================== add liquidity to existing position ========================== */
export const executeAddLiquidityToExistingPosition = async (
  mmt: MmtSDK,
  tx: Transaction,
  address: string,
  amountA: string,
  amountB: string,
  pool: NormalizedPool,
  positionObjectId: string,
  slippage: number,
) => {
  const inputCoinX = await getCoinObject({
    mmt,
    address,
    coinType: pool.tokenX.coinType,
    coinAmount: amountA,
    coinDecimals: pool.tokenX.decimals,
    tx,
  });

  const inputCoinY = await getCoinObject({
    mmt,
    address,
    coinType: pool.tokenY.coinType,
    coinAmount: amountB,
    coinDecimals: pool.tokenY.decimals,
    tx,
  });

  const poolModel = {
    poolId: pool.poolId,
    tokenXType: pool.tokenXType,
    tokenYType: pool.tokenYType,
    tickSpacing: pool.tickSpacing,
    isStable: pool.isStable,
  };

  const minimalXAmount = getMinimalAmountUsingSlippage(amountA, pool.tokenX.decimals, slippage);
  const minimalYAmount = getMinimalAmountUsingSlippage(amountB, pool.tokenY.decimals, slippage);

  await mmt.Pool.addLiquidity({
    txb: tx,
    pool: poolModel,
    position: positionObjectId,
    coinX: inputCoinX,
    coinY: inputCoinY,
    minAmountX: minimalXAmount,
    minAmountY: minimalYAmount,
    transferToAddress: address,
  });
};

export const executeAddSingleSidedLiquidityToExistingPosition = async (
  mmt: MmtSDK,
  tx: Transaction,
  address: string,
  amount: string,
  isTokenX: boolean,
  pool: NormalizedPool,
  positionObjectId: string,
  swapSlippage: number,
  addLiquiditySlippage: number,
) => {
  try {
    const inputCoin = await getCoinObject({
      mmt,
      address,
      coinType: isTokenX ? pool.tokenX.coinType : pool.tokenY.coinType,
      coinAmount: amount,
      coinDecimals: isTokenX ? pool.tokenX.decimals : pool.tokenY.decimals,
      tx,
    });

    const poolModel = {
      poolId: pool.poolId,
      tokenXType: pool.tokenX.coinType,
      tokenYType: pool.tokenY.coinType,
      tickSpacing: pool.tickSpacing,
      isStable: pool.isStable,
    };

    const limitSqrtPrice = await getLimitSqrtPriceUsingSlippage({
      suiClient: mmt.rpcClient,
      poolId: pool.poolId,
      currentSqrtPrice: pool.currentSqrtPrice,
      tokenX: pool.tokenX,
      tokenY: pool.tokenY,
      slippagePercentage: swapSlippage,
      isTokenX,
    });

    await mmt.Pool.zapInLiquidity({
      txb: tx,
      pool: poolModel,
      position: positionObjectId,
      inputCoin,
      isXtoY: isTokenX,
      limitSqrtPrice,
      slippagePercentage: addLiquiditySlippage,
      transferToAddress: address,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getLiquidityAmountByPercentage = (liquidity: string, percentage: number) =>
  BigInt(percentage === 100 ? liquidity : new BigNumber(liquidity).multipliedBy(percentage / 100).toFixed(0));

export const removeClmmLiquidity = async (
  sdk: MmtSDK,
  address: string,
  position: V3PositionType,
  pool: NormalizedPool,
  withdrawPercentage: number,
  tx: Transaction,
): Promise<void> => {
  const removeLiqAmount = getLiquidityAmountByPercentage(position.liquidity, withdrawPercentage);
  const typeX = pool.tokenX.coinType;
  const typeY = pool.tokenY.coinType;

  const poolModel = {
    poolId: pool.poolId,
    tokenXType: typeX,
    tokenYType: typeY,
    tickSpacing: pool.tickSpacing,
    isStable: pool.isStable,
  };

  await sdk.Pool.removeLiquidity({
    txb: tx,
    pool: poolModel,
    positionId: position.objectId,
    liquidity: removeLiqAmount,
    minAmountX: BigInt(0),
    minAmountY: BigInt(0),
    transferToAddress: address,
  });

  claimV3Rewards(sdk, address, position, pool, tx);

  if (withdrawPercentage === 100) {
    sdk.Position.closePosition({
      txb: tx,
      positionId: position.objectId,
    });
  }
};

export const removeLiquiditySingleSided = async ({
  sdk,
  address,
  position,
  pool,
  withdrawPercentage,
  txb,
  targetCoinType,
  slippage,
}: {
  sdk: MmtSDK;
  address: string;
  position: V3PositionType;
  pool: NormalizedPool;
  withdrawPercentage: number;
  txb: Transaction;
  targetCoinType: string;
  slippage: number;
}) => {
  const removeLiqAmount = getLiquidityAmountByPercentage(position.liquidity, withdrawPercentage);

  const typeX = normalizeSuiCoinType(pool.tokenX.coinType);
  const typeY = normalizeSuiCoinType(pool.tokenY.coinType);
  const isSwapXToY = normalizeSuiCoinType(targetCoinType) === typeY;

  const poolModel = {
    poolId: pool.poolId,
    tokenXType: typeX,
    tokenYType: typeY,
    tickSpacing: pool.tickSpacing,
    isStable: pool.isStable,
  };

  const removeResult = sdk.Pool.removeLiquidity({
    txb,
    pool: poolModel,
    positionId: position.objectId,
    liquidity: removeLiqAmount,
    minAmountX: BigInt(0),
    minAmountY: BigInt(0),
  });
  const removeLpCoinA = removeResult?.removeLpCoinA;
  const removeLpCoinB = removeResult?.removeLpCoinB;

  if (!removeLpCoinA || !removeLpCoinB) {
    throw new Error('Remove liquidity Failed: empty remove result');
  }

  const limitSqrtPrice = await getLimitSqrtPriceUsingSlippage({
    suiClient: sdk.rpcClient,
    poolId: pool.poolId,
    currentSqrtPrice: pool.currentSqrtPrice,
    tokenX: pool.tokenX,
    tokenY: pool.tokenY,
    isTokenX: isSwapXToY,
    slippagePercentage: slippage,
  });

  const inputCoin = isSwapXToY ? removeLpCoinA : removeLpCoinB;

  const amount = txb.moveCall({
    target: '0x2::coin::value',
    arguments: [inputCoin],
    typeArguments: [isSwapXToY ? typeX : typeY],
  });

  txb.transferObjects([isSwapXToY ? removeLpCoinB : removeLpCoinA], address);

  sdk.Pool.swap({
    txb,
    transferToAddress: address,
    pool: poolModel,
    limitSqrtPrice,
    amount,
    inputCoin,
    isXtoY: isSwapXToY,
  });

  claimV3Rewards(sdk, address, position, pool, txb);

  if (withdrawPercentage === 100) {
    sdk.Position.closePosition({
      txb,
      positionId: position.objectId,
    });
  }
};
