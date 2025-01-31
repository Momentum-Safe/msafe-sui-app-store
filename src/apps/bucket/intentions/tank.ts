import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { BaseIntention } from '@/apps/interface/sui';
import { SuiNetworks } from '@/types';

import {
  getTankClaimTx,
  getTankDepositTx,
  getTankWithdrawTx,
  TankClaimIntentionData,
  TankDepositIntentionData,
  TankWithdrawIntentionData,
} from '../api';
import { TransactionSubType } from '../types';

export class TankDepositIntention extends BaseIntention<TankDepositIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.TankDeposit;

  constructor(public readonly data: TankDepositIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const tx = await getTankDepositTx(this.data, account, network);
    return tx;
  }

  static fromData(data: TankDepositIntentionData) {
    return new TankDepositIntention(data);
  }
}

export class TankWithdrawIntention extends BaseIntention<TankWithdrawIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.TankWithdraw;

  constructor(public readonly data: TankWithdrawIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const tx = await getTankWithdrawTx(this.data, account, network);
    return tx;
  }

  static fromData(data: TankWithdrawIntentionData) {
    return new TankWithdrawIntention(data);
  }
}

export class TankClaimIntention extends BaseIntention<TankClaimIntentionData> {
  txType = TransactionType.Other;

  txSubType = TransactionSubType.TankClaim;

  constructor(public readonly data: TankClaimIntentionData) {
    super(data);
  }

  async build(input: { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount }): Promise<Transaction> {
    const { account, network } = input;
    const tx = await getTankClaimTx(this.data, account, network);
    return tx;
  }

  static fromData(data: TankClaimIntentionData) {
    return new TankClaimIntention(data);
  }
}
