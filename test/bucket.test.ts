import {
  PsmIntentionData,
  BorrowIntentionData,
  RepayIntentionData,
  WithdrawIntentionData,
  SBUCKClaimIntentionData,
  SBUCKDepositIntentionData,
  SBUCKUnstakeIntentionData,
  SBUCKWithdrawIntentionData,
  LockClaimIntentionData,
  CloseIntentionData,
  TankDepositIntentionData,
  TankClaimIntentionData,
  TankWithdrawIntentionData,
} from '@/apps/bucket/api';
import { Decoder } from '@/apps/bucket/decoder';
import { Transaction } from '@mysten/sui/transactions';
import {
  BucketClient,
  buildBorrowTx,
  buildCloseTx,
  buildLockedClaimTx,
  buildPsmTx,
  buildRepayTx,
  buildSBUCKClaimTx,
  buildSBUCKDepositTx,
  buildSBUCKUnstakeTx,
  buildSBUCKWithdrawTx,
  buildTankClaimTx,
  buildTankDepositTx,
  buildTankWithdrawTx,
  buildWithdrawTx,
  COINS_TYPE_LIST,
} from 'bucket-protocol-sdk';

const address = '0x3662e00a85fdae17d5732770b8d0658105fe9c0ca91c259790e6fb1498686abc';

describe('Bucket App', () => {
  it('Test psm-in deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const coinType = COINS_TYPE_LIST.SUI;
    const amount = '10000000000';
    const buckToCoin = true;
    await buildPsmTx(bucketClient, tx, coinType, amount, buckToCoin, address);

    const decoder = new Decoder(tx);
    const result = decoder.decode();

    expect(result.type).toBe('psm');
    const intentionData = result.intentionData as PsmIntentionData;
    expect(intentionData.coinType).toBe(coinType);
    expect(intentionData.amount).toBe(amount);
    expect(intentionData.buckToCoin).toBe(buckToCoin);
  });

  it('Test psm-out deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const coinType = COINS_TYPE_LIST.AUSD;
    const amount = '10000000000';
    const buckToCoin = false;
    await buildPsmTx(bucketClient, tx, coinType, amount, buckToCoin, address);

    const decoder = new Decoder(tx);
    const result = decoder.decode();

    expect(result.type).toBe('psm');
    const intentionData = result.intentionData as PsmIntentionData;
    expect(intentionData.coinType).toBe(coinType);
    expect(intentionData.amount).toBe(amount);
    expect(intentionData.buckToCoin).toBe(buckToCoin);
  });

  it('Test tank-deposit deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const coinType = COINS_TYPE_LIST.AUSD;
    const amount = '10000000000';
    await buildTankDepositTx(bucketClient, tx, coinType, amount, address);

    const decoder = new Decoder(tx);
    const result = decoder.decode();

    expect(result.type).toBe('tank-deposit');
    const intentionData = result.intentionData as TankDepositIntentionData;
    expect(intentionData.coinType).toBe(coinType);
    expect(intentionData.amount).toBe(amount);
  });

  it('Test tank-withdraw deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const coinType = COINS_TYPE_LIST.AUSD;
    const amount = '10000000000';
    await buildTankWithdrawTx(bucketClient, tx, coinType, amount, address);

    const decoder = new Decoder(tx);
    const result = decoder.decode();

    expect(result.type).toBe('tank-withdraw');
    const intentionData = result.intentionData as TankWithdrawIntentionData;
    expect(intentionData.coinType).toBe(coinType);
    expect(intentionData.amount).toBe(amount);
  });

  it('Test tank-claim deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const coinType = COINS_TYPE_LIST.AUSD;
    await buildTankClaimTx(bucketClient, tx, coinType, address);

    const decoder = new Decoder(tx);
    const result = decoder.decode();

    expect(result.type).toBe('tank-claim');
    const intentionData = result.intentionData as TankClaimIntentionData;
    expect(intentionData.coinType).toBe(coinType);
  });

  it('Test create LST position deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const collateralType = COINS_TYPE_LIST.afSUI;
    const collateralAmount = '10000000000';
    const borrowAmount = '150000';
    const insertionPlace: string | undefined = '0x0000000000000000000000000000000000000000000000000000000000010001';
    const strapId: string | undefined = 'new';
    await buildBorrowTx(
      bucketClient,
      tx,
      collateralType,
      collateralAmount,
      borrowAmount,
      address,
      insertionPlace,
      strapId,
    );

    const decoder = new Decoder(tx);
    const result = decoder.decode();

    expect(result.type).toBe('borrow');
    const intentionData = result.intentionData as BorrowIntentionData;
    expect(intentionData.collateralType).toBe(collateralType);
    expect(intentionData.collateralAmount).toBe(collateralAmount);
    expect(intentionData.borrowAmount).toBe(borrowAmount);
    expect(intentionData.insertionPlace).toBe(insertionPlace);
    expect(intentionData.strapId).toBe(strapId);
  });

  it('Test borrow deserialize (non-LST)', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const collateralType = COINS_TYPE_LIST.CETUS;
    const collateralAmount = '10000000000';
    const borrowAmount = '50000';
    const insertionPlace: string | undefined = '0x0000000000000000000000000000000000000000000000000000000000010001';
    const strapId: string | undefined = undefined;
    await buildBorrowTx(
      bucketClient,
      tx,
      collateralType,
      collateralAmount,
      borrowAmount,
      address,
      insertionPlace,
      strapId,
    );

    const decoder = new Decoder(tx);
    const result = decoder.decode();

    expect(result.type).toBe('borrow');
    const intentionData = result.intentionData as BorrowIntentionData;
    expect(intentionData.collateralType).toBe(collateralType);
    expect(intentionData.collateralAmount).toBe(collateralAmount);
    expect(intentionData.borrowAmount).toBe(borrowAmount);
    expect(intentionData.insertionPlace).toBe(insertionPlace);
    expect(intentionData.strapId).toBe(strapId);
  });

  it('Test borrow deserialize (Locked)', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const collateralType = COINS_TYPE_LIST.afSUI;
    const collateralAmount = '10000000000';
    const borrowAmount = '50000';
    const insertionPlace: string | undefined = '0x0000000000000000000000000000000000000000000000000000000000010001';
    const strapId: string | undefined = 'locked';
    await buildBorrowTx(
      bucketClient,
      tx,
      collateralType,
      collateralAmount,
      borrowAmount,
      address,
      insertionPlace,
      strapId,
    );

    const decoder = new Decoder(tx);
    const result = decoder.decode();

    expect(result.type).toBe('borrow');
    const intentionData = result.intentionData as BorrowIntentionData;
    expect(intentionData.collateralType).toBe(collateralType);
    expect(intentionData.collateralAmount).toBe(collateralAmount);
    expect(intentionData.borrowAmount).toBe(borrowAmount);
    expect(intentionData.insertionPlace).toBe(insertionPlace);
    expect(intentionData.strapId).toBe(strapId);
  });

  it('Test borrow deserialize (LST)', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const collateralType = COINS_TYPE_LIST.afSUI;
    const collateralAmount = '10000000000';
    const borrowAmount = '50000';
    const insertionPlace: string | undefined = '0x0000000000000000000000000000000000000000000000000000000000010001';
    const strapId: string | undefined = '0x0000000000000000000000000000000000000000000000000000000000010002';
    await buildBorrowTx(
      bucketClient,
      tx,
      collateralType,
      collateralAmount,
      borrowAmount,
      address,
      insertionPlace,
      strapId,
    );

    const decoder = new Decoder(tx);
    const result = decoder.decode();

    expect(result.type).toBe('borrow');
    const intentionData = result.intentionData as BorrowIntentionData;
    expect(intentionData.collateralType).toBe(collateralType);
    expect(intentionData.collateralAmount).toBe(collateralAmount);
    expect(intentionData.borrowAmount).toBe(borrowAmount);
    expect(intentionData.insertionPlace).toBe(insertionPlace);
    expect(intentionData.strapId).toBe(strapId);
  });

  it('Test withdraw deserialize (non-LST)', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const collateralType = COINS_TYPE_LIST.CETUS;
    const withdrawAmount = '50000';
    const insertionPlace: string | undefined = '0x0000000000000000000000000000000000000000000000000000000000010001';
    const strapId: string | undefined = undefined;
    await buildWithdrawTx(bucketClient, tx, collateralType, withdrawAmount, address, insertionPlace, strapId);

    const decoder = new Decoder(tx);
    const result = decoder.decode();

    expect(result.type).toBe('withdraw');
    const intentionData = result.intentionData as WithdrawIntentionData;
    expect(intentionData.collateralType).toBe(collateralType);
    expect(intentionData.withdrawAmount).toBe(withdrawAmount);
    expect(intentionData.insertionPlace).toBe(insertionPlace);
    expect(intentionData.strapId).toBe(strapId);
  });

  it('Test withdraw deserialize (Locked)', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const collateralType = COINS_TYPE_LIST.afSUI;
    const withdrawAmount = '50000';
    const insertionPlace: string | undefined = '0x0000000000000000000000000000000000000000000000000000000000010001';
    const strapId: string | undefined = 'locked';
    await buildWithdrawTx(bucketClient, tx, collateralType, withdrawAmount, address, insertionPlace, strapId);

    const decoder = new Decoder(tx);
    const result = decoder.decode();

    expect(result.type).toBe('withdraw');
    const intentionData = result.intentionData as WithdrawIntentionData;
    expect(intentionData.collateralType).toBe(collateralType);
    expect(intentionData.withdrawAmount).toBe(withdrawAmount);
    expect(intentionData.insertionPlace).toBe(insertionPlace);
    expect(intentionData.strapId).toBe(strapId);
  });

  it('Test withdraw deserialize (LST)', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const collateralType = COINS_TYPE_LIST.afSUI;
    const withdrawAmount = '50000';
    const insertionPlace: string | undefined = '0x0000000000000000000000000000000000000000000000000000000000010001';
    const strapId: string | undefined = '0x0000000000000000000000000000000000000000000000000000000000010002';
    await buildWithdrawTx(bucketClient, tx, collateralType, withdrawAmount, address, insertionPlace, strapId);

    const decoder = new Decoder(tx);
    const result = decoder.decode();

    expect(result.type).toBe('withdraw');
    const intentionData = result.intentionData as WithdrawIntentionData;
    expect(intentionData.collateralType).toBe(collateralType);
    expect(intentionData.withdrawAmount).toBe(withdrawAmount);
    expect(intentionData.insertionPlace).toBe(insertionPlace);
    expect(intentionData.strapId).toBe(strapId);
  });

  it('Test repay deserialize (non-LST)', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const collateralType = COINS_TYPE_LIST.SCA;
    const repayAmount = '10000000000';
    const withdrawAmount = '50000';
    const isSurplus = false;
    const insertionPlace: string | undefined = '0x0000000000000000000000000000000000000000000000000000000000010001';
    const strapId: string | undefined = undefined;
    await buildRepayTx(
      bucketClient,
      tx,
      collateralType,
      repayAmount,
      withdrawAmount,
      address,
      isSurplus,
      insertionPlace,
      strapId,
    );

    const decoder = new Decoder(tx);
    const result = decoder.decode();
    expect(result.type).toBe('repay');
    const intentionData = result.intentionData as RepayIntentionData;
    expect(intentionData.collateralType).toBe(collateralType);
    expect(intentionData.repayAmount).toBe(repayAmount);
    expect(intentionData.withdrawAmount).toBe(withdrawAmount);
    expect(intentionData.insertionPlace).toBe(insertionPlace);
    expect(intentionData.strapId).toBe(strapId);
  });

  it('Test repay deserialize (Locked)', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const collateralType = COINS_TYPE_LIST.afSUI;
    const repayAmount = '10000000000';
    const withdrawAmount = '50000';
    const isSurplus = false;
    const insertionPlace: string | undefined = '0x0000000000000000000000000000000000000000000000000000000000010001';
    const strapId: string | undefined = 'locked';
    await buildRepayTx(
      bucketClient,
      tx,
      collateralType,
      repayAmount,
      withdrawAmount,
      address,
      isSurplus,
      insertionPlace,
      strapId,
    );

    const decoder = new Decoder(tx);
    const result = decoder.decode();
    expect(result.type).toBe('repay');
    const intentionData = result.intentionData as RepayIntentionData;
    expect(intentionData.collateralType).toBe(collateralType);
    expect(intentionData.repayAmount).toBe(repayAmount);
    expect(intentionData.withdrawAmount).toBe(withdrawAmount);
    expect(intentionData.insertionPlace).toBe(insertionPlace);
    expect(intentionData.strapId).toBe(strapId);
  });

  it('Test repay deserialize (LST)', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const collateralType = COINS_TYPE_LIST.afSUI;
    const repayAmount = '10000000000';
    const withdrawAmount = '50000';
    const isSurplus = false;
    const insertionPlace: string | undefined = '0x0000000000000000000000000000000000000000000000000000000000010001';
    const strapId: string | undefined = '0x0000000000000000000000000000000000000000000000000000000000010002';
    await buildRepayTx(
      bucketClient,
      tx,
      collateralType,
      repayAmount,
      withdrawAmount,
      address,
      isSurplus,
      insertionPlace,
      strapId,
    );

    const decoder = new Decoder(tx);
    const result = decoder.decode();
    expect(result.type).toBe('repay');
    const intentionData = result.intentionData as RepayIntentionData;
    expect(intentionData.collateralType).toBe(collateralType);
    expect(intentionData.repayAmount).toBe(repayAmount);
    expect(intentionData.withdrawAmount).toBe(withdrawAmount);
    expect(intentionData.insertionPlace).toBe(insertionPlace);
    expect(intentionData.strapId).toBe(strapId);
  });

  it('Test close deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const collateralType = COINS_TYPE_LIST.afSUI;
    const strapId: string | undefined = 'locked';
    await buildCloseTx(bucketClient, tx, collateralType, address, strapId);

    const decoder = new Decoder(tx);
    const result = decoder.decode();
    expect(result.type).toBe('close');
    const intentionData = result.intentionData as CloseIntentionData;
    expect(intentionData.collateralType).toBe(collateralType);
    expect(intentionData.strapId).toBe(strapId);
  });

  it('Test sbuck-deposit deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const coinType = COINS_TYPE_LIST.BUCK;
    const amount = '10000000000';
    const isStake = true;
    await buildSBUCKDepositTx(bucketClient, tx, coinType, amount, address, isStake);

    const decoder = new Decoder(tx);
    const result = decoder.decode();
    expect(result.type).toBe('sbuck-deposit');
    const intentionData = result.intentionData as SBUCKDepositIntentionData;
    expect(intentionData.coinType).toBe(coinType);
    expect(intentionData.amount).toBe(amount);
    expect(intentionData.isStake).toBe(isStake);
  });

  it('Test sbuck-unstake deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const amount = '1000000000';
    const isStake = true;
    const toBuck = true;
    const stakeProofs: string[] = [
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000000000000000000000000000003',
    ];
    await buildSBUCKUnstakeTx(bucketClient, tx, stakeProofs, amount, address, isStake, toBuck);

    const decoder = new Decoder(tx);
    const result = decoder.decode();
    expect(result.type).toBe('sbuck-unstake');
    const intentionData = result.intentionData as SBUCKUnstakeIntentionData;
    expect(intentionData.amount).toBe(amount);
    expect(intentionData.isStake).toBe(isStake);
    expect(intentionData.toBuck).toBe(toBuck);
    expect(intentionData.stakeProofs.length).toBe(stakeProofs.length);
    expect(intentionData.stakeProofs[0]).toBe(stakeProofs[0]);
  });

  it('Test sbuck-withdraw deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const amount = '1000000000';
    await buildSBUCKWithdrawTx(bucketClient, tx, amount, address);

    const decoder = new Decoder(tx);
    const result = decoder.decode();
    expect(result.type).toBe('sbuck-withdraw');
    const intentionData = result.intentionData as SBUCKWithdrawIntentionData;
    expect(intentionData.amount).toBe(amount);
  });

  it('Test sbuck-claim deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const stakeProofs: string[] = [
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000000000000000000000000000003',
    ];
    await buildSBUCKClaimTx(bucketClient, tx, stakeProofs, address);

    const decoder = new Decoder(tx);
    const result = decoder.decode();
    expect(result.type).toBe('sbuck-claim');
    const intentionData = result.intentionData as SBUCKClaimIntentionData;
    expect(intentionData.stakeProofs.length).toBe(stakeProofs.length);
    expect(intentionData.stakeProofs[0]).toBe(stakeProofs[0]);
  });

  it('Test lock-claim deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const coinType = COINS_TYPE_LIST.sBUCK;
    const proofCount = 5;
    await buildLockedClaimTx(bucketClient, tx, COINS_TYPE_LIST.sBUCK, 5, address);

    const decoder = new Decoder(tx);
    const result = decoder.decode();
    expect(result.type).toBe('lock-claim');
    const intentionData = result.intentionData as LockClaimIntentionData;
    expect(intentionData.coinType).toBe(coinType);
    expect(intentionData.proofCount).toBe(proofCount);
  });
});
