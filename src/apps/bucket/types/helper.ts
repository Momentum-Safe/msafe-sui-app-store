import { LockClaimIntentionData } from '@/apps/bucket/api';
import {
  BorrowIntentionData,
  CloseIntentionData,
  PsmIntentionData,
  RepayIntentionData,
  SBUCKClaimIntentionData,
  SBUCKDepositIntentionData,
  SBUCKUnstakeIntentionData,
  SBUCKWithdrawIntentionData,
  TankClaimIntentionData,
  TankDepositIntentionData,
  TankWithdrawIntentionData,
  WithdrawIntentionData,
} from '@/apps/bucket/types/api';

export type BucketIntentionData =
  | PsmIntentionData
  | BorrowIntentionData
  | WithdrawIntentionData
  | RepayIntentionData
  | CloseIntentionData
  | TankDepositIntentionData
  | TankWithdrawIntentionData
  | TankClaimIntentionData
  | SBUCKDepositIntentionData
  | SBUCKWithdrawIntentionData
  | SBUCKUnstakeIntentionData
  | SBUCKClaimIntentionData
  | LockClaimIntentionData;
