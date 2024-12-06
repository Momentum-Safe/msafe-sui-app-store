export enum TransactionSubType {
  PsmIn = 'psm-in',
  PsmOut = 'psm-out',
  
  TopUp = 'top-up',
  Borrow = 'borrow',
  Withdraw = 'withdraw',
  Repay = 'repay',
  Close = 'close',

  SBUCKDeposit = 'sbuck-deposit',
  SBUCKUnstake = 'sbuck-unstake',
  SBUCKWithdraw = 'sbuck-withdraw',
  SBUCKClaim = 'sbuck-claim',

  LockClaim = 'lock-claim',
}
