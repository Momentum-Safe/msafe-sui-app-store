import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';
import { SuilendClient } from '@suilend/sdk';
import { ObligationOwnerCap } from '@suilend/sdk/_generated/suilend/lending-market/structs';

import { SuiNetworks } from '@/types';

import { DepositIntention, DepositIntentionData } from './intentions/deposit';

export enum TransactionSubType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  BORROW = 'borrow',
  REPAY = 'repay',
  CLAIM = 'claim',
}

export type SuilendIntention = DepositIntention;

export type SuilendIntentionData = DepositIntentionData;

export type IntentionInput = {
  network: SuiNetworks;
  suiClient: SuiClient;
  account: WalletAccount;
  suilendClient: SuilendClient;
  obligationOwnerCaps: ObligationOwnerCap<string>[];
};
