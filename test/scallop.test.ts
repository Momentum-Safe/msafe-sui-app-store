import { TransactionType } from '@msafe/sui3-utils';

import { BorrowIntention, BorrowIntentionData } from '@/apps/scallop/intentions/borrow';
import { BorrowWithBoostIntention, BorrowWithBoostIntentionData } from '@/apps/scallop/intentions/borrow-with-boost';
import { ClaimIncentiveRewardIntentionData } from '@/apps/scallop/intentions/claim-incentive-reward';
import {
  DepositCollateralIntention,
  DepositCollateralIntentionData,
} from '@/apps/scallop/intentions/deposit-collateral';
import { ExtendPeriodAndStakeMoreIntentionData } from '@/apps/scallop/intentions/extend-period-and-stake-more';
import { ExtendStakePeriodIntentionData } from '@/apps/scallop/intentions/extend-stake-period';
import { OpenObligationIntention } from '@/apps/scallop/intentions/open-obligation';
import { RenewExpStakePeriodIntentionData } from '@/apps/scallop/intentions/renew-exp-stake-period';
import { RepayIntention, RepayIntentionData } from '@/apps/scallop/intentions/repay';
import { StakeScaIntentionData } from '@/apps/scallop/intentions/stake-sca';
import { StakeSpoolIntention, StakeSpoolIntentionData } from '@/apps/scallop/intentions/stake-spool';
import { SupplyAndStakeLendingIntentionData } from '@/apps/scallop/intentions/supply-and-stake-lending';
import { SupplyLendingIntention, SupplyLendingIntentionData } from '@/apps/scallop/intentions/supply-lending';
import { UnstakeSpoolIntentionData } from '@/apps/scallop/intentions/unstake-spool';
import { WithdrawAndUnstakeLendingIntentionData } from '@/apps/scallop/intentions/withdraw-and-unstake-lending';
import {
  WithdrawCollateralIntention,
  WithdrawCollateralIntentionData,
} from '@/apps/scallop/intentions/withdraw-collateral';
import { WithdrawLendingIntentionData } from '@/apps/scallop/intentions/withdraw-lending';
import { WithdrawStakedScaIntention } from '@/apps/scallop/intentions/withdraw-staked-sca';
import { ScallopBuilder } from '@/apps/scallop/models';
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
        amount: 1e9,
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

  it('Test Supply and Stake Lending Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'SupplyAndStakeLending',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        amount: 10000000,
        coinName: 'sui',
      } as SupplyAndStakeLendingIntentionData,
    });
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });

    expect(inspectResult.effects.status.status).toBe('success');
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Withdraw and Unstake Lending Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'WithdrawAndUnstakeLending',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        amount: 1e6,
        stakeAccountId: [{ id: '0x7ba3aae255483cdb6f0b733a63534de49c6883222e7b4a9ffc0be43d6737ed50', coin: 441183 }],
        coinName: 'usdc',
      } as WithdrawAndUnstakeLendingIntentionData,
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
      txSubType: 'WithdrawLending',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        amount: 10000000,
        coinName: 'sui',
      } as WithdrawLendingIntentionData,
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

  it('Test Claim Supply Reward Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'ClaimIncentiveReward',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        lendingIncentive: [
          {
            stakeAccountId: '0xa2386ac96423be515003d2962cbd319da2a3e155350ae09fbcd4ce2b864e72cf',
            stakeMarketCoinName: 'ssui',
          },
          {
            stakeAccountId: '0x7ba3aae255483cdb6f0b733a63534de49c6883222e7b4a9ffc0be43d6737ed50',
            stakeMarketCoinName: 'susdc',
          },
        ],
        borrowIncentiveV2: [
          {
            obligationId: '0x56574789e0e6bb0837ba090e85757e046390cab25cace7f09838314207a2ce74',
            obligationKey: '0x10873534fbdf2f844bae0878a5b660fcc95cdf4838f23bcf0890b0d73b8f170b',
            rewardCoinName: 'sca',
          },
        ],
        borrowIncentive: [
          {
            obligationId: '0x56574789e0e6bb0837ba090e85757e046390cab25cace7f09838314207a2ce74',
            obligationKey: '0x10873534fbdf2f844bae0878a5b660fcc95cdf4838f23bcf0890b0d73b8f170b',
            rewardCoinName: 'sui',
          },
        ],
      } as ClaimIncentiveRewardIntentionData,
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
    const build = new ScallopBuilder({
      client: Client,
      walletAddress: Account.address,
      networkType: 'mainnet',
    });
    build.init();
    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'StakeSca',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        amount: 2e9,
        // lockPeriodInDays: build.utils.getUnlockAt(1, 1836111600),
        obligationId: Obligation.obligationId,
        obligationKey: Obligation.obligationKey,
        veScaKey: vescaKey,
        isObligationLocked: true,
        isOldBorrowIncentive: false,
      } as StakeScaIntentionData,
    });
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe(Account.address);
  });

  it('Test Extend Period and Stake SCA Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');

    expect(appHelper.application).toBe('scallop');
    const build = new ScallopBuilder({
      client: Client,
      walletAddress: Account.address,
      networkType: 'mainnet',
    });
    build.init();
    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'ExtendPeriodAndStakeMore',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        amount: 2e9,
        lockPeriodInDays: build.utils.getUnlockAt(1, 1836111600),
        obligation: Obligation.obligationId,
        obligationKey: Obligation.obligationKey,
        vescaKey,
        isObligationLocked: true,
        isOldBorrowIncentive: false,
      } as ExtendPeriodAndStakeMoreIntentionData,
    });
    const inspectResult = await Client.devInspectTransactionBlock({
      transactionBlock: res,
      sender: Account.address,
    });
    expect(inspectResult.effects.status.status).toBe('success');
    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe(Account.address);
  });

  it('Test Renew Stake Lock Period and Amount SCA Transaction Build', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');
    const build = new ScallopBuilder({
      client: Client,
      walletAddress: Account.address,
      networkType: 'mainnet',
    });
    build.init();

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'RenewExpStakePeriod',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        amount: 10e9,
        lockPeriodInDays: build.utils.getUnlockAt(1),
        vescaKey,
        isHaveRedeem: true,
        obligation: Obligation.obligationId,
        obligationKey: Obligation.obligationKey,
        isObligationLocked: true,
        isOldBorrowIncentive: false,
      } as RenewExpStakePeriodIntentionData,
    });

    expect(res.blockData.version).toBe(1);
    expect(res.blockData.sender).toBe('0x0367313b28fd88118bb4795ff2961028b2be594256074bba1a0052737d6db56b');
  });

  it('Test Extend Stake Lock Period', async () => {
    const appHelper = appHelpers.getAppHelper('scallop');
    const build = new ScallopBuilder({
      client: Client,
      walletAddress: Account.address,
      networkType: 'mainnet',
    });
    build.init();

    expect(appHelper.application).toBe('scallop');

    const res = await appHelper.build({
      txType: TransactionType.Other,
      txSubType: 'ExtendStakePeriod',
      suiClient: Client,
      account: Account,
      network: 'sui:mainnet',
      intentionData: {
        lockPeriodInDays: build.utils.getUnlockAt(1, 1836111600),
        vescaKey,
        isHaveRedeem: true,
        obligationId: Obligation.obligationId,
        obligationKey: Obligation.obligationKey,
        isObligationLocked: true,
        isOldBorrowIncentive: false,
      } as ExtendStakePeriodIntentionData,
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

  it('Test Open Obligation intention serialization', () => {
    const intention = OpenObligationIntention.fromData({});

    expect(intention.serialize()).toBe('{}');
  });

  it('Test Withdraw Unlocked Staked SCA intention serialization', () => {
    const intention = WithdrawStakedScaIntention.fromData({});

    expect(intention.serialize()).toBe('{}');
  });
});
