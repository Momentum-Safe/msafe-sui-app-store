import { BorrowIntention } from '@/apps/scallop/intentions/lending/borrow';
import { BorrowWithBoostIntention } from '@/apps/scallop/intentions/lending/borrow-with-boost';
import { BorrowWithReferralIntention } from '@/apps/scallop/intentions/lending/borrow-with-referral';
import { DepositCollateralIntention } from '@/apps/scallop/intentions/lending/deposit-collateral';
import { MigrateWusdcToUsdcIntention } from '@/apps/scallop/intentions/lending/migrate-wusd-to-usdc';
import { OpenObligationIntention } from '@/apps/scallop/intentions/lending/open-obligation';
import { RepayIntention } from '@/apps/scallop/intentions/lending/repay';
import { RepayWithBoostIntention } from '@/apps/scallop/intentions/lending/repay-with-boost';
import { StakeSpoolIntention } from '@/apps/scallop/intentions/lending/stake-spool';
import { SupplyLendingIntention } from '@/apps/scallop/intentions/lending/supply-lending';
import { WithdrawCollateralIntention } from '@/apps/scallop/intentions/lending/withdraw-collateral';
import { BindReferralIntention } from '@/apps/scallop/intentions/referral/bind-referral';
import { ClaimRevenueReferralIntention } from '@/apps/scallop/intentions/referral/claim-revenue-referral';
import { CreateReferralLinkIntention } from '@/apps/scallop/intentions/referral/create-referral-link';
import { ExtendPeriodAndStakeMoreIntention } from '@/apps/scallop/intentions/staking/extend-period-and-stake-more';
import { ExtendStakePeriodIntention } from '@/apps/scallop/intentions/staking/extend-stake-period';
import { WithdrawStakedScaIntention } from '@/apps/scallop/intentions/staking/withdraw-staked-sca';
import { Scallop } from '@/apps/scallop/models';

import { Account, Client, Obligation, vescaKey } from './scallop.config';

describe('Scallop App', () => {
  const scallop = new Scallop({
    client: Client,
    walletAddress: Account.address,
  });

  beforeEach(async () => {
    await scallop.init();
  });
  it('Test Supply Lending intention serialization', () => {
    const intention = SupplyLendingIntention.fromData({
      amount: 1000,
      coinName: 'sui',
    });

    expect(intention.serialize()).toBe('{"amount":1000,"coinName":"sui"}');
  });

  it('Test Withdraw Lending intention serialization', () => {
    const intention = SupplyLendingIntention.fromData({
      amount: 1000,
      coinName: 'sui',
    });

    expect(intention.serialize()).toBe('{"amount":1000,"coinName":"sui"}');
  });

  it('Test Deposit Collateral intention serialization', () => {
    const intention = DepositCollateralIntention.fromData({
      amount: 1000,
      collateralCoinName: 'sui',
      obligationId: Obligation.obligationId,
    });

    expect(intention.serialize()).toBe(
      `{"amount":1000,"collateralCoinName":"sui","obligationId":"${Obligation.obligationId}"}`,
    );
  });

  it('Test Withdraw Collateral intention serialization', () => {
    const intention = WithdrawCollateralIntention.fromData({
      amount: 1000,
      collateralCoinName: 'sui',
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
    });

    expect(intention.serialize()).toBe(
      `{"amount":1000,"collateralCoinName":"sui","obligationId":"${Obligation.obligationId}","obligationKey":"${Obligation.obligationKey}"}`,
    );
  });

  it('Test Borrow intention serialization', () => {
    const intention = BorrowIntention.fromData({
      amount: 1000,
      coinName: 'sui',
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
    });

    expect(intention.serialize()).toBe(
      `{"amount":1000,"coinName":"sui","obligationId":"${Obligation.obligationId}","obligationKey":"${Obligation.obligationKey}"}`,
    );
  });

  it('Test Borrow With Boost intention serialization', () => {
    const intention = BorrowWithBoostIntention.fromData({
      amount: 1000,
      coinName: 'sui',
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      veScaKey: vescaKey,
    });

    expect(intention.serialize()).toBe(
      `{"amount":1000,"coinName":"sui","obligationId":"${Obligation.obligationId}","obligationKey":"${Obligation.obligationKey}","veScaKey":"${vescaKey}"}`,
    );
  });

  it('Test Repay intention serialization', () => {
    const intention = RepayIntention.fromData({
      amount: 1000,
      coinName: 'sui',
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
    });

    expect(intention.serialize()).toBe(
      `{"amount":1000,"coinName":"sui","obligationId":"${Obligation.obligationId}","obligationKey":"${Obligation.obligationKey}"}`,
    );
  });

  it('Test Repay With Boost intention serialization', () => {
    const intention = RepayWithBoostIntention.fromData({
      amount: 1000,
      coinName: 'sui',
      obligationId: Obligation.obligationId,
      veScaKey: vescaKey,
    });

    expect(intention.serialize()).toBe(
      `{"amount":1000,"coinName":"sui","obligationId":"${Obligation.obligationId}","veScaKey":"${vescaKey}"}`,
    );
  });

  it('Test Stake Spool intention serialization', () => {
    const intention = StakeSpoolIntention.fromData({
      amount: 1000,
      marketCoinName: 'ssui',
    });

    expect(intention.serialize()).toBe('{"amount":1000,"marketCoinName":"ssui"}');
  });

  it('Test Unstake Spool intention serialization', () => {
    const intention = StakeSpoolIntention.fromData({
      amount: 1000,
      marketCoinName: 'ssui',
    });

    expect(intention.serialize()).toBe('{"amount":1000,"marketCoinName":"ssui"}');
  });

  it('Test Open Obligation intention serialization', () => {
    const intention = OpenObligationIntention.fromData({});

    expect(intention.serialize()).toBe('{}');
  });

  it('Test Withdraw Unlocked Staked SCA intention serialization', () => {
    const intention = WithdrawStakedScaIntention.fromData({});

    expect(intention.serialize()).toBe('{}');
  });

  it('Test extend lock period intention serialization', () => {
    const intention = ExtendStakePeriodIntention.fromData({
      lockPeriodInDays: scallop.utils.getUnlockAt(1, 1836111600),
      veScaKey: vescaKey,
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      isObligationLocked: true,
      isOldBorrowIncentive: false,
    });
    expect(intention.serialize()).toBe(
      '{"isObligationLocked":true,"isOldBorrowIncentive":false,"lockPeriodInDays":1836259200,"obligationId":"0x56574789e0e6bb0837ba090e85757e046390cab25cace7f09838314207a2ce74","obligationKey":"0x10873534fbdf2f844bae0878a5b660fcc95cdf4838f23bcf0890b0d73b8f170b","veScaKey":"0x5e2c54651ca4e2352475e8419e3419cfcfe424af272ca59ae053e3c248c13c16"}',
    );
  });

  it('Test extend stake and lock period intention serialization', () => {
    const intention = ExtendPeriodAndStakeMoreIntention.fromData({
      amount: 2e9,
      lockPeriodInDays: scallop.utils.getUnlockAt(1, 1836111600),
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      veScaKey: vescaKey,
      isObligationLocked: true,
      isOldBorrowIncentive: false,
    });
    expect(intention.serialize()).toBe(
      '{"amount":2000000000,"isObligationLocked":true,"isOldBorrowIncentive":false,"lockPeriodInDays":1836259200,"obligationId":"0x56574789e0e6bb0837ba090e85757e046390cab25cace7f09838314207a2ce74","obligationKey":"0x10873534fbdf2f844bae0878a5b660fcc95cdf4838f23bcf0890b0d73b8f170b","veScaKey":"0x5e2c54651ca4e2352475e8419e3419cfcfe424af272ca59ae053e3c248c13c16"}',
    );
  });

  it('Test Borrow With Referral intention serialization', () => {
    const intention = BorrowWithReferralIntention.fromData({
      amount: 1000,
      coinName: 'sui',
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      veScaKey: undefined,
    });

    expect(intention.serialize()).toBe(
      `{"amount":1000,"coinName":"sui","obligationId":"${Obligation.obligationId}","obligationKey":"${Obligation.obligationKey}"}`,
    );
  });

  it('Test Borrow Boost With Referral intention serialization', () => {
    const intention = BorrowWithReferralIntention.fromData({
      amount: 1000,
      coinName: 'sui',
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      veScaKey: vescaKey,
    });

    expect(intention.serialize()).toBe(
      `{"amount":1000,"coinName":"sui","obligationId":"${Obligation.obligationId}","obligationKey":"${Obligation.obligationKey}","veScaKey":"${vescaKey}"}`,
    );
  });

  it('Test Referral Bind Referral', () => {
    const intention = BindReferralIntention.fromData({
      veScaKey: vescaKey,
    });

    expect(intention.serialize()).toBe(`{"veScaKey":"${vescaKey}"}`);
  });
  it('Test Referral Claim Revenue', () => {
    const intention = ClaimRevenueReferralIntention.fromData({
      veScaKey: vescaKey,
      coins: ['usdt', 'usdc'],
    });

    expect(intention.serialize()).toBe(`{"coins":["usdc","usdt"],"veScaKey":"${vescaKey}"}`);
  });

  it('Test Create Referral Link', () => {
    const intention = CreateReferralLinkIntention.fromData({});

    expect(intention.serialize()).toBe(`{}`);
  });

  it('Test migrate position wUSDC to USDC on lending pool', () => {
    const intention = MigrateWusdcToUsdcIntention.fromData({
      amount: 10000000,
      coinName: 'wusdc',
      slippage: 500000,
      validSwapAmount: '10000000',
      stakeAccountId: [
        {
          id: '0x56574789e0e6bb0837ba090e85757e046390cab25cace7f09838314207a2ce74',
          coin: 5000000,
        },
      ],
    });
    expect(intention.serialize()).toBe(
      '{"amount":10000000,"coinName":"wusdc","slippage":500000,"stakeAccountId":[{"id":"0x56574789e0e6bb0837ba090e85757e046390cab25cace7f09838314207a2ce74","coin":5000000}],"validSwapAmount":"10000000"}',
    );
  });
});
