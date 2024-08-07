import { TransactionBlock, TransactionResult } from '@mysten/sui.js/transactions';

import { ScallopBuilder } from '../../models';
import { SupportPoolCoins } from '../constant';
import { SuiObjectArg } from '../utils';

export type ReferralIds = {
  referralPgkId: string;
  referralBindings: string;
  referralRevenuePool: string;
  referralTiers: string;
  authorizedWitnessList: string;
  version: string;
};

export type ReferralNormalMethods = {
  bindToReferral: (veScaKeyId: string) => void;
  claimReferralTicket: (poolCoinName: SupportPoolCoins) => TransactionResult;
  burnReferralTicket: (ticket: SuiObjectArg, poolCoinName: SupportPoolCoins) => void;
  claimReferralRevenue: (veScaKey: SuiObjectArg, poolCoinName: SupportPoolCoins) => TransactionResult;
};

export type ReferralQuickMethods = {
  claimReferralRevenueQuick: (
    veScaKey: SuiObjectArg,
    walletAddress: string,
    coinNames: SupportPoolCoins[],
  ) => Promise<void>;
};

export type SuiTxBlockWithReferralNormalMethods = TransactionBlock & ReferralNormalMethods;
export type ReferralTxBlock = SuiTxBlockWithReferralNormalMethods & ReferralQuickMethods;

export type GenerateReferralNormalMethod = (params: {
  builder: ScallopBuilder;
  txBlock: TransactionBlock;
}) => Promise<ReferralNormalMethods>;

export type GenerateReferralQuickMethod = (params: {
  builder: ScallopBuilder;
  txBlock: TransactionBlock;
}) => Promise<ReferralQuickMethods>;
