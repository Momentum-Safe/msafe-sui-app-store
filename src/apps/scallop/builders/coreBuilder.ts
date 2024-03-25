import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui.js/utils';

import { updateOracles } from './oracle';
import type { ScallopBuilder } from '../models';
import { getObligations } from '../queries';
import type {
  CoreIds,
  GenerateCoreNormalMethod,
  SuiTxBlockWithCoreNormalMethods,
  CoreTxBlock,
  ScallopTxBlock,
  GenerateCoreQuickMethod,
  SuiAddressArg,
} from '../types';

/**
 * Check and get Obligation information from transaction block.
 *
 * @description
 * If the obligation id is provided, direactly return it.
 * If both obligation id and key is provided, direactly return them.
 * Otherwise, automatically get obligation id and key from the sender.
 *
 * @param builder - Scallop builder instance.
 * @param txBlock - TxBlock created by SuiKit.
 * @param obligationId - Obligation id.
 * @param obligationKey - Obligation key.
 * @return Obligation id and key.
 */
const requireObligationInfo = async (
  ...params: [
    builder: ScallopBuilder,
    obligationId?: SuiAddressArg,
    obligationKey?: SuiAddressArg,
    walletAddress?: SuiAddressArg,
  ]
) => {
  const [builder, obligationId, obligationKey, walletAddress] = params;
  if (params.length === 3 && obligationId) {
    return { obligationId };
  }
  if (params.length === 4 && obligationId && obligationKey) {
    return { obligationId, obligationKey };
  }
  const obligations = await getObligations(builder.query, walletAddress as string);
  if (obligations.length === 0) {
    throw new Error(`No obligation found for sender ${walletAddress}`);
  }
  return {
    obligationId: obligations[0].id,
    obligationKey: obligations[0].keyId,
  };
};

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
 * Generate core quick methods.
 *
 * @description
 * The quick methods are the same as the normal methods, but they will automatically
 * help users organize transaction blocks, include query obligation info, and transfer
 * coins to the sender. So, they are all asynchronous methods.
 *
 * @param builder - Scallop builder instance.
 * @param txBlock - TxBlock created by SuiKit.
 * @return Core quick methods.
 */
const generateCoreQuickMethod: GenerateCoreQuickMethod = ({ builder, txBlock }) => ({
  addCollateralQuick: async (amount, collateralCoinName, obligationId, walletAddress) => {
    const { obligationId: obligationArg } = await requireObligationInfo(
      builder,
      obligationId,
      undefined,
      walletAddress,
    );

    if (collateralCoinName === 'sui') {
      const [suiCoin] = txBlock.splitCoins(txBlock.gas, [amount]);
      txBlock.addCollateral(obligationArg, suiCoin, collateralCoinName);
    } else {
      const { leftCoin, takeCoin } = await builder.selectCoin(
        txBlock as ScallopTxBlock,
        collateralCoinName,
        amount,
        walletAddress as string,
      );
      txBlock.addCollateral(obligationArg, takeCoin, collateralCoinName);
      txBlock.transferObjects([leftCoin], walletAddress as string);
    }
  },
  takeCollateralQuick: async (amount, collateralCoinName, obligationId, obligationKey, walletAddress) => {
    const obligationInfo = await requireObligationInfo(builder, obligationId, obligationKey, walletAddress);
    const updateCoinNames = await builder.query.getObligationCoinNames(obligationInfo.obligationId);
    await updateOracles(builder, txBlock, updateCoinNames);
    return txBlock.takeCollateral(
      obligationInfo.obligationId,
      obligationInfo.obligationKey as SuiAddressArg,
      amount,
      collateralCoinName,
    );
  },
  depositQuick: async (amount, poolCoinName, walletAddress) => {
    if (poolCoinName === 'sui') {
      const [suiCoin] = txBlock.splitCoins(txBlock.gas, [amount]);
      return txBlock.deposit(suiCoin, poolCoinName);
    }
    const { leftCoin, takeCoin } = await builder.selectCoin(
      txBlock as ScallopTxBlock,
      poolCoinName,
      amount,
      walletAddress as string,
    );
    txBlock.transferObjects([leftCoin], walletAddress as string);
    return txBlock.deposit(takeCoin, poolCoinName);
  },
  withdrawQuick: async (amount, poolCoinName, walletAddress) => {
    const marketCoinName = builder.utils.parseMarketCoinName(poolCoinName);
    const { leftCoin, takeCoin } = await builder.selectMarketCoin(
      txBlock,
      marketCoinName,
      amount,
      walletAddress as string,
    );
    txBlock.transferObjects([leftCoin], walletAddress as string);
    return txBlock.withdraw(takeCoin, poolCoinName);
  },
  borrowQuick: async (amount, poolCoinName, obligationId, obligationKey, walletAddress) => {
    const obligationInfo = await requireObligationInfo(builder, obligationId, obligationKey, walletAddress);
    const obligationCoinNames = await builder.query.getObligationCoinNames(obligationInfo.obligationId);
    const updateCoinNames = [...obligationCoinNames, poolCoinName];
    await updateOracles(builder, txBlock, updateCoinNames);
    return txBlock.borrow(
      obligationInfo.obligationId,
      obligationInfo.obligationKey as SuiAddressArg,
      amount,
      poolCoinName,
    );
  },
  repayQuick: async (amount, poolCoinName, obligationId, walletAddress) => {
    const obligationInfo = await requireObligationInfo(builder, obligationId);

    if (poolCoinName === 'sui') {
      const [suiCoin] = txBlock.splitCoins(txBlock.gas, [amount]);
      return txBlock.repay(obligationInfo.obligationId, suiCoin, poolCoinName);
    }
    const { leftCoin, takeCoin } = await builder.selectCoin(
      txBlock as ScallopTxBlock,
      poolCoinName,
      amount,
      walletAddress as string,
    );
    txBlock.transferObjects([leftCoin], walletAddress as string);
    return txBlock.repay(obligationInfo.obligationId, takeCoin, poolCoinName);
  },
  updateAssetPricesQuick: async (assetCoinNames) => updateOracles(builder, txBlock, assetCoinNames),
});

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

  const quickMethod = generateCoreQuickMethod({
    builder,
    txBlock: normalTxBlock,
  });

  return new Proxy(normalTxBlock, {
    get: (target, prop) => {
      if (prop in quickMethod) {
        return Reflect.get(quickMethod, prop);
      }
      return Reflect.get(target, prop);
    },
  }) as CoreTxBlock;
};
