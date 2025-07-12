/* eslint-disable no-bitwise */
import { MmtSDK } from '@mmt-finance/clmm-sdk';
import { convertI32ToSigned, TickMath } from '@mmt-finance/clmm-sdk/dist/utils/math/tickMath';
import { SuiClient } from '@mysten/sui/dist/cjs/client';
import { Transaction } from '@mysten/sui/transactions';
import BN from 'bn.js';

import { getExactCoinByAmount, normalizeSuiCoinType } from './common';
import { NormalizedPool } from './swap';

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
  const signedTick = convertI32ToSigned(
    scaleUp ? tickIndex + (tickIndex % (tickSpacing ?? 1)) : tickIndex - (tickIndex % (tickSpacing ?? 1)),
  );
  if (signedTick > 0) {
    return new BN(tickIndexToSqrtPricePositive(signedTick));
  }
  return new BN(tickIndexToSqrtPriceNegative(signedTick));
};

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
) => {
  const lowerTickSqrtPrice = tickIndexToSqrtPriceX64(convertI32ToSigned(selectedLowTick), pool.tickSpacing);

  const upperTickSqrtPrice = tickIndexToSqrtPriceX64(convertI32ToSigned(selectedHighTick), pool.tickSpacing);

  const inputAmountA = BigInt(Math.ceil(Number(amountA) * 10 ** pool.tokenX.decimals));

  const inputAmountB = BigInt(Math.ceil(Number(amountB) * 10 ** pool.tokenY.decimals));

  let inputCoinX;
  let inputCoinY;

  if (!Number(amountA)) {
    [inputCoinX] = tx.moveCall({
      target: `0x2::coin::zero`,
      typeArguments: [pool.tokenX.coinType],
      arguments: [],
    });
  } else {
    inputCoinX = await getExactCoinByAmount(mmt, address, normalizeSuiCoinType(pool.tokenX.coinType), inputAmountA, tx);
  }

  if (!Number(amountB)) {
    [inputCoinY] = tx.moveCall({
      target: `0x2::coin::zero`,
      typeArguments: [pool.tokenY.coinType],
      arguments: [],
    });
  } else {
    inputCoinY = await getExactCoinByAmount(mmt, address, normalizeSuiCoinType(pool.tokenY.coinType), inputAmountB, tx);
  }

  const poolModel = {
    objectId: poolId,
    tokenXType: pool.tokenXType,
    tokenYType: pool.tokenYType,
    tickSpacing: pool.tickSpacing,
  };

  const position = mmt.Position.openPosition(
    tx,
    poolModel,
    lowerTickSqrtPrice.toString(),
    upperTickSqrtPrice.toString(),
  );

  mmt.Pool.addLiquidity(tx, poolModel, position, inputCoinX!, inputCoinY!, BigInt(0), BigInt(0), address);

  tx.transferObjects([position], tx.pure.address(address));
};

export const executeSingleSidedClmmDeposit = async (
  mmt: MmtSDK,
  tx: Transaction,
  suiClient: SuiClient,
  address: string,
  amount: string,
  isTokenX: boolean,
  pool: NormalizedPool,
  selectedLowTick: number,
  selectedHighTick: number,
) => {
  try {
    const inputCoinAmount = BigInt(
      Math.ceil(Number(amount) * 10 ** (isTokenX ? pool.tokenX.decimals : pool.tokenY.decimals)),
    );

    let inputCoinType = isTokenX ? pool.tokenX.coinType : pool.tokenY.coinType;
    inputCoinType = normalizeSuiCoinType(inputCoinType);

    const inputCoin = await getExactCoinByAmount(mmt, address, inputCoinType, inputCoinAmount, tx);

    const poolModel = {
      objectId: pool.poolId,
      tokenXType: normalizeSuiCoinType(pool.tokenX.coinType),
      tokenYType: normalizeSuiCoinType(pool.tokenY.coinType),
      tickSpacing: pool.tickSpacing,
    };

    const lowerTickSqrtPrice = tickIndexToSqrtPriceX64(convertI32ToSigned(selectedLowTick), pool.tickSpacing!);

    const upperTickSqrtPrice = tickIndexToSqrtPriceX64(convertI32ToSigned(selectedHighTick), pool.tickSpacing!);

    const position = mmt.Position.openPosition(
      tx,
      poolModel,
      lowerTickSqrtPrice.toString(),
      upperTickSqrtPrice.toString(),
    );

    const rpcPool = await suiClient.getObject({
      id: pool.poolId,
      options: { showContent: true },
    });

    const rpcPoolCurrentPrice = (rpcPool?.data?.content as any)?.fields?.sqrt_price ?? pool.currentSqrtPrice;

    const currentPrice = TickMath.sqrtPriceX64ToPrice(
      new BN(rpcPoolCurrentPrice?.toString()),
      pool.tokenX.decimals,
      pool.tokenY.decimals,
    );

    const limitSqrtPrice = TickMath.priceToSqrtPriceX64(
      currentPrice.mul(isTokenX ? 0.99 : 1.01),
      pool.tokenX.decimals,
      pool.tokenY.decimals,
    );

    await mmt.Pool.addLiquiditySingleSided(
      tx,
      poolModel,
      position,
      inputCoin,
      BigInt(0),
      BigInt(0),
      isTokenX,
      address,
      BigInt(limitSqrtPrice.toString()),
    );

    tx.transferObjects([position], tx.pure.address(address));
  } catch (error) {
    console.error(error);
  }
};
