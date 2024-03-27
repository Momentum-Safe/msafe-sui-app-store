import { TransactionBlock } from '@mysten/sui.js/transactions';

import config from '../config';
import { OptionType, PoolConfig } from '../types';

export function depositToken(txb: TransactionBlock, pool: PoolConfig, coinObject: any, amount: number) {
  txb.moveCall({
    target: `${config.ProtocolPackage}::incentive_v2::entry_deposit`,
    arguments: [
      txb.object('0x06'),
      txb.object(config.StorageId),
      txb.object(pool.poolId),
      txb.pure(pool.assetId),
      coinObject,
      txb.pure(amount),
      txb.object(config.Incentive),
      txb.object(config.IncentiveV2),
    ],
    typeArguments: [pool.type],
  });
  return txb;
}

export function withdrawToken(txb: TransactionBlock, pool: PoolConfig, amount: number) {
  txb.moveCall({
    target: `${config.ProtocolPackage}::incentive_v2::entry_withdraw`,
    arguments: [
      txb.object('0x06'),
      txb.object(config.PriceOracle),
      txb.object(config.StorageId),
      txb.object(pool.poolId),
      txb.pure(pool.assetId),
      txb.pure(amount),
      txb.object(config.Incentive),
      txb.object(config.IncentiveV2),
    ],
    typeArguments: [pool.type],
  });
  return txb;
}

export function borrowToken(txb: TransactionBlock, pool: PoolConfig, amount: number) {
  txb.moveCall({
    target: `${config.ProtocolPackage}::incentive_v2::entry_borrow`,
    arguments: [
      txb.object('0x06'),
      txb.object(config.PriceOracle),
      txb.object(config.StorageId),
      txb.object(pool.poolId),
      txb.pure(pool.assetId),
      txb.pure(amount),
      txb.object(config.IncentiveV2),
    ],
    typeArguments: [pool.type],
  });
  return txb;
}

export function repayToken(txb: TransactionBlock, pool: PoolConfig, coinObject: any, amount: number) {
  txb.moveCall({
    target: `${config.ProtocolPackage}::incentive_v2::entry_repay`,
    arguments: [
      txb.object('0x06'),
      txb.object(config.PriceOracle),
      txb.object(config.StorageId),
      txb.object(pool.poolId),
      txb.pure(pool.assetId),
      coinObject,
      txb.pure(amount),
      txb.object(config.IncentiveV2),
    ],
    typeArguments: [pool.type],
  });
  return txb;
}

export function claimReward(txb: TransactionBlock, pool: PoolConfig, option: OptionType, typeArguments: string[]) {
  const rewardPool = Object.values(config.pool).find((p) => typeArguments.includes(p.type));
  txb.moveCall({
    target: `${config.ProtocolPackage}::incentive_v2::claim_reward`,
    arguments: [
      txb.object('0x06'),
      txb.object(config.IncentiveV2),
      txb.object(rewardPool.fondPoolId),
      txb.object(config.StorageId),
      txb.pure(pool.assetId),
      txb.pure(option),
    ],
    typeArguments,
  });
  return txb;
}
