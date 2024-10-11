import type { TransactionBlock, TransactionObjectInput, TransactionResult } from '@mysten/sui.js/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui.js/utils';

import { DeepBookContract, DeepBookHelperContract, DeepBookModuleAndMethod, DeepBookPools } from './contract';
// eslint-disable-next-line import/no-cycle
import { ScallopUtils } from '../../models';

type CoinType = 'sui' | 'wusdc' | 'wusdt' | 'usdc';

const SUI_CLOCK_OBJECT = {
  objectId: SUI_CLOCK_OBJECT_ID,
  initialSharedVersion: '1',
  mutable: false,
};

const getDeepBookPool = (coinAName: CoinType, coinBName: CoinType) => {
  if (coinAName === 'sui') {
    switch (coinBName) {
      case 'wusdc':
        return {
          pool: DeepBookPools.pools.sui2usdc,
          aToB: true,
        };
      default:
        throw new Error(`Invalid coin pair: ${coinAName} and ${coinBName}`);
    }
  } else if (coinAName === 'wusdc') {
    switch (coinBName) {
      case 'sui':
        return {
          pool: DeepBookPools.pools.sui2usdc,
          aToB: false,
        };
      case 'wusdt':
        return {
          pool: DeepBookPools.pools.usdt2usdc,
          aToB: false,
        };
      case 'usdc':
        return {
          pool: DeepBookPools.pools.wusdc2usdc,
          aToB: true,
        };
      default:
        throw new Error(`Invalid coin pair: ${coinAName} and ${coinBName}`);
    }
  } else if (coinAName === 'wusdt') {
    switch (coinBName) {
      case 'wusdc':
        return {
          pool: DeepBookPools.pools.usdt2usdc,
          aToB: true,
        };
      default:
        throw new Error(`Invalid coin pair: ${coinAName} and ${coinBName}`);
    }
  } else {
    throw new Error(`Invalid coin pair: ${coinAName} and ${coinBName}`);
  }
};

export const DeepBookTxBuilder = {
  createAccount: (tx: TransactionBlock) =>
    tx.moveCall({
      target: `${DeepBookContract.id}::${DeepBookModuleAndMethod.clob_v2.create_account}`,
      arguments: [],
      typeArguments: [],
    }),
  swap: (
    tx: TransactionBlock,
    tokenInObject: TransactionObjectInput,
    baseCoinName: CoinType,
    quoteCoinName: CoinType,
    clientOrderId: number,
    accountCap: TransactionResult | string | { digest: string; objectId: string; version: string | number | bigint },
    scallopUtils: ScallopUtils,
  ) => {
    // determine the pool
    const { pool, aToB } = getDeepBookPool(baseCoinName, quoteCoinName);
    const coinAType = scallopUtils.parseCoinType(baseCoinName);
    const coinBType = scallopUtils.parseCoinType(quoteCoinName);
    const parsedAccountCap =
      // eslint-disable-next-line no-nested-ternary
      typeof accountCap === 'string'
        ? tx.object(accountCap)
        : 'objectId' in accountCap
          ? tx.objectRef(accountCap)
          : tx.object(accountCap);
    if (!pool) {
      throw new Error(`Deepbook: No pool found for ${baseCoinName} to ${quoteCoinName}`);
    }
    if (aToB) {
      return tx.moveCall({
        target: `${DeepBookHelperContract.id}::deepbook::deepbook_base_for_quote`,
        arguments: [
          tx.sharedObjectRef(pool.object),
          tx.pure(clientOrderId),
          parsedAccountCap,
          tx.object(tokenInObject),
          tx.sharedObjectRef(SUI_CLOCK_OBJECT),
          tx.pure(pool.lotsize),
        ],
        typeArguments: [coinAType, coinBType],
      });
    }
    return tx.moveCall({
      target: `${DeepBookHelperContract.id}::deepbook::deepbook_quote_for_base`,
      arguments: [
        tx.sharedObjectRef(pool.object),
        tx.pure(clientOrderId),
        parsedAccountCap,
        tx.sharedObjectRef(SUI_CLOCK_OBJECT),
        tx.object(tokenInObject),
        tx.pure(pool.lotsize),
      ],
      typeArguments: [coinBType, coinAType],
    });
  },
};
