import type { TransactionBlock, TransactionResult } from '@mysten/sui.js/transactions';

import { SuiAddressArg, SuiObjectArg, SuiTxArg } from '..';
import { ScallopBuilder } from '../../models';

export type VescaIds = {
  pkgId: string;
  table: string;
  treasury: string;
  config: string;
};

export type VeScaNormalMethods = {
  lockSca: (scaCoin: SuiObjectArg, unlockAtInSecondTimestamp: SuiTxArg) => TransactionResult;
  extendLockPeriod: (veScaKey: SuiAddressArg, newUnlockAtInSecondTimestamp: SuiTxArg) => void;
  extendLockAmount: (veScaKey: SuiAddressArg, scaCoin: SuiObjectArg) => void;
  renewExpiredVeSca: (veScaKey: SuiAddressArg, scaCoin: SuiObjectArg, newUnlockAtInSecondTimestamp: SuiTxArg) => void;
  redeemSca: (veScaKey: SuiAddressArg) => TransactionResult;
  mintEmptyVeSca: () => TransactionResult;
};

export type VeScaQuickMethods = {
  normalMethod: VeScaNormalMethods;
  lockScaQuick(amountOrCoin?: SuiObjectArg | number, lockPeriodInDays?: number, autoCheck?: boolean): Promise<void>;
  extendLockPeriodQuick: (lockPeriodInDays: number, veScaKey?: SuiAddressArg, autoCheck?: boolean) => Promise<void>;
  extendLockAmountQuick: (scaAmount: number, veScaKey?: SuiAddressArg, autoCheck?: boolean) => Promise<void>;
  renewExpiredVeScaQuick: (
    scaAmount: number,
    lockPeriodInDays: number,
    veScaKey?: SuiAddressArg,
    autoCheck?: boolean,
  ) => Promise<void>;
  redeemScaQuick: (veScaKey?: SuiAddressArg) => Promise<void>;
};

export type SuiTxBlockWithVeScaNormalMethods = TransactionBlock & VeScaNormalMethods;

export type VeScaTxBlock = SuiTxBlockWithVeScaNormalMethods & VeScaQuickMethods;

export type GenerateVeScaNormalMethod = (params: {
  builder: ScallopBuilder;
  txBlock: TransactionBlock;
}) => Promise<VeScaNormalMethods>;

export type GenerateVeScaQuickMethod = (params: {
  builder: ScallopBuilder;
  txBlock: TransactionBlock;
}) => Promise<VeScaQuickMethods>;
