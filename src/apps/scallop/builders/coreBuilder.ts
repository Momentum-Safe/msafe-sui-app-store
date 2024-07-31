import { TransactionArgument, TransactionBlock } from '@mysten/sui.js/transactions';
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui.js/utils';

import { updateOracles } from './oracle';
import { generateSCoinNormalMethod } from './sCoinBuilder';
import type { ScallopBuilder } from '../models';
import { getObligations } from '../queries';
import type {
  CoreIds,
  GenerateCoreNormalMethod,
  ScallopTxBlock,
  GenerateCoreQuickMethod,
  SuiAddressArg,
} from '../types';
import { requireSender } from '../utils';

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
    txBlock: TransactionBlock,
    builder: ScallopBuilder,
    obligationId?: SuiAddressArg,
    obligationKey?: SuiAddressArg,
  ]
) => {
  const [txBlock, builder, obligationId, obligationKey] = params;
  if (params.length === 3 && obligationId) {
    return { obligationId };
  }
  if (params.length === 4 && obligationId && obligationKey) {
    return { obligationId, obligationKey };
  }
  const sender = requireSender(txBlock);
  const obligations = await getObligations(builder.query, sender);
  if (obligations.length === 0) {
    throw new Error(`No obligation found for sender ${sender}`);
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
export const generateCoreNormalMethod: GenerateCoreNormalMethod = async ({ builder, txBlock }) => {
  const coreIds: CoreIds = {
    protocolPkg: await builder.address.get('core.packages.protocol.id'),
    market: await builder.address.get('core.market'),
    version: await builder.address.get('core.version'),
    coinDecimalsRegistry: await builder.address.get('core.coinDecimalsRegistry'),
    xOracle: await builder.address.get('core.oracles.xOracle'),
  };

  const referralPkgId = await builder.address.get('referral.id');
  const referralWitnessType = `${referralPkgId}::scallop_referral_program::REFERRAL_WITNESS`;

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
          typeof coin !== 'string' ? (coin as TransactionArgument) : txBlock.pure(coin),
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
          typeof coin !== 'string' ? (coin as TransactionArgument) : txBlock.pure(coin),
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
          typeof coin !== 'string' ? (coin as TransactionArgument) : txBlock.pure(coin),
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
          typeof marketCoin !== 'string' ? (marketCoin as TransactionArgument) : txBlock.pure(marketCoin),
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
          typeof marketCoin !== 'string' ? (marketCoin as TransactionArgument) : txBlock.pure(marketCoin),
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
    borrowWithReferral: (obligation, obligationKey, borrowReferral, amount, poolCoinName) => {
      const coinType = builder.utils.parseCoinType(poolCoinName);
      return txBlock.moveCall({
        target: `${coreIds.protocolPkg}::borrow::borrow_with_referral`,
        arguments: [
          txBlock.object(coreIds.version),
          txBlock.object(obligation as string),
          txBlock.object(obligationKey as string),
          txBlock.object(coreIds.market),
          txBlock.object(coreIds.coinDecimalsRegistry),
          txBlock.object(borrowReferral as string),
          txBlock.pure(amount),
          txBlock.object(coreIds.xOracle),
          txBlock.object(SUI_CLOCK_OBJECT_ID),
        ],
        typeArguments: [coinType, referralWitnessType],
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
          typeof coin !== 'string' ? (coin as TransactionArgument) : txBlock.pure(coin),
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
export const generateCoreQuickMethod: GenerateCoreQuickMethod = async ({ builder, txBlock }) => {
  const normalMethod = await generateCoreNormalMethod({ builder, txBlock });
  const scoinNormalMethod = await generateSCoinNormalMethod({ builder, txBlock });
  return {
    normalMethod,
    addCollateralQuick: async (amount, collateralCoinName, obligationId) => {
      const sender = requireSender(txBlock);
      const { obligationId: obligationArg } = await requireObligationInfo(txBlock, builder, obligationId);

      if (collateralCoinName === 'sui') {
        const [suiCoin] = txBlock.splitCoins(txBlock.gas, [amount]);
        normalMethod.addCollateral(obligationArg, suiCoin, collateralCoinName);
      } else {
        const { leftCoin, takeCoin } = await builder.selectCoin(
          txBlock as ScallopTxBlock,
          collateralCoinName,
          amount,
          sender,
        );
        normalMethod.addCollateral(obligationArg, takeCoin, collateralCoinName);
        txBlock.transferObjects([leftCoin], sender);
      }
    },
    takeCollateralQuick: async (amount, collateralCoinName, obligationId, obligationKey) => {
      const obligationInfo = await requireObligationInfo(txBlock, builder, obligationId, obligationKey);
      const updateCoinNames = await builder.query.getObligationCoinNames(obligationInfo.obligationId);
      await updateOracles(builder, txBlock, updateCoinNames);
      return normalMethod.takeCollateral(
        obligationInfo.obligationId,
        obligationInfo.obligationKey as SuiAddressArg,
        amount,
        collateralCoinName,
      );
    },
    depositQuick: async (amount, poolCoinName, walletAddress) => {
      if (poolCoinName === 'sui') {
        const [suiCoin] = txBlock.splitCoins(txBlock.gas, [amount]);
        return normalMethod.deposit(suiCoin, poolCoinName);
      }
      const { leftCoin, takeCoin } = await builder.selectCoin(
        txBlock as ScallopTxBlock,
        poolCoinName,
        amount,
        walletAddress as string,
      );
      txBlock.transferObjects([leftCoin], walletAddress as string);
      return normalMethod.deposit(takeCoin, poolCoinName);
    },
    withdrawQuick: async (amount, poolCoinName) => {
      const sender = requireSender(txBlock);
      const marketCoinName = builder.utils.parseMarketCoinName(poolCoinName);
      // check if user has sCoin instead of marketCoin
      try {
        const sCoinName = builder.utils.parseSCoinName(poolCoinName);
        if (!sCoinName) {
          throw new Error(`No sCoin for ${poolCoinName}`);
        }
        const {
          leftCoin,
          takeCoin,
          totalAmount: sCoinAmount,
        } = await builder.selectSCoin(txBlock, sCoinName, amount, sender);
        txBlock.transferObjects([leftCoin], sender);
        const marketCoin = scoinNormalMethod.burnSCoin(sCoinName, takeCoin);

        const txResult = normalMethod.withdraw(marketCoin, poolCoinName);

        // check amount
        const amountLeft = amount - sCoinAmount;
        try {
          if (amountLeft > 0) {
            // sCoin is not enough, try market coin
            const { leftCoin: leftMarketCoin, takeCoin: takeMarketCoin } = await builder.selectMarketCoin(
              txBlock,
              marketCoinName,
              amountLeft,
              sender,
            );
            txBlock.transferObjects([leftMarketCoin], sender);
            txBlock.mergeCoins(txResult, [normalMethod.withdraw(takeMarketCoin, poolCoinName)]);
          }
        } catch (e) {
          // ignore
        }
        return txResult;
      } catch (e) {
        // no sCoin found
        const { leftCoin, takeCoin } = await builder.selectMarketCoin(txBlock, marketCoinName, amount, sender);
        txBlock.transferObjects([leftCoin], sender);
        return normalMethod.withdraw(takeCoin, poolCoinName);
      }
    },
    borrowQuick: async (amount, poolCoinName, obligationId, obligationKey) => {
      const obligationInfo = await requireObligationInfo(txBlock, builder, obligationId, obligationKey);
      const obligationCoinNames = await builder.query.getObligationCoinNames(obligationInfo.obligationId);
      const updateCoinNames = [...obligationCoinNames, poolCoinName];
      await updateOracles(builder, txBlock, updateCoinNames);
      return normalMethod.borrow(
        obligationInfo.obligationId,
        obligationInfo.obligationKey as SuiAddressArg,
        amount,
        poolCoinName,
      );
    },
    borrowWithReferralQuick: async (amount, poolCoinName, borrowReferral, obligationId, obligationKey) => {
      const obligationInfo = await requireObligationInfo(txBlock, builder, obligationId, obligationKey);
      const obligationCoinNames = await builder.query.getObligationCoinNames(obligationInfo.obligationId);
      const updateCoinNames = [...obligationCoinNames, poolCoinName];
      await updateOracles(builder, txBlock, updateCoinNames);
      return normalMethod.borrowWithReferral(
        obligationInfo.obligationId,
        obligationInfo.obligationKey as SuiAddressArg,
        borrowReferral,
        amount,
        poolCoinName,
      );
    },
    repayQuick: async (amount, poolCoinName, obligationId, walletAddress) => {
      const obligationInfo = await requireObligationInfo(txBlock, builder, obligationId);

      if (poolCoinName === 'sui') {
        const [suiCoin] = txBlock.splitCoins(txBlock.gas, [amount]);
        return normalMethod.repay(obligationInfo.obligationId, suiCoin, poolCoinName);
      }
      const { leftCoin, takeCoin } = await builder.selectCoin(
        txBlock as ScallopTxBlock,
        poolCoinName,
        amount,
        walletAddress as string,
      );
      txBlock.transferObjects([leftCoin], walletAddress as string);
      return normalMethod.repay(obligationInfo.obligationId, takeCoin, poolCoinName);
    },
    updateAssetPricesQuick: async (assetCoinNames) => updateOracles(builder, txBlock, assetCoinNames),
  };
};
