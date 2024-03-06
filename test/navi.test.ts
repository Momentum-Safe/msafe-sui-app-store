import { EntryBorrowIntention } from '@/apps/navi/intentions/entry-borrow';
import { EntryDepositIntention } from '@/apps/navi/intentions/entry-deposit';
import { EntryRepayIntention } from '@/apps/navi/intentions/entry-repay';
import { EntryWithdrawIntention } from '@/apps/navi/intentions/entry-withdraw';
import { CoinType } from '@/apps/navi/types';

describe('NAVI App', () => {
  it('Test EntryDeposit intention serialization', () => {
    const intention = EntryDepositIntention.fromData({
      amount: 1000,
      coinType: CoinType.sui,
    });

    expect(intention.serialize()).toBe('{"amount":1000,"coinType":"sui"}');
  });

  it('Test EntryBorrow intention serialization', () => {
    const intention = EntryBorrowIntention.fromData({
      amount: 1000,
      coinType: CoinType.sui,
    });

    expect(intention.serialize()).toBe('{"amount":1000,"coinType":"sui"}');
  });

  it('Test EntryRepay intention serialization', () => {
    const intention = EntryRepayIntention.fromData({
      amount: 1000,
      coinType: CoinType.sui,
    });

    expect(intention.serialize()).toBe('{"amount":1000,"coinType":"sui"}');
  });

  it('Test EntryWithdraw intention serialization', () => {
    const intention = EntryWithdrawIntention.fromData({
      amount: 1000,
      coinType: CoinType.sui,
    });

    expect(intention.serialize()).toBe('{"amount":1000,"coinType":"sui"}');
  });
});
