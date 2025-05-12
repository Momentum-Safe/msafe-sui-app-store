import { getFullnodeUrl } from '@mysten/sui/client';
import { Scallop, ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { BorrowIntention } from '@/apps/scallop/intentions/lending/borrow';
import { BorrowWithBoostIntention } from '@/apps/scallop/intentions/lending/borrow-with-boost';
import { BorrowWithReferralIntention } from '@/apps/scallop/intentions/lending/borrow-with-referral';
import { DepositCollateralIntention } from '@/apps/scallop/intentions/lending/deposit-collateral';
import { OpenObligationIntention } from '@/apps/scallop/intentions/lending/open-obligation';
import { RepayIntention } from '@/apps/scallop/intentions/lending/repay';
import { RepayWithBoostIntention } from '@/apps/scallop/intentions/lending/repay-with-boost';
import { SupplyLendingIntention } from '@/apps/scallop/intentions/lending/supply-lending';
import { WithdrawCollateralIntention } from '@/apps/scallop/intentions/lending/withdraw-collateral';
import { BindReferralIntention } from '@/apps/scallop/intentions/referral/bind-referral';
import { ClaimRevenueReferralIntention } from '@/apps/scallop/intentions/referral/claim-revenue-referral';
import { CreateReferralLinkIntention } from '@/apps/scallop/intentions/referral/create-referral-link';
import { ExtendPeriodAndStakeMoreIntention } from '@/apps/scallop/intentions/staking/extend-period-and-stake-more';
import { ExtendStakePeriodIntention } from '@/apps/scallop/intentions/staking/extend-stake-period';
import { WithdrawStakedScaIntention } from '@/apps/scallop/intentions/staking/withdraw-staked-sca';

import { Account, Obligation, vescaKey } from './scallop.config';

describe('Scallop App', () => {
  const scallop = new Scallop({
    addressId: '67c44a103fe1b8c454eb9699',
    walletAddress: Account.address,
    fullnodeUrls: [getFullnodeUrl('mainnet')],
  });
  let scallopClient: ScallopClient;

  beforeEach(async () => {
    if (!scallopClient) {
      scallopClient = await scallop.createScallopClient();
    }
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

  it('Test Open Obligation intention serialization', () => {
    const intention = OpenObligationIntention.fromData({});

    expect(intention.serialize()).toBe('{}');
  });

  it('Test Withdraw Unlocked Staked SCA intention serialization', () => {
    const intention = WithdrawStakedScaIntention.fromData({});

    expect(intention.serialize()).toBe('{}');
  });

  it('Test extend lock period intention serialization', () => {
    const unlockTime = scallopClient.utils.getUnlockAt(1);
    const intentionData = {
      unlockTime,
      veScaKey: vescaKey,
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      isObligationLocked: true,
      isOldBorrowIncentive: false,
    };
    const intention = ExtendStakePeriodIntention.fromData(intentionData);

    const serialized = intention.serialize();
    const parsed = JSON.parse(serialized);

    expect(parsed.unlockTime).toBe(unlockTime);
    expect(parsed.veScaKey).toBe(vescaKey);
    expect(parsed.obligationId).toBe(Obligation.obligationId);
    expect(parsed.obligationKey).toBe(Obligation.obligationKey);
    expect(parsed.isObligationLocked).toBe(true);
    expect(parsed.isOldBorrowIncentive).toBe(false);
  });

  it('Test extend stake and lock period intention serialization', () => {
    const unlockTime = scallopClient.utils.getUnlockAt(1);
    const intention = ExtendPeriodAndStakeMoreIntention.fromData({
      amount: 2e9,
      unlockTime,
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      veScaKey: vescaKey,
      isObligationLocked: true,
      isOldBorrowIncentive: false,
    });

    const serialized = intention.serialize();
    const parsed = JSON.parse(serialized);

    expect(parsed.amount).toBe(2e9);
    expect(parsed.unlockTime).toBe(unlockTime);
    expect(parsed.obligationId).toBe(Obligation.obligationId);
    expect(parsed.obligationKey).toBe(Obligation.obligationKey);
    expect(parsed.veScaKey).toBe(vescaKey);
    expect(parsed.isObligationLocked).toBe(true);
    expect(parsed.isOldBorrowIncentive).toBe(false);
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
});
