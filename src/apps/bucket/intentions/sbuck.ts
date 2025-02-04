import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import {
  SBUCKClaimIntentionData,
  SBUCKDepositIntentionData,
  SBUCKUnstakeIntentionData,
  SBUCKWithdrawIntentionData,
} from '@/apps/bucket/types/api';
import { BaseIntention } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import { getSBUCKClaimTx, getSBUCKDepositTx, getSBUCKUnstakeTx, getSBUCKWithdrawTx } from '../api/sbuck';
import { TransactionSubType } from '../types';

export class SBUCKDepositIntention extends BaseIntention<SBUCKDepositIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.SBUCKDeposit;

  constructor(public readonly data: SBUCKDepositIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const tx = await getSBUCKDepositTx(this.data, account, network);
    return tx;
  }

  static fromData(data: SBUCKDepositIntentionData) {
    return new SBUCKDepositIntention(data);
  }
}

export class SBUCKUnstakeIntention extends BaseIntention<SBUCKUnstakeIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.SBUCKUnstake;

  constructor(public readonly data: SBUCKUnstakeIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const tx = await getSBUCKUnstakeTx(this.data, account, network);
    return tx;
  }

  static fromData(data: SBUCKUnstakeIntentionData) {
    return new SBUCKUnstakeIntention(data);
  }
}

export class SBUCKWithdrawIntention extends BaseIntention<SBUCKWithdrawIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.SBUCKWithdraw;

  constructor(public readonly data: SBUCKWithdrawIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const tx = await getSBUCKWithdrawTx(this.data, account, network);
    return tx;
  }

  static fromData(data: SBUCKWithdrawIntentionData) {
    return new SBUCKWithdrawIntention(data);
  }
}

export class SBUCKClaimIntention extends BaseIntention<SBUCKClaimIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.SBUCKClaim;

  constructor(public readonly data: SBUCKClaimIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const tx = await getSBUCKClaimTx(this.data, account, network);
    return tx;
  }

  static fromData(data: SBUCKClaimIntentionData) {
    return new SBUCKClaimIntention(data);
  }
}
