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

export function borrowToken(tx: TransactionBlock, pool: PoolConfig, amount: number, userAddress: string) {
  const borrowBalance = tx.moveCall({
    target: `${config.ProtocolPackage}::incentive_v2::borrow`,
    arguments: [
      tx.object('0x06'),
      tx.object(config.PriceOracle),
      tx.object(config.StorageId),
      tx.object(pool.poolId),
      tx.pure(pool.assetId),
      tx.pure(amount),
      tx.object(config.IncentiveV2),
    ],
    typeArguments: [pool.type],
  });

  const [borrowCoin] = tx.moveCall({
    target: `0x02::coin::from_balance`,
    typeArguments: [pool.type],
    arguments: [borrowBalance],
  });
  if (config.borrowFee > 0) {
    const [borrowFeeCoin] = tx.splitCoins(borrowCoin, [tx.pure(Math.floor(amount * config.borrowFee))]);
    tx.transferObjects([borrowCoin], tx.pure(userAddress));
    tx.transferObjects([borrowFeeCoin], tx.pure(config.borrowFeeAddress));
  } else {
    tx.transferObjects([borrowCoin], tx.pure(userAddress));
  }

  return tx;
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

export function claimReward(
  txb: TransactionBlock,
  assetId: number,
  poolId: string,
  option: OptionType,
  typeArguments: string[],
) {
  txb.moveCall({
    target: `${config.ProtocolPackage}::incentive_v2::claim_reward`,
    arguments: [
      txb.object('0x06'),
      txb.object(config.IncentiveV2),
      txb.object(poolId),
      txb.object(config.StorageId),
      txb.pure(assetId),
      txb.pure(option),
    ],
    typeArguments,
  });
  return txb;
}
