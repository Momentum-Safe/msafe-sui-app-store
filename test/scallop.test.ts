import { TransactionType } from '@msafe/sui3-utils';

import { BorrowIntention, BorrowIntentionData } from '@/apps/scallop/intentions/borrow';
import { BorrowWithBoostIntention, BorrowWithBoostIntentionData } from '@/apps/scallop/intentions/borrow-with-boost';
import {
  ClaimBorrowRewardIntention,
  ClaimBorrowRewardIntentionData,
} from '@/apps/scallop/intentions/claim-borrow-reward';
import {
  ClaimSupplyRewardIntention,
  ClaimSupplyRewardIntentionData,
} from '@/apps/scallop/intentions/claim-supply-reward';
import {
  DepositCollateralIntention,
  DepositCollateralIntentionData,
} from '@/apps/scallop/intentions/deposit-collateral';
import { OpenObligationIntention } from '@/apps/scallop/intentions/open-obligation';
import { RepayIntention, RepayIntentionData } from '@/apps/scallop/intentions/repay';
import { StakeSpoolIntention, StakeSpoolIntentionData } from '@/apps/scallop/intentions/stake-spool';
import { SupplyLendingIntention, SupplyLendingIntentionData } from '@/apps/scallop/intentions/supply-lending';
import { UnstakeSpoolIntentionData } from '@/apps/scallop/intentions/unstake-spool';
import {
  WithdrawCollateralIntention,
  WithdrawCollateralIntentionData,
} from '@/apps/scallop/intentions/withdraw-collateral';
import { appHelpers } from '@/index';

import { Account, Client, Obligation, vescaKey } from './scallop.config';

describe('Scallop App', () => {
  it('Test Supply Lending Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'SupplyLending',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        amount: 10000000,
        coinName: 'sui',
      } as SupplyLendingIntentionData,
    });
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Withdraw Lending Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'SupplyLending',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        amount: 10000000,
        coinName: 'sui',
      } as SupplyLendingIntentionData,
    });
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Deposit Collateral Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'DepositCollateral',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        collateralCoinName: 'sui',
        obligationId: Obligation.obligationId,
        amount: 10000000,
        obligationKey: Obligation.obligationKey,
      } as DepositCollateralIntentionData,
    });
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Withdraw Collateral Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'WithdrawCollateral',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        collateralCoinName: 'sui',
        obligationId: Obligation.obligationId,
        amount: 10000000,
        obligationKey: Obligation.obligationKey,
      } as WithdrawCollateralIntentionData,
    });
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Borrow Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'Borrow',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        coinName: 'sui',
        obligationId: Obligation.obligationId,
        amount: 10000000,
        obligationKey: Obligation.obligationKey,
      } as BorrowIntentionData,
    });
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Borrow With Boost Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'BorrowWithBoost',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        coinName: 'sui',
        obligationId: Obligation.obligationId,
        amount: 10000000,
        obligationKey: Obligation.obligationKey,
        vescaKey,
      } as BorrowWithBoostIntentionData,
    });
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Repay Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'Repay',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        coinName: 'sui',
        obligationId: Obligation.obligationId,
        amount: 10000000,
        obligationKey: Obligation.obligationKey,
      } as RepayIntentionData,
    });
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Stake Spool Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'StakeSpool',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        marketCoinName: 'ssui',
        amount: 10000000,
      } as StakeSpoolIntentionData,
    });
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Unstake Spool Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'UnstakeSpool',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        marketCoinName: 'susdc',
        amount: 10000000,
      } as UnstakeSpoolIntentionData,
    });
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Claim Borrow Reward Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'ClaimBorrowReward',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        coinName: 'usdc',
        obligationId: Obligation.obligationId,
        obligationKeyId: Obligation.obligationKey,
      } as ClaimBorrowRewardIntentionData,
    });
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Claim Supply Reward Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'ClaimSupplyReward',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        coinName: 'ssui',
      } as ClaimSupplyRewardIntentionData,
    });
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Open Obligation Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'OpenObligation',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {} as OpenObligationIntention,
    });
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
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
      obligationKey: Obligation.obligationKey,
    });

    expect(intention.serialize()).toBe(
      `{"amount":1000,"collateralCoinName":"sui","obligationId":"${Obligation.obligationId}","obligationKey":"${Obligation.obligationKey}"}`,
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
      vescaKey,
    });

    expect(intention.serialize()).toBe(
      `{"amount":1000,"coinName":"sui","obligationId":"${Obligation.obligationId}","obligationKey":"${Obligation.obligationKey}","vescaKey":"${vescaKey}"}`,
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

  it('Test Claim Borrow Reward intention serialization', () => {
    const intention = ClaimBorrowRewardIntention.fromData({
      coinName: 'usdc',
      obligationId: Obligation.obligationId,
      obligationKeyId: Obligation.obligationKey,
    });

    expect(intention.serialize()).toBe(
      `{"coinName":"usdc","obligationId":"${Obligation.obligationId}","obligationKeyId":"${Obligation.obligationKey}"}`,
    );
  });

  it('Test Claim Supply Reward intention serialization', () => {
    const intention = ClaimSupplyRewardIntention.fromData({
      coinName: 'ssui',
    });

    expect(intention.serialize()).toBe('{"coinName":"ssui"}');
  });

  it('Test Open Obligation intention serialization', () => {
    const intention = OpenObligationIntention.fromData({});

    expect(intention.serialize()).toBe('{}');
  });
});
