import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';
import { Scallop, ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { DecoderLending } from './decoders/decoderLending';
import { DecoderReferral } from './decoders/decoderReferral';
import { DecoderVeSca } from './decoders/decoderVesca';
import { BorrowIntention, BorrowIntentionData } from './intentions/lending/borrow';
import { BorrowWithBoostIntention, BorrowWithBoostIntentionData } from './intentions/lending/borrow-with-boost';
import {
  BorrowWithReferralIntention,
  BorrowWithReferralIntentionData,
} from './intentions/lending/borrow-with-referral';
import { ClaimIncentiveRewardIntention } from './intentions/lending/claim-incentive-reward';
import { DepositCollateralIntention, DepositCollateralIntentionData } from './intentions/lending/deposit-collateral';
import { MigrateAndClaimIntention, MigrateAndClaimIntentionData } from './intentions/lending/migrate-and-claim';
import { MigrateScoinIntention, MigrateScoinIntentionData } from './intentions/lending/migrate-scoin';
import { OpenObligationIntention, OpenObligationIntentionData } from './intentions/lending/open-obligation';
import { RepayIntention, RepayIntentionData } from './intentions/lending/repay';
import { RepayWithBoostIntention, RepayWithBoostIntentionData } from './intentions/lending/repay-with-boost';
import { SupplyLendingIntention, SupplyLendingIntentionData } from './intentions/lending/supply-lending';
import { UnstakeSpoolIntention, UnstakeSpoolIntentionData } from './intentions/lending/unstake-spool';
import {
  WithdrawAndUnstakeLendingIntention,
  WithdrawAndUnstakeLendingIntentionData,
} from './intentions/lending/withdraw-and-unstake-lending';
import { WithdrawCollateralIntention, WithdrawCollateralIntentionData } from './intentions/lending/withdraw-collateral';
import { WithdrawLendingIntention, WithdrawLendingIntentionData } from './intentions/lending/withdraw-lending';
import { BindReferralIntention, BindReferralIntentionData } from './intentions/referral/bind-referral';
import {
  ClaimRevenueReferralIntention,
  ClaimRevenueReferralIntentionData,
} from './intentions/referral/claim-revenue-referral';
import {
  CreateReferralLinkIntention,
  CreateReferralLinkIntentionData,
} from './intentions/referral/create-referral-link';
import {
  ExtendPeriodAndStakeMoreIntention,
  ExtendPeriodAndStakeMoreIntentionData,
} from './intentions/staking/extend-period-and-stake-more';
import { ExtendStakePeriodIntention, ExtendStakePeriodIntentionData } from './intentions/staking/extend-stake-period';
import { RedeemScaIntention, RedeemScaIntentionData } from './intentions/staking/redeem-sca';
import {
  RenewExpStakePeriodIntention,
  RenewExpStakePeriodIntentionData,
} from './intentions/staking/renew-exp-stake-period';
import { StakeScaIntention, StakeScaIntentionData } from './intentions/staking/stake-sca';
import {
  SupplyAndStakeLendingIntention,
  SupplyAndStakeLendingIntentionData,
} from './intentions/staking/supply-and-stake-lending';
import { WithdrawStakedScaIntention, WithdrawStakedScaIntentionData } from './intentions/staking/withdraw-staked-sca';
import { SuiNetworks } from './types';
import { TransactionSubType } from './types/utils';
import { IAppHelperInternal } from '../interface/sui';

export type ScallopIntention =
  | SupplyLendingIntention
  | WithdrawLendingIntention
  | BorrowIntention
  | RepayIntention
  | DepositCollateralIntention
  | WithdrawCollateralIntention
  | OpenObligationIntention
  | UnstakeSpoolIntention
  | ClaimIncentiveRewardIntention
  | BorrowWithBoostIntention
  | StakeScaIntention
  | ExtendStakePeriodIntention
  | ExtendPeriodAndStakeMoreIntention
  | RenewExpStakePeriodIntention
  | WithdrawStakedScaIntention
  | SupplyAndStakeLendingIntention
  | WithdrawAndUnstakeLendingIntention
  | RedeemScaIntention
  | MigrateAndClaimIntention
  | BorrowWithReferralIntention
  | CreateReferralLinkIntention
  | ClaimRevenueReferralIntention
  | BindReferralIntention
  | MigrateScoinIntention
  | RepayWithBoostIntention;

export type ScallopIntentionData =
  | SupplyLendingIntentionData
  | WithdrawLendingIntentionData
  | BorrowIntentionData
  | RepayIntentionData
  | DepositCollateralIntentionData
  | WithdrawCollateralIntentionData
  | OpenObligationIntentionData
  | UnstakeSpoolIntentionData
  | BorrowWithBoostIntentionData
  | StakeScaIntentionData
  | ExtendStakePeriodIntentionData
  | ExtendPeriodAndStakeMoreIntentionData
  | RenewExpStakePeriodIntentionData
  | WithdrawStakedScaIntentionData
  | SupplyAndStakeLendingIntentionData
  | WithdrawAndUnstakeLendingIntentionData
  | RedeemScaIntentionData
  | MigrateAndClaimIntentionData
  | BorrowWithReferralIntentionData
  | CreateReferralLinkIntentionData
  | ClaimRevenueReferralIntentionData
  | BindReferralIntentionData
  | MigrateScoinIntentionData
  | RepayWithBoostIntentionData;

export class ScallopAppHelper implements IAppHelperInternal<ScallopIntentionData> {
  application = 'scallop';

  supportSDK = '@mysten/sui' as const;

  private scallopClient: ScallopClient | undefined;

  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiClient: SuiClient;
    account: WalletAccount;
    appContext?: any;
  }): Promise<{
    txType: TransactionType;
    txSubType: TransactionSubType;
    intentionData: ScallopIntentionData;
  }> {
    if (!this.scallopClient) {
      const scallop = new Scallop({
        addressId: '67c44a103fe1b8c454eb9699',
        walletAddress: input.account.address,
        suiClients: [input.suiClient],
      });
      this.scallopClient = await scallop.createScallopClient();
    }

    const { transaction } = input;
    console.log('transaction', transaction);

    // const devInspectResult = await input.suiClient.devInspectTransactionBlock({
    //   transactionBlock: transaction,
    //   sender: input.account.address,
    // });

    const decoderLending = new DecoderLending(transaction, this.scallopClient);
    const decoderReferral = new DecoderReferral(transaction, this.scallopClient);
    const decoderVesca = new DecoderVeSca(transaction, this.scallopClient);

    const result = decoderLending.decode() || decoderReferral.decode() || decoderVesca.decode();
    if (!result) {
      throw new Error('Unknown transaction type');
    }
    return {
      txType: TransactionType.Other,
      txSubType: result.type,
      intentionData: result.intentionData,
    };
  }

  async build(input: {
    intentionData: ScallopIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { suiClient, account, network, txSubType, intentionData } = input;
    if (!this.scallopClient) {
      const scallop = new Scallop({
        addressId: '67c44a103fe1b8c454eb9699',
        walletAddress: input.account.address,
        suiClients: [input.suiClient],
      });
      this.scallopClient = await scallop.createScallopClient();
    }

    let intention: ScallopIntention;
    switch (txSubType) {
      case TransactionSubType.SupplyLending:
        intention = SupplyLendingIntention.fromData(intentionData as SupplyLendingIntentionData);
        break;
      case TransactionSubType.WithdrawLending:
        intention = WithdrawLendingIntention.fromData(intentionData as WithdrawLendingIntentionData);
        break;
      case TransactionSubType.Borrow:
        intention = BorrowIntention.fromData(intentionData as BorrowIntentionData);
        break;
      case TransactionSubType.Repay:
        intention = RepayIntention.fromData(intentionData as RepayIntentionData);
        break;
      case TransactionSubType.DepositCollateral:
        intention = DepositCollateralIntention.fromData(intentionData as DepositCollateralIntentionData);
        break;
      case TransactionSubType.WithdrawCollateral:
        intention = WithdrawCollateralIntention.fromData(intentionData as WithdrawCollateralIntentionData);
        break;
      case TransactionSubType.OpenObligation:
        intention = OpenObligationIntention.fromData(intentionData as OpenObligationIntentionData);
        break;
      case TransactionSubType.UnstakeSpool:
        intention = UnstakeSpoolIntention.fromData(intentionData as UnstakeSpoolIntentionData);
        break;
      case TransactionSubType.ClaimIncentiveReward:
        intention = ClaimIncentiveRewardIntention.fromData(intentionData);
        break;
      case TransactionSubType.BorrowWithBoost:
        intention = BorrowWithBoostIntention.fromData(intentionData as BorrowWithBoostIntentionData);
        break;
      case TransactionSubType.StakeSca:
        intention = StakeScaIntention.fromData(intentionData as StakeScaIntentionData);
        break;
      case TransactionSubType.ExtendStakePeriod:
        intention = ExtendStakePeriodIntention.fromData(intentionData as ExtendStakePeriodIntentionData);
        break;
      case TransactionSubType.ExtendPeriodAndStakeMore:
        intention = ExtendPeriodAndStakeMoreIntention.fromData(intentionData as ExtendPeriodAndStakeMoreIntentionData);
        break;
      case TransactionSubType.RenewExpStakePeriod:
        intention = RenewExpStakePeriodIntention.fromData(intentionData as RenewExpStakePeriodIntentionData);
        break;
      case TransactionSubType.WithdrawStakedSca:
        intention = WithdrawStakedScaIntention.fromData(intentionData as WithdrawStakedScaIntentionData);
        break;
      case TransactionSubType.SupplyAndStakeLending:
        intention = SupplyAndStakeLendingIntention.fromData(intentionData as SupplyAndStakeLendingIntentionData);
        break;
      case TransactionSubType.WithdrawAndUnstakeLending:
        intention = WithdrawAndUnstakeLendingIntention.fromData(
          intentionData as WithdrawAndUnstakeLendingIntentionData,
        );
        break;
      case TransactionSubType.RedeemSca:
        intention = RedeemScaIntention.fromData(intentionData as RedeemScaIntentionData);
        break;
      case TransactionSubType.MigrateAndClaim:
        intention = MigrateAndClaimIntention.fromData(intentionData as MigrateAndClaimIntentionData);
        break;
      case TransactionSubType.BorrowWithReferral:
        intention = BorrowWithReferralIntention.fromData(intentionData as BorrowWithReferralIntentionData);
        break;
      case TransactionSubType.CreateReferralLink:
        intention = CreateReferralLinkIntention.fromData(intentionData as CreateReferralLinkIntentionData);
        break;
      case TransactionSubType.ClaimRevenueReferral:
        intention = ClaimRevenueReferralIntention.fromData(intentionData as ClaimRevenueReferralIntentionData);
        break;
      case TransactionSubType.BindReferral:
        intention = BindReferralIntention.fromData(intentionData as BindReferralIntentionData);
        break;
      case TransactionSubType.MigrateScoin:
        intention = MigrateScoinIntention.fromData(intentionData as MigrateScoinIntentionData);
        break;
      case TransactionSubType.RepayWithBoost:
        intention = RepayWithBoostIntention.fromData(intentionData as RepayWithBoostIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ suiClient, account, network, scallopClient: this.scallopClient });
  }
}
