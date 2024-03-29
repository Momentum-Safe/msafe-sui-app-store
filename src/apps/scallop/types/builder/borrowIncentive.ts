import type { TransactionBlock, TransactionResult } from '@mysten/sui.js/transactions';

import type { ScallopBuilder } from '../../models';
import type { SupportBorrowIncentiveRewardCoins } from '../constant';
import { SuiAddressArg, SuiTxArg } from '../utils';

export type BorrowIncentiveIds = {
  borrowIncentivePkg: string;
  query: string;
  incentivePools: string;
  incentiveAccounts: string;
  obligationAccessStore: string;
  config: string;
};

export type BorrowIncentiveNormalMethods = {
  stakeObligation: (obligation: SuiAddressArg, obligationKey: SuiAddressArg) => void;
  stakeObligationWithVesca: (obligation: SuiAddressArg, obligationKey: SuiAddressArg, veScaKey: SuiTxArg) => void;
  unstakeObligation: (obligation: SuiAddressArg, obligationKey: SuiAddressArg) => void;
  claimBorrowIncentive: (
    obligation: SuiAddressArg,
    obligationKey: SuiAddressArg,
    rewardType: SupportBorrowIncentiveRewardCoins,
  ) => TransactionResult;
  oldClaimBorrowIncentive: (
    obligation: SuiAddressArg,
    obligationKey: SuiAddressArg,
    rewardType: SupportBorrowIncentiveRewardCoins,
  ) => TransactionResult;
};

export type BorrowIncentiveQuickMethods = {
  normalMethod: BorrowIncentiveNormalMethods;
  stakeObligationQuick(obligation?: SuiAddressArg, obligationKey?: SuiAddressArg): Promise<void>;
  unstakeObligationQuick(obligation?: SuiAddressArg, obligationKey?: SuiAddressArg): Promise<void>;
  stakeObligationWithVeScaQuick(
    obligation?: SuiAddressArg,
    obligationKey?: SuiAddressArg,
    veScaKey?: SuiAddressArg,
  ): Promise<void>;
  claimBorrowIncentiveQuick(
    rewardType: SupportBorrowIncentiveRewardCoins,
    obligation?: SuiAddressArg,
    obligationKey?: SuiAddressArg,
  ): TransactionResult;
};

export type SuiTxBlockWithBorrowIncentiveNormalMethods = TransactionBlock & BorrowIncentiveNormalMethods;

export type BorrowIncentiveTxBlock = SuiTxBlockWithBorrowIncentiveNormalMethods & BorrowIncentiveQuickMethods;

export type GenerateBorrowIncentiveNormalMethod = (params: {
  builder: ScallopBuilder;
  txBlock: TransactionBlock;
}) => BorrowIncentiveNormalMethods;

export type GenerateBorrowIncentiveQuickMethod = (params: {
  builder: ScallopBuilder;
  txBlock: TransactionBlock;
}) => BorrowIncentiveQuickMethods;
