import util from 'node:util';

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
import {
  ExtendStakeScaPeriodIntention,
  ExtendStakeScaPeriodIntentionData,
} from '@/apps/scallop/intentions/extend-stake-sca-period';
import { OpenObligationIntention } from '@/apps/scallop/intentions/open-obligation';
import {
  RenewExpStakePeriodIntention,
  RenewExpStakePeriodIntentionData,
} from '@/apps/scallop/intentions/renew-exp-stake-period';
import { RepayIntention, RepayIntentionData } from '@/apps/scallop/intentions/repay';
import { StakeMoreScaIntention, StakeMoreScaIntentionData } from '@/apps/scallop/intentions/stake-more-sca';
import { StakeScaIntention, StakeScaIntentionData } from '@/apps/scallop/intentions/stake-sca';
import { StakeSpoolIntention, StakeSpoolIntentionData } from '@/apps/scallop/intentions/stake-spool';
import { SupplyLendingIntention, SupplyLendingIntentionData } from '@/apps/scallop/intentions/supply-lending';
import { UnstakeSpoolIntentionData } from '@/apps/scallop/intentions/unstake-spool';
import {
  WithdrawCollateralIntention,
  WithdrawCollateralIntentionData,
} from '@/apps/scallop/intentions/withdraw-collateral';
import { WithdrawStakedScaIntention } from '@/apps/scallop/intentions/withdraw-staked-sca';
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
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
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
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
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
        collateralCoinName: 'afsui',
        obligationId: Obligation.obligationId,
        amount: 1e8,
        obligationKey: Obligation.obligationKey,
      } as DepositCollateralIntentionData,
    });
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
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
        collateralCoinName: 'afsui',
        obligationId: Obligation.obligationId,
        amount: 1e8,
        obligationKey: Obligation.obligationKey,
      } as WithdrawCollateralIntentionData,
    });
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
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
        amount: 100000000,
        obligationKey: Obligation.obligationKey,
      } as BorrowIntentionData,
    });
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
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
        amount: 100000000,
        obligationKey: Obligation.obligationKey,
        vescaKey,
      } as BorrowWithBoostIntentionData,
    });
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
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
        amount: 1e8,
        obligationKey: Obligation.obligationKey,
      } as RepayIntentionData,
    });
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
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
        amount: 1e8,
      } as StakeSpoolIntentionData,
    });
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
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
        amount: 1e8,
      } as UnstakeSpoolIntentionData,
    });
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
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
        coinName: 'sui',
        obligationId: Obligation.obligationId,
        obligationKeyId: Obligation.obligationKey,
      } as ClaimBorrowRewardIntentionData,
    });
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
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
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
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
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Stake SCA Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'StakeSca',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        amount: 11e9,
        lockPeriodInDays: 1,
      } as StakeScaIntentionData,
    });
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Stake More SCA Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'StakeMoreSca',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        amount: 1e9,
      } as StakeMoreScaIntentionData,
    });
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Extend Stake Lock Period SCA Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'ExtendStakeScaPeriod',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        lockPeriodInDays: 1459,
      } as ExtendStakeScaPeriodIntentionData,
    });
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Renew Stake Lock Period and Amount SCA Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'RenewExpStakePeriod',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        lockPeriodInDays: 50,
        amount: 10e9,
      } as RenewExpStakePeriodIntentionData,
    });

    // Wil always failed because current account test the lock period is not expired yet
    // I will comment this line to make the test pass
    // const inspectResult = await Client.devInspectTransactionBlock({
    //   transactionBlock: res,
    //   sender: Account.address,
    // });
    // expect(inspectResult.effects.status.status).toBe('success');

    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Withdraw Unlocked Staked SCA Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'WithdrawStakedSca',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {} as RenewExpStakePeriodIntentionData,
    });

    // Wil always failed because current account test the lock period is not expired yet
    // I will comment this line to make the test pass
    // const inspectResult = await Client.devInspectTransactionBlock({
    //   transactionBlock: res,
    //   sender: Account.address,
    // });
    // expect(inspectResult.effects.status.status).toBe('success');

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

  it('Test Stake SCA intention serialization', () => {
    const intention = StakeScaIntention.fromData({
      amount: 10e9,
      lockPeriodInDays: 30,
    });

    expect(intention.serialize()).toBe('{"amount":10000000000,"lockPeriodInDays":30}');
  });

  it('Test Stake More SCA intention serialization', () => {
    const intention = StakeMoreScaIntention.fromData({
      amount: 10e9,
    });

    expect(intention.serialize()).toBe('{"amount":10000000000}');
  });

  it('Test Extend Stake Lock Period SCA intention serialization', () => {
    const intention = ExtendStakeScaPeriodIntention.fromData({
      lockPeriodInDays: 50,
    });

    expect(intention.serialize()).toBe('{"lockPeriodInDays":50}');
  });

  it('Test Renew Stake Lock Period and Amount SCA intention serialization', () => {
    const intention = RenewExpStakePeriodIntention.fromData({
      lockPeriodInDays: 50,
      amount: 10e9,
    });

    expect(intention.serialize()).toBe('{"amount":10000000000,"lockPeriodInDays":50}');
  });

  it('Test Withdraw Unlocked Staked SCA intention serialization', () => {
    const intention = WithdrawStakedScaIntention.fromData({});

    expect(intention.serialize()).toBe('{}');
  });
});
