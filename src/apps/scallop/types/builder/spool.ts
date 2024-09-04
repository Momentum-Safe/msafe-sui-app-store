import type { Transaction, TransactionResult } from '@mysten/sui.js/transactions';

import type { ScallopBuilder } from '../../models';
import type { SupportStakeMarketCoins } from '../constant';
import { SuiAddressArg, SuiObjectArg, SuiTxArg } from '../utils';

export type SpoolIds = {
  spoolPkg: string;
};

export type StakePoolIds = {
  [k in SupportStakeMarketCoins]?: string;
};
export type RewardPoolIds = {
  [k in SupportStakeMarketCoins]?: string;
};
export type StakeMarketCoinTypes = {
  [k in SupportStakeMarketCoins]?: string;
};

export type SpoolNormalMethods = {
  createStakeAccount: (stakeMarketCoinName: SupportStakeMarketCoins) => TransactionResult;
  stake: (stakeAccount: SuiAddressArg, coin: SuiObjectArg, stakeMarketCoinName: SupportStakeMarketCoins) => void;
  unstake: (
    stakeAccount: SuiAddressArg,
    amount: SuiTxArg,
    stakeMarketCoinName: SupportStakeMarketCoins,
  ) => TransactionResult;
  claim: (stakeAccount: SuiAddressArg, stakeMarketCoinName: SupportStakeMarketCoins) => TransactionResult;
};

export type SpoolQuickMethods = {
  normalMethod: SpoolNormalMethods;
  stakeQuick(
    amountOrMarketCoin: SuiObjectArg | number,
    stakeMarketCoinName: SupportStakeMarketCoins,
    stakeAccountId?: SuiAddressArg,
  ): Promise<void>;
  unstakeQuick(
    amount: number,
    stakeMarketCoinName: SupportStakeMarketCoins,
    stakeAccountId?: SuiAddressArg,
  ): Promise<TransactionResult | undefined>;
  claimQuick(
    stakeMarketCoinName: SupportStakeMarketCoins,
    stakeAccountId?: SuiAddressArg,
  ): Promise<TransactionResult[]>;
};

export type SuiTxBlockWithSpoolNormalMethods = Transaction & SpoolNormalMethods;

export type SpoolTxBlock = SuiTxBlockWithSpoolNormalMethods & SpoolQuickMethods;

export type GenerateSpoolNormalMethod = (params: {
  builder: ScallopBuilder;
  txBlock: Transaction;
}) => Promise<SpoolNormalMethods>;

export type GenerateSpoolQuickMethod = (params: {
  builder: ScallopBuilder;
  txBlock: Transaction;
}) => Promise<SpoolQuickMethods>;

export type SpoolIncentiveParams = {
  stakeMarketCoinName: SupportStakeMarketCoins;
  stakeAccountId: string;
};
