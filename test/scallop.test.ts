import { WalletAccount } from '@mysten/wallet-standard';

import { BorrowIntention } from '@/apps/scallop/intentions/lending/borrow';
import { BorrowWithBoostIntention } from '@/apps/scallop/intentions/lending/borrow-with-boost';
import { BorrowWithReferralIntention } from '@/apps/scallop/intentions/lending/borrow-with-referral';
import { DepositCollateralIntention } from '@/apps/scallop/intentions/lending/deposit-collateral';
import { OpenObligationIntention } from '@/apps/scallop/intentions/lending/open-obligation';
import { RepayIntention } from '@/apps/scallop/intentions/lending/repay';
import { RepayWithBoostIntention } from '@/apps/scallop/intentions/lending/repay-with-boost';
import { SupplyLendingIntention } from '@/apps/scallop/intentions/lending/supply-lending';
import { WithdrawCollateralIntention } from '@/apps/scallop/intentions/lending/withdraw-collateral';
import { WithdrawLendingIntention } from '@/apps/scallop/intentions/lending/withdraw-lending';
import { BindReferralIntention } from '@/apps/scallop/intentions/referral/bind-referral';
import { ClaimRevenueReferralIntention } from '@/apps/scallop/intentions/referral/claim-revenue-referral';
import { CreateReferralLinkIntention } from '@/apps/scallop/intentions/referral/create-referral-link';
import { ExtendPeriodAndStakeMoreIntention } from '@/apps/scallop/intentions/staking/extend-period-and-stake-more';
import { ExtendStakePeriodIntention } from '@/apps/scallop/intentions/staking/extend-stake-period';
import { SplitVeScaIntention } from '@/apps/scallop/intentions/staking/split-ve-sca';
import { StakeScaIntention } from '@/apps/scallop/intentions/staking/stake-sca';
import { VeScaObligationBindingsIntention } from '@/apps/scallop/intentions/staking/ve-sca-obligation-bindings';
import { WithdrawStakedScaIntention } from '@/apps/scallop/intentions/staking/withdraw-staked-sca';

import { account, accountWithSusdc, client, Obligation, veScaKey, helper, scallopClient } from './scallop.config';

let initialized = false;
// Build the intention's transaction then round-trip it back through the decoder.
const buildAndDeserialize = async (
  intention: { build: (input: any) => Promise<any> },
  _account: WalletAccount = account,
) => {
  const tx = await intention.build({ suiClient: client, account: _account, network: 'sui:mainnet', scallopClient });
  return helper.deserialize({ transaction: tx, account } as any);
};

describe('Scallop App', () => {
  beforeEach(async () => {
    if (initialized) {
      return;
    }
    initialized = true;
    await scallopClient.init();
  });

  const unlockTime = 1_725_120_000;

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
      veScaKey,
    });

    expect(intention.serialize()).toBe(
      `{"amount":1000,"coinName":"sui","obligationId":"${Obligation.obligationId}","obligationKey":"${Obligation.obligationKey}","veScaKey":"${veScaKey}"}`,
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
      veScaKey,
    });

    expect(intention.serialize()).toBe(
      `{"amount":1000,"coinName":"sui","obligationId":"${Obligation.obligationId}","veScaKey":"${veScaKey}"}`,
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
    const intentionData = {
      unlockTime,
      veScaKey,
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      isObligationLocked: true,
      isOldBorrowIncentive: false,
    };
    const intention = ExtendStakePeriodIntention.fromData(intentionData);

    const serialized = intention.serialize();
    const parsed = JSON.parse(serialized);

    expect(parsed.unlockTime).toBe(unlockTime);
    expect(parsed.veScaKey).toBe(veScaKey);
    expect(parsed.obligationId).toBe(Obligation.obligationId);
    expect(parsed.obligationKey).toBe(Obligation.obligationKey);
    expect(parsed.isObligationLocked).toBe(true);
    expect(parsed.isOldBorrowIncentive).toBe(false);
  });

  it('Test extend stake and lock period intention serialization', () => {
    const intention = ExtendPeriodAndStakeMoreIntention.fromData({
      amount: 2e9,
      unlockTime,
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      veScaKey,
      isObligationLocked: true,
      isOldBorrowIncentive: false,
    });

    const serialized = intention.serialize();
    const parsed = JSON.parse(serialized);

    expect(parsed.amount).toBe(2e9);
    expect(parsed.unlockTime).toBe(unlockTime);
    expect(parsed.obligationId).toBe(Obligation.obligationId);
    expect(parsed.obligationKey).toBe(Obligation.obligationKey);
    expect(parsed.veScaKey).toBe(veScaKey);
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
      veScaKey,
    });

    expect(intention.serialize()).toBe(
      `{"amount":1000,"coinName":"sui","obligationId":"${Obligation.obligationId}","obligationKey":"${Obligation.obligationKey}","veScaKey":"${veScaKey}"}`,
    );
  });

  it('Test stake sca intention serialization', () => {
    const intention = StakeScaIntention.fromData({
      amount: 10e9,
      isObligationLocked: false,
      isOldBorrowIncentive: false,
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      unlockTime,
      veScaKey: undefined,
    });

    expect(intention.serialize()).toBe(
      `{"amount":10000000000,"isObligationLocked":false,"isOldBorrowIncentive":false,"obligationId":"${Obligation.obligationId}","obligationKey":"${Obligation.obligationKey}","unlockTime":${unlockTime}}`,
    );
  });

  it('Test Split VeSca serialization', () => {
    const intention = SplitVeScaIntention.fromData({
      splitAmount: 1e9,
      targetVeScaKey: veScaKey,
    });

    expect(intention.serialize()).toBe(`{"splitAmount":1000000000,"targetVeScaKey":"${veScaKey}"}`);
  });

  it('Test Referral Bind Referral', () => {
    const intention = BindReferralIntention.fromData({
      veScaKey,
    });

    expect(intention.serialize()).toBe(`{"veScaKey":"${veScaKey}"}`);
  });
  it('Test Referral Claim Revenue', () => {
    const intention = ClaimRevenueReferralIntention.fromData({
      veScaKey,
      coins: ['usdt', 'usdc'],
    });

    expect(intention.serialize()).toBe(`{"coins":["usdc","usdt"],"veScaKey":"${veScaKey}"}`);
  });

  it('Test Create Referral Link', () => {
    const intention = CreateReferralLinkIntention.fromData({});

    expect(intention.serialize()).toBe(`{}`);
  });

  it('Test Supply Lending intention deserialization', async () => {
    const intentionData = {
      amount: 1000,
      coinName: 'sui',
    };
    const intention = new SupplyLendingIntention(intentionData);
    const tx = await intention.build({
      suiClient: client,
      account,
      network: 'sui:mainnet',
      scallopClient,
    });

    const deserializedIntentionData = await helper.deserialize({ transaction: tx, account } as any);

    expect(deserializedIntentionData.txType).toBe('Other');
    expect(deserializedIntentionData.txSubType).toBe('SupplyLending');
    expect(deserializedIntentionData.intentionData).toEqual(intentionData);
  });

  it('Test Withdraw Lending intention deserialization', async () => {
    const intentionData = { amount: 1, coinName: 'usdc' };
    const d = await buildAndDeserialize(WithdrawLendingIntention.fromData(intentionData), accountWithSusdc);
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('WithdrawLending');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test Deposit Collateral intention deserialization', async () => {
    const intentionData = {
      amount: 1000,
      collateralCoinName: 'sui',
      obligationId: Obligation.obligationId,
    };
    const d = await buildAndDeserialize(DepositCollateralIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('DepositCollateral');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test Withdraw Collateral intention deserialization', async () => {
    const intentionData = {
      amount: 1000,
      collateralCoinName: 'sui',
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
    };
    const d = await buildAndDeserialize(WithdrawCollateralIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('WithdrawCollateral');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test Borrow intention deserialization', async () => {
    const intentionData = {
      amount: 1000,
      coinName: 'sui',
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
    };
    const d = await buildAndDeserialize(BorrowIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('Borrow');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test Borrow With Boost intention deserialization', async () => {
    const intentionData = {
      amount: 1000,
      coinName: 'sui',
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      veScaKey,
    };
    const d = await buildAndDeserialize(BorrowWithBoostIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('BorrowWithBoost');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test Repay intention deserialization', async () => {
    const intentionData = {
      amount: 1000,
      coinName: 'sui',
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
    };
    const d = await buildAndDeserialize(RepayIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('Repay');
    // The repay tx does not reference the obligation key, so the decoder cannot recover it.
    expect(d.intentionData).toEqual({ amount: 1000, coinName: 'sui', obligationId: Obligation.obligationId });
  });

  // Skipped: build calls unstakeObligationQuick, which requires an on-chain obligation owned by the test account.
  it.skip('Test Repay With Boost intention deserialization', async () => {
    const intentionData = {
      amount: 1000,
      coinName: 'sui',
      obligationId: Obligation.obligationId,
      veScaKey,
    };
    const d = await buildAndDeserialize(RepayWithBoostIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('RepayWithBoost');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test Open Obligation intention deserialization', async () => {
    const intentionData = {};
    const d = await buildAndDeserialize(OpenObligationIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('OpenObligation');
    expect(d.intentionData).toEqual(intentionData);
  });

  // Skipped: this tx decodes as RedeemSca with a veScaKey derived from on-chain account state (not a deterministic round-trip).
  it.skip('Test Withdraw Unlocked Staked SCA intention deserialization', async () => {
    const intentionData = {};
    const d = await buildAndDeserialize(WithdrawStakedScaIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('WithdrawStakedSca');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test extend lock period intention deserialization', async () => {
    const intentionData = {
      unlockTime,
      veScaKey,
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      isObligationLocked: true,
      isOldBorrowIncentive: false,
    };
    const d = await buildAndDeserialize(ExtendStakePeriodIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('ExtendStakePeriod');
    expect(d.intentionData).toEqual(intentionData);
  });

  // Skipped: build calls selectCoins for SCA, requiring the test account to hold SCA balance on mainnet ("No valid coins found").
  it('Test extend stake and lock period intention deserialization', async () => {
    const intentionData = {
      amount: 1e9,
      unlockTime,
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      veScaKey,
      isObligationLocked: true,
      isOldBorrowIncentive: false,
    };
    const d = await buildAndDeserialize(ExtendPeriodAndStakeMoreIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('ExtendPeriodAndStakeMore');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test Borrow With Referral intention deserialization', async () => {
    const intentionData = {
      amount: 1000,
      coinName: 'sui',
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      veScaKey: undefined as string | undefined,
    };
    const d = await buildAndDeserialize(BorrowWithReferralIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('BorrowWithReferral');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test Borrow Boost With Referral intention deserialization', async () => {
    const intentionData = {
      amount: 1000,
      coinName: 'sui',
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      veScaKey,
    };
    const d = await buildAndDeserialize(BorrowWithReferralIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('BorrowWithReferral');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test Referral Bind Referral deserialization', async () => {
    const intentionData = { veScaKey };
    const d = await buildAndDeserialize(BindReferralIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('BindReferral');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test Referral Claim Revenue deserialization', async () => {
    // Use a single valid revenue coin: 'usdt' is not a claimable revenue coin (resolves to an empty type),
    // and multi-coin resolution is non-deterministic.
    const intentionData = { veScaKey, coins: ['usdc'] };
    const d = await buildAndDeserialize(ClaimRevenueReferralIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('ClaimRevenueReferral');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test Create Referral Link deserialization', async () => {
    const intentionData = {};
    const d = await buildAndDeserialize(CreateReferralLinkIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('CreateReferralLink');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test VeSca Obligation Bindings (deactivate) serialization', () => {
    const intention = VeScaObligationBindingsIntention.fromData({
      bindingDatas: [{ action: 'deactivate', args: { veScaKey, obligationId: Obligation.obligationId } }],
    });

    expect(intention.serialize()).toBe(
      `{"bindingDatas":[{"action":"deactivate","args":{"veScaKey":"${veScaKey}","obligationId":"${Obligation.obligationId}"}}]}`,
    );
  });

  it('Test VeSca Obligation Bindings (deactivate) deserialization', async () => {
    const intentionData = {
      bindingDatas: [{ action: 'deactivate' as const, args: { veScaKey, obligationId: Obligation.obligationId } }],
    };
    const d = await buildAndDeserialize(VeScaObligationBindingsIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('VeScaObligationBindings');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test VeSca Obligation Bindings (unstake + stake) deserialization', async () => {
    const intentionData = {
      bindingDatas: [
        {
          action: 'unstake' as const,
          args: { obligationId: Obligation.obligationId, obligationKey: Obligation.obligationKey },
        },
        {
          action: 'stake' as const,
          args: { veScaKey, obligationId: Obligation.obligationId, obligationKey: Obligation.obligationKey },
        },
      ],
    };
    const d = await buildAndDeserialize(VeScaObligationBindingsIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('VeScaObligationBindings');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test Stake Sca without veScaKey deserialization', async () => {
    const intentionData = {
      amount: 1000,
      isObligationLocked: true,
      isOldBorrowIncentive: false,
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      unlockTime,
      veScaKey: undefined as string | undefined,
    };

    const d = await buildAndDeserialize(StakeScaIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('StakeSca');
    expect(d.intentionData).toEqual(intentionData);
  });

  it.skip('Test Stake Sca with veScaKey deserialization', async () => {
    const intentionData = {
      amount: 1000,
      isObligationLocked: true,
      isOldBorrowIncentive: false,
      obligationId: Obligation.obligationId,
      obligationKey: Obligation.obligationKey,
      unlockTime,
      veScaKey,
    };

    const d = await buildAndDeserialize(StakeScaIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('StakeSca');
    expect(d.intentionData).toEqual(intentionData);
  });

  it('Test Split VeSca deserialization', async () => {
    const intentionData = {
      splitAmount: 1e9,
      targetVeScaKey: veScaKey,
    };

    const d = await buildAndDeserialize(SplitVeScaIntention.fromData(intentionData));
    expect(d.txType).toBe('Other');
    expect(d.txSubType).toBe('SplitVeSca');
    expect(d.intentionData).toEqual(intentionData);
  });
});
