import type { TransactionBlock, TransactionResult } from '@mysten/sui.js/transactions';

import type { ScallopBuilder } from '../../models';
import type { SupportBorrowIncentiveCoins } from '../constant';
import { SuiAddressArg } from '../utils';

export type BorrowIncentiveIds = {
  borrowIncentivePkg: string;
  query: string;
  incentivePools: string;
  incentiveAccounts: string;
  obligationAccessStore: string;
};

export type BorrowIncentiveNormalMethods = {
  stakeObligation: (obligation: SuiAddressArg, obligaionKey: SuiAddressArg) => void;
  unstakeObligation: (obligation: SuiAddressArg, obligaionKey: SuiAddressArg) => void;
  claimBorrowIncentive: (
    obligation: SuiAddressArg,
    obligaionKey: SuiAddressArg,
    coinName: SupportBorrowIncentiveCoins,
  ) => TransactionResult;
};

export type BorrowIncentiveQuickMethods = {
  normalMethod: BorrowIncentiveNormalMethods;
  stakeObligationQuick(obligation?: SuiAddressArg, obligationKey?: SuiAddressArg): Promise<void>;
  unstakeObligationQuick(obligation?: SuiAddressArg, obligationKey?: SuiAddressArg): Promise<void>;
  claimBorrowIncentiveQuick(
    coinName: SupportBorrowIncentiveCoins,
    obligation?: SuiAddressArg,
    obligationKey?: SuiAddressArg,
  ): Promise<TransactionResult>;
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
