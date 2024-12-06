import { BorrowIntentionData, RepayIntentionData, WithdrawIntentionData } from "@/apps/bucket/api/lending";
import { LockClaimIntentionData } from "@/apps/bucket/api/lock";
import { PsmIntentionData } from "@/apps/bucket/api/psm";
import { SBUCKClaimIntentionData, SBUCKDepositIntentionData, SBUCKUnstakeIntentionData, SBUCKWithdrawIntentionData } from "@/apps/bucket/api/sbuck";
import { Decoder } from "@/apps/bucket/decoder";
import { PsmInIntention } from "@/apps/bucket/intentions/psmIn";
import { fromB64 } from "@mysten/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { BucketClient, buildBorrowTx, buildLockedClaimTx, buildRepayTx, buildSBUCKClaimTx, buildSBUCKDepositTx, buildSBUCKUnstakeTx, buildSBUCKWithdrawTx, buildWithdrawTx, COINS_TYPE_LIST } from "bucket-protocol-sdk";

const address = "0x3662e00a85fdae17d5732770b8d0658105fe9c0ca91c259790e6fb1498686abc";

describe('Bucket App', () => {
  it('Test Bucket intention serialization', () => {
    const intention = PsmInIntention.fromData({
      coinType: '0x2::sui::SUI',
      amount: '1000000',
    });

    expect(intention.serialize()).toBe('{"amount":"1000000","coinType":"0x2::sui::SUI"}');
  });

  it('Test psm-in deserialize', () => {
    const transaction = Transaction.from(
      fromB64(
        'AAAFAQBAmJLKprAXNyfdfIpvrScZ/gWt3RTqhjBto8501TsD1KvWjhgAAAAAIHWQmnYFH34C2ZtNk3ekmh/QFewjHyRUh6gTmKIlKtDTAQADIhoXBiQxYMS5Nl7t3BwgvTd/KC/jpszdkkmVxbl3emqyahgAAAAAIPAkJkfBinIT7MpSVQghn01prAAo8aaMniF2988awIDkAAhwb5gAAAAAAAEBnj2rEyErJ/VDRBaTnbXexqMZ0VuJqE/QdNA+zmNQ098XI2EAAAAAAAEAIDZi4AqF/a4X1XMncLjQZYEF/pwMqRwll5Dm+xSYaGq8BwMBAAABAQEAAgEAAAEBAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIEY29pbgxpbnRvX2JhbGFuY2UBB9ujRnLjDLBlsfk+OrVTGHaP1v72bBWULJ98uEbi+QDnBHVzZGMEVVNEQwABAwEAAAAAtxwIkyA9D1liL8P6yEnQgz3lWddQOvIcXa+IDWDXVO0EYnVjaxBjaGFyZ2VfcmVzZXJ2b2lyAQfbo0Zy4wywZbH5Pjq1Uxh2j9b+9mwVlCyffLhG4vkA5wR1c2RjBFVTREMAAgEDAAICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgRjb2luDGZyb21fYmFsYW5jZQEHzn/3eoPqDLb9Ob2HSOLsiaP0Ho79w/TrEj4Mo3sYTbIEYnVjawRCVUNLAAECAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIEY29pbgV2YWx1ZQEHzn/3eoPqDLb9Ob2HSOLsiaP0Ho79w/TrEj4Mo3sYTbIEYnVjawRCVUNLAAECBAABAQIEAAEEADZi4AqF/a4X1XMncLjQZYEF/pwMqRwll5Dm+xSYaGq8AQCHmWBQMpsnzW3EEQg6YR9090t2y91UmW40nRm7r3Jjq9aOGAAAAAAg8bfEWDe/KxoedZVeGKTx/3T/qWvmENHs6aHO4bvLiyE2YuAKhf2uF9VzJ3C40GWBBf6cDKkcJZeQ5vsUmGhqvO4CAAAAAAAAhK0yAAAAAAAA',
      ),
    );
    const decoder = new Decoder(transaction);
    const result = decoder.decode();

    expect(result.type).toBe('psm-in');
    const intentionData = result.intentionData as PsmIntentionData;
    expect(intentionData.coinType).toBe('0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC');
    expect(intentionData.amount).toBe('9990000');
  });

  it('Test psm-out deserialize', () => {
    const transaction = Transaction.from(
      fromB64(
        'AAAKAQC/yOzelkaUUClR2X4h1Ph6aFzFTCtiEDGWD9gZywvUFngBfRgAAAAAIHVmvCRFsClqH7wKNTd2pp0i5tGSf6Yp/Ktct7JmDoh+AAgA5AtUAgAAAAEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAAAAAAAAABAZ49qxMhKyf1Q0QWk5213sajGdFbiahP0HTQPs5jUNPfFyNhAAAAAAABAQE7nld+lvzAvHoGo5+C8WZBf2dYE6KU1kgz1K2yIp9jIc9ZRRAAAAAAAQEBB4ccSzyEeg9nRRDUl41c9vlgRSeV6P9vGJ/SCIo/asdYf3YAAAAAAAABAadXl1JVFG3JaGqoI7eDi1B/MV1wT0KMutrS9OoGGTnZWH92AAAAAAABAQFraLQsu078zZ3zBGbCH/88CQJ5mSwAXEUVS9Gg2HrHJdFZRRAAAAAAAQEBSs5mSN3GTmRrpHqVfFYsMslZmzu6j1rBqtsq4jovjKDCqUcBAAAAAAEAIDZi4AqF/a4X1XMncLjQZYEF/pwMqRwll5Dm+xSYaGq8BgIBAAABAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBGNvaW4MaW50b19iYWxhbmNlAQfOf/d6g+oMtv05vYdI4uyJo/Qejv3D9OsSPgyjexhNsgRidWNrBEJVQ0sAAQMAAAAAALccCJMgPQ9ZYi/D+shJ0IM95VnXUDryHF2viA1g11TtBGJ1Y2sTZGlzY2hhcmdlX3Jlc2Vydm9pcgEHCKejyHNALXz51EGSquM34LJ6csKkojDRAjBIjPYUxaIGc2NhYmxlBlNDQUJMRQACAQMAAgEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBGNvaW4MZnJvbV9iYWxhbmNlAQcIp6PIc0AtfPnUQZKq4zfgsnpywqSiMNECMEiM9hTFogZzY2FibGUGU0NBQkxFAAECAgAA7MPo3saHgtvUC99BbHMF/VvPID9TbkmkJQeTSHf4cG8Gc2NhYmxlGHdpdGhkcmF3X2NvaW5fZnJvbV9zcG9vbAEHwGAAYREBa4oCCtWzODSYSkN6qn08dMGOCaldSKzqsIwEY29pbgRDT0lOAAcBBwABBAABBQABBgABAgACAwABCAABAQMEAAAAAQkANmLgCoX9rhfVcydwuNBlgQX+nAypHCWXkOb7FJhoarwBAIeZYFAymyfNbcQRCDphH3T3S3bL3VSZbjSdGbuvcmN4AX0YAAAAACCrACUJw0y12TrjoFiK9XU0xMSCc/lv68vtFBtDgPwrGDZi4AqF/a4X1XMncLjQZYEF/pwMqRwll5Dm+xSYaGq87gIAAAAAAAA8WWwAAAAAAAA=',
      ),
    );
    const decoder = new Decoder(transaction);
    const result = decoder.decode();

    expect(result.type).toBe('psm-out');
    const intentionData = result.intentionData as PsmIntentionData;
    expect(intentionData.coinType).toBe('0x08a7a3c873402d7cf9d44192aae337e0b27a72c2a4a230d10230488cf614c5a2::scable::SCABLE');
    expect(intentionData.amount).toBe('10000000000');
  });

  it('Test borrow deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const collateralType = COINS_TYPE_LIST.SUI;
    const collateralAmount = "10000000000";
    const borrowAmount = "50000";
    const insertionPlace: string | undefined = "0x0000000000000000000000000000000000000000000000000000000000010001";
    const strapId: string | undefined = "0x0000000000000000000000000000000000000000000000000000000000010002";
    await buildBorrowTx(bucketClient, tx, collateralType, collateralAmount, borrowAmount, address, insertionPlace, strapId);

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

  it('Test withdraw deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const collateralType = COINS_TYPE_LIST.SUI;
    const withdrawAmount = "50000";
    const insertionPlace: string | undefined = "0x0000000000000000000000000000000000000000000000000000000000010001";
    const strapId: string | undefined = "0x0000000000000000000000000000000000000000000000000000000000010002";
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

  it('Test repay deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const collateralType = COINS_TYPE_LIST.SUI;
    const repayAmount = "10000000000";
    const withdrawAmount = "50000";
    const isSurplus = false;
    const insertionPlace: string | undefined = "0x0000000000000000000000000000000000000000000000000000000000010001";
    const strapId: string | undefined = "0x0000000000000000000000000000000000000000000000000000000000010002";
    await buildRepayTx(bucketClient, tx, collateralType, repayAmount, withdrawAmount, address, isSurplus, insertionPlace, strapId);

    // const decoder = new Decoder(tx);
    // const result = decoder.decode();
    // expect(result.type).toBe('repay');
    // const intentionData = result.intentionData as RepayIntentionData;
    // expect(intentionData.collateralType).toBe(collateralType);
    // expect(intentionData.repayAmount).toBe(repayAmount);
    // expect(intentionData.withdrawAmount).toBe(withdrawAmount);
    // expect(intentionData.strapId).toBe('');
  });

  it('Test sbuck-deposit deserialize', async () => {
    const tx = new Transaction();
    const bucketClient = new BucketClient();
    const coinType = COINS_TYPE_LIST.BUCK;
    const amount = "10000000000";
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
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000000000000000000000000000002",
      "0x0000000000000000000000000000000000000000000000000000000000000003"
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
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000000000000000000000000000002",
      "0x0000000000000000000000000000000000000000000000000000000000000003"
    ];
    await buildSBUCKClaimTx(bucketClient, tx, stakeProofs, address);

    const decoder = new Decoder(tx);
    const result = decoder.decode();
    expect(result.type).toBe('sbuck-claim');
    const intentionData = result.intentionData as SBUCKClaimIntentionData;
    expect(intentionData.stakeProofs.length).toBe(stakeProofs.length);
    expect(intentionData.stakeProofs[0]).toBe(stakeProofs[0]);
  });

  it('Test sbuck-lock-claim deserialize', async () => {
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
