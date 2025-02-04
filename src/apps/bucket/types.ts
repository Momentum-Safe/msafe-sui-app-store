import { TransactionType } from '@msafe/sui3-utils';

import { BucketIntentionData } from '@/apps/bucket/types/helper';

export enum TransactionSubType {
  Psm = 'psm',

  Borrow = 'borrow',
  Withdraw = 'withdraw',
  Repay = 'repay',
  Close = 'close',

  TankDeposit = 'tank-deposit',
  TankWithdraw = 'tank-withdraw',
  TankClaim = 'tank-claim',

  SBUCKDeposit = 'sbuck-deposit',
  SBUCKUnstake = 'sbuck-unstake',
  SBUCKWithdraw = 'sbuck-withdraw',
  SBUCKClaim = 'sbuck-claim',

  LockClaim = 'lock-claim',
}

export type DecodeResult = {
  txType: TransactionType;
  type: TransactionSubType;
  intentionData: BucketIntentionData;
};
