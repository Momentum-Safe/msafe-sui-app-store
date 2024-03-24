import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui.js/utils';

import type { ScallopBuilder } from '../models';
import type {
  CoreIds,
  GenerateCoreNormalMethod,
  SuiTxBlockWithCoreNormalMethods,
  CoreTxBlock,
  ScallopTxBlock,
} from '../types';

/**
 * Generate core normal methods.
 *
 * @param builder - Scallop builder instance.
 * @param txBlock - TxBlock created by SuiKit.
 * @return Core normal methods.
 */
const generateCoreNormalMethod: GenerateCoreNormalMethod = ({ builder, txBlock }) => {
  const coreIds: CoreIds = {
    protocolPkg: builder.address.get('core.packages.protocol.id'),
    market: builder.address.get('core.market'),
    version: builder.address.get('core.version'),
    coinDecimalsRegistry: builder.address.get('core.coinDecimalsRegistry'),
    xOracle: builder.address.get('core.oracles.xOracle'),
  };
  return {
    openObligation: () =>
      txBlock.moveCall({
        target: `${coreIds.protocolPkg}::open_obligation::open_obligation`,
        arguments: [txBlock.pure(coreIds.version)],
      }),
    returnObligation: (obligation, obligationHotPotato) =>
      txBlock.moveCall({
        target: `${coreIds.protocolPkg}::open_obligation::return_obligation`,
        arguments: [
          txBlock.object(coreIds.version),
          txBlock.object(obligation as string),
          txBlock.object(obligationHotPotato as string),
        ],
      }),
    openObligationEntry: () =>
      txBlock.moveCall({
        target: `${coreIds.protocolPkg}::open_obligation::open_obligation_entry`,
        arguments: [txBlock.object(coreIds.version)],
      }),
    addCollateral: (obligation, coin, collateralCoinName) => {
      const coinType = builder.utils.parseCoinType(collateralCoinName);
      return txBlock.moveCall({
        target: `${coreIds.protocolPkg}::deposit_collateral::deposit_collateral`,
        arguments: [
          txBlock.object(coreIds.version),
          txBlock.object(obligation as string),
          txBlock.object(coreIds.market),
          txBlock.pure(coin),
        ],
        typeArguments: [coinType],
      });
    },
    takeCollateral: (obligation, obligationKey, amount, collateralCoinName) => {
      const coinType = builder.utils.parseCoinType(collateralCoinName);
      return txBlock.moveCall({
        target: `${coreIds.protocolPkg}::withdraw_collateral::withdraw_collateral`,
        arguments: [
          txBlock.object(coreIds.version),
          txBlock.object(obligation as string),
          txBlock.object(obligationKey as string),
          txBlock.object(coreIds.market),
          txBlock.object(coreIds.coinDecimalsRegistry),
          txBlock.pure(amount),
          txBlock.object(coreIds.xOracle),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [coinType],
      });
    },
    deposit: (coin, poolCoinName) => {
      const coinType = builder.utils.parseCoinType(poolCoinName);
      return txBlock.moveCall({
        target: `${coreIds.protocolPkg}::mint::mint`,
        arguments: [
          txBlock.object(coreIds.version),
          txBlock.object(coreIds.market),
          txBlock.pure(coin),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [coinType],
      });
    },
    depositEntry: (coin, poolCoinName) => {
      const coinType = builder.utils.parseCoinType(poolCoinName);
      return txBlock.moveCall({
        target: `${coreIds.protocolPkg}::mint::mint_entry`,
        arguments: [
          txBlock.object(coreIds.version),
          txBlock.object(coreIds.market),
          txBlock.pure(coin),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [coinType],
      });
    },
    withdraw: (marketCoin, poolCoinName) => {
      const coinType = builder.utils.parseCoinType(poolCoinName);
      return txBlock.moveCall({
        target: `${coreIds.protocolPkg}::redeem::redeem`,
        arguments: [
          txBlock.object(coreIds.version),
          txBlock.object(coreIds.market),
          txBlock.pure(marketCoin),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [coinType],
      });
    },
    withdrawEntry: (marketCoin, poolCoinName) => {
      const coinType = builder.utils.parseCoinType(poolCoinName);
      return txBlock.moveCall({
        target: `${coreIds.protocolPkg}::redeem::redeem_entry`,
        arguments: [
          txBlock.object(coreIds.version),
          txBlock.object(coreIds.market),
          txBlock.pure(marketCoin),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [coinType],
      });
    },
    borrow: (obligation, obligationKey, amount, poolCoinName) => {
      const coinType = builder.utils.parseCoinType(poolCoinName);
      return txBlock.moveCall({
        target: `${coreIds.protocolPkg}::borrow::borrow`,
        arguments: [
          txBlock.object(coreIds.version),
          txBlock.object(obligation as string),
          txBlock.object(obligationKey as string),
          txBlock.object(coreIds.market),
          txBlock.object(coreIds.coinDecimalsRegistry),
          txBlock.pure(amount),
          txBlock.object(coreIds.xOracle),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [coinType],
      });
    },
    borrowEntry: (obligation, obligationKey, amount, poolCoinName) => {
      const coinType = builder.utils.parseCoinType(poolCoinName);
      return txBlock.moveCall({
        target: `${coreIds.protocolPkg}::borrow::borrow_entry`,
        arguments: [
          txBlock.object(coreIds.version),
          txBlock.object(obligation as string),
          txBlock.object(obligationKey as string),
          txBlock.object(coreIds.market),
          txBlock.object(coreIds.coinDecimalsRegistry),
          txBlock.pure(amount),
          txBlock.object(coreIds.xOracle),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [coinType],
      });
    },
    repay: (obligation, coin, poolCoinName) => {
      const coinType = builder.utils.parseCoinType(poolCoinName);
      return txBlock.moveCall({
        target: `${coreIds.protocolPkg}::repay::repay`,
        arguments: [
          txBlock.object(coreIds.version),
          txBlock.object(obligation as string),
          txBlock.object(coreIds.market),
          txBlock.pure(coin),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [coinType],
      });
    },
    borrowFlashLoan: (amount, poolCoinName) => {
      const coinType = builder.utils.parseCoinType(poolCoinName);
      return txBlock.moveCall({
        target: `${coreIds.protocolPkg}::flash_loan::borrow_flash_loan`,
        arguments: [txBlock.object(coreIds.version), txBlock.object(coreIds.market), txBlock.pure(amount)],
        typeArguments: [coinType],
      });
    },
    repayFlashLoan: (coin, loan, poolCoinName) => {
      const coinType = builder.utils.parseCoinType(poolCoinName);
      return txBlock.moveCall({
        target: `${coreIds.protocolPkg}::flash_loan::repay_flash_loan`,
        arguments: [
          txBlock.object(coreIds.version),
          txBlock.object(coreIds.market),
          txBlock.pure(coin),
          txBlock.object(loan as string),
        ],
        typeArguments: [coinType],
      });
    },
  };
};

/**
 * Create an enhanced transaction block instance for interaction with core modules of the Scallop contract.
 *
 * @param builder - Scallop builder instance.
 * @param initTxBlock - Scallop txBlock, txBlock created by SuiKit, or original transaction block.
 * @return Scallop core txBlock.
 */
export const newCoreTxBlock = (builder: ScallopBuilder, initTxBlock?: ScallopTxBlock | TransactionBlock) => {
  const txBlock =
    initTxBlock instanceof TransactionBlock ? new TransactionBlock(initTxBlock) : initTxBlock || new TransactionBlock();

  const normalMethod = generateCoreNormalMethod({
    builder,
    txBlock,
  });

  const normalTxBlock = new Proxy(txBlock, {
    get: (target, prop) => {
      if (prop in normalMethod) {
        return Reflect.get(normalMethod, prop);
      }
      return Reflect.get(target, prop);
    },
  }) as SuiTxBlockWithCoreNormalMethods;

  return new Proxy(normalTxBlock, {
    get: (target, prop) => Reflect.get(target, prop),
  }) as CoreTxBlock;
};
