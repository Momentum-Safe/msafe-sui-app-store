import type { TransactionBlock, TransactionResult } from '@mysten/sui.js/transactions';

import type { ScallopBuilder } from '../../models';
import type { SupportCollateralCoins, SupportPoolCoins, SupportAssetCoins } from '../constant';
import { SuiAddressArg, SuiObjectArg, SuiTxArg } from '../utils';

export type CoreIds = {
  protocolPkg: string;
  market: string;
  version: string;
  coinDecimalsRegistry: string;
  xOracle: string;
};

export type CoreNormalMethods = {
  openObligation: () => TransactionResult;
  returnObligation: (obligation: SuiAddressArg, obligationHotPotato: SuiObjectArg) => void;
  openObligationEntry: () => void;
  addCollateral: (obligation: SuiAddressArg, coin: SuiObjectArg, collateralCoinName: SupportCollateralCoins) => void;
  takeCollateral: (
    obligation: SuiAddressArg,
    obligationKey: SuiAddressArg,
    amount: SuiTxArg,
    collateralCoinName: SupportCollateralCoins,
  ) => TransactionResult;
  deposit: (coin: SuiObjectArg, poolCoinName: SupportPoolCoins) => TransactionResult;
  depositEntry: (coin: SuiObjectArg, poolCoinName: SupportPoolCoins) => void;
  withdraw: (marketCoin: SuiObjectArg, poolCoinName: SupportPoolCoins) => TransactionResult;
  withdrawEntry: (marketCoin: SuiObjectArg, poolCoinName: SupportPoolCoins) => void;
  borrow: (
    obligation: SuiAddressArg,
    obligationKey: SuiAddressArg,
    amount: SuiTxArg,
    poolCoinName: SupportPoolCoins,
  ) => TransactionResult;
  borrowEntry: (
    obligation: SuiAddressArg,
    obligationKey: SuiAddressArg,
    amount: SuiTxArg,
    poolCoinName: SupportPoolCoins,
  ) => void;
  borrowWithReferral: (
    obligation: SuiAddressArg,
    obligationKey: SuiAddressArg,
    borrowReferral: SuiObjectArg,
    amount: SuiTxArg,
    poolCoinName: SupportPoolCoins,
  ) => TransactionResult;
  repay: (obligation: SuiAddressArg, coin: SuiObjectArg, poolCoinName: SupportPoolCoins) => void;
  borrowFlashLoan: (amount: SuiTxArg, poolCoinName: SupportPoolCoins) => TransactionResult;
  repayFlashLoan: (coin: SuiObjectArg, loan: SuiAddressArg, poolCoinName: SupportPoolCoins) => void;
};

export type CoreQuickMethods = {
  normalMethod: CoreNormalMethods;
  addCollateralQuick: (
    amount: number,
    collateralCoinName: SupportCollateralCoins,
    obligationId?: SuiAddressArg,
    walletAddress?: SuiAddressArg,
  ) => Promise<void>;
  takeCollateralQuick: (
    amount: number,
    collateralCoinName: SupportCollateralCoins,
    obligationId?: SuiAddressArg,
    obligationKey?: SuiAddressArg,
    walletAddress?: SuiAddressArg,
  ) => Promise<TransactionResult>;
  borrowQuick: (
    amount: number,
    poolCoinName: SupportPoolCoins,
    obligationId?: SuiAddressArg,
    obligationKey?: SuiAddressArg,
    walletAddress?: SuiAddressArg,
  ) => Promise<TransactionResult>;
  borrowWithReferralQuick: (
    amount: number,
    poolCoinName: SupportPoolCoins,
    borrowReferral: SuiObjectArg,
    obligationId?: SuiAddressArg,
    obligationKey?: SuiAddressArg,
  ) => Promise<TransactionResult>;
  depositQuick: (
    amount: number,
    poolCoinName: SupportPoolCoins,
    walletAddress?: SuiAddressArg,
  ) => Promise<TransactionResult>;
  withdrawQuick: (
    amount: number,
    poolCoinName: SupportPoolCoins,
    walletAddress?: SuiAddressArg,
  ) => Promise<TransactionResult>;
  repayQuick: (
    amount: number,
    poolCoinName: SupportPoolCoins,
    obligationId?: SuiAddressArg,
    walletAddress?: SuiAddressArg,
  ) => Promise<void>;
  updateAssetPricesQuick: (assetCoinNames?: SupportAssetCoins[]) => Promise<void>;
};

export type SuiTxBlockWithCoreNormalMethods = TransactionBlock & CoreNormalMethods;

export type CoreTxBlock = SuiTxBlockWithCoreNormalMethods & CoreQuickMethods;

export type GenerateCoreNormalMethod = (params: {
  builder: ScallopBuilder;
  txBlock: TransactionBlock;
}) => Promise<CoreNormalMethods>;

export type GenerateCoreQuickMethod = (params: {
  builder: ScallopBuilder;
  txBlock: TransactionBlock;
}) => Promise<CoreQuickMethods>;
