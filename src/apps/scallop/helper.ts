import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { DecoderLending } from './decoders/decoderLending';
import { DecoderReferral } from './decoders/decoderReferral';
import { DecoderVesca } from './decoders/decoderVesca';
import { BorrowIntention, BorrowIntentionData } from './intentions/lending/borrow';
import { BorrowWithBoostIntention, BorrowWithBoostIntentionData } from './intentions/lending/borrow-with-boost';
import {
  BorrowWithReferralIntention,
  BorrowWithReferralIntentionData,
} from './intentions/lending/borrow-with-referral';
import {
  ClaimIncentiveRewardIntention,
  ClaimIncentiveRewardIntentionData,
} from './intentions/lending/claim-incentive-reward';
import { DepositCollateralIntention, DepositCollateralIntentionData } from './intentions/lending/deposit-collateral';
import { MigrateAndClaimIntention, MigrateAndClaimIntentionData } from './intentions/lending/migrate-and-claim';
import { OpenObligationIntention, OpenObligationIntentionData } from './intentions/lending/open-obligation';
import { RepayIntention, RepayIntentionData } from './intentions/lending/repay';
import { StakeSpoolIntention, StakeSpoolIntentionData } from './intentions/lending/stake-spool';
import { SupplyLendingIntention, SupplyLendingIntentionData } from './intentions/lending/supply-lending';
import { UnstakeSpoolIntention, UnstakeSpoolIntentionData } from './intentions/lending/unstake-spool';
import {
  WithdrawAndUnstakeLendingIntention,
  WithdrawAndUnstakeLendingIntentionData,
} from './intentions/lending/withdraw-and-unstake-lending';
import { WithdrawCollateralIntention, WithdrawCollateralIntentionData } from './intentions/lending/withdraw-collateral';
import { WithdrawLendingIntention, WithdrawLendingIntentionData } from './intentions/lending/withdraw-lending';
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
import { ScallopBuilder } from './models';
import { SuiNetworks } from './types';
import { TransactionSubType } from './types/utils';
import { MSafeAppHelper } from '../interface';

export type ScallopIntention =
  | SupplyLendingIntention
  | WithdrawLendingIntention
  | BorrowIntention
  | RepayIntention
  | DepositCollateralIntention
  | WithdrawCollateralIntention
  | OpenObligationIntention
  | StakeSpoolIntention
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
  | CreateReferralLinkIntention;

export type ScallopIntentionData =
  | SupplyLendingIntentionData
  | WithdrawLendingIntentionData
  | BorrowIntentionData
  | RepayIntentionData
  | DepositCollateralIntentionData
  | WithdrawCollateralIntentionData
  | OpenObligationIntentionData
  | StakeSpoolIntentionData
  | UnstakeSpoolIntentionData
  | ClaimIncentiveRewardIntentionData
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
  | CreateReferralLinkIntentionData;

export class ScallopAppHelper implements MSafeAppHelper<ScallopIntentionData> {
  application = 'scallop';

  async deserialize(
    input: SuiSignTransactionBlockInput & { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount },
  ): Promise<{
    txType: TransactionType;
    txSubType: TransactionSubType;
    intentionData: ScallopIntentionData;
  }> {
    const builder = new ScallopBuilder({
      client: input.suiClient,
      walletAddress: input.account.address,
      networkType: input.network.split(':')[1] as any,
    });
    await builder.init();
    const { transactionBlock } = input;
    const decoderLending = new DecoderLending(transactionBlock, builder);
    const decoderReferral = new DecoderReferral(transactionBlock, builder);
    const decoderVesca = new DecoderVesca(transactionBlock, builder);
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
  }): Promise<TransactionBlock> {
    const { suiClient, account, network } = input;
    let intention: ScallopIntention;
    switch (input.txSubType) {
      case TransactionSubType.SupplyLending:
        intention = SupplyLendingIntention.fromData(input.intentionData as SupplyLendingIntentionData);
        break;
      case TransactionSubType.WithdrawLending:
        intention = WithdrawLendingIntention.fromData(input.intentionData as WithdrawLendingIntentionData);
        break;
      case TransactionSubType.Borrow:
        intention = BorrowIntention.fromData(input.intentionData as BorrowIntentionData);
        break;
      case TransactionSubType.Repay:
        intention = RepayIntention.fromData(input.intentionData as RepayIntentionData);
        break;
      case TransactionSubType.DepositCollateral:
        intention = DepositCollateralIntention.fromData(input.intentionData as DepositCollateralIntentionData);
        break;
      case TransactionSubType.WithdrawCollateral:
        intention = WithdrawCollateralIntention.fromData(input.intentionData as WithdrawCollateralIntentionData);
        break;
      case TransactionSubType.OpenObligation:
        intention = OpenObligationIntention.fromData(input.intentionData as OpenObligationIntentionData);
        break;
      case TransactionSubType.StakeSpool:
        intention = StakeSpoolIntention.fromData(input.intentionData as StakeSpoolIntentionData);
        break;
      case TransactionSubType.UnstakeSpool:
        intention = UnstakeSpoolIntention.fromData(input.intentionData as UnstakeSpoolIntentionData);
        break;
      case TransactionSubType.ClaimIncentiveReward:
        intention = ClaimIncentiveRewardIntention.fromData(input.intentionData as ClaimIncentiveRewardIntentionData);
        break;
      case TransactionSubType.BorrowWithBoost:
        intention = BorrowWithBoostIntention.fromData(input.intentionData as BorrowWithBoostIntentionData);
        break;
      case TransactionSubType.StakeSca:
        intention = StakeScaIntention.fromData(input.intentionData as StakeScaIntentionData);
        break;
      case TransactionSubType.ExtendStakePeriod:
        intention = ExtendStakePeriodIntention.fromData(input.intentionData as ExtendStakePeriodIntentionData);
        break;
      case TransactionSubType.ExtendPeriodAndStakeMore:
        intention = ExtendPeriodAndStakeMoreIntention.fromData(
          input.intentionData as ExtendPeriodAndStakeMoreIntentionData,
        );
        break;
      case TransactionSubType.RenewExpStakePeriod:
        intention = RenewExpStakePeriodIntention.fromData(input.intentionData as RenewExpStakePeriodIntentionData);
        break;
      case TransactionSubType.WithdrawStakedSca:
        intention = WithdrawStakedScaIntention.fromData(input.intentionData as WithdrawStakedScaIntentionData);
        break;
      case TransactionSubType.SupplyAndStakeLending:
        intention = SupplyAndStakeLendingIntention.fromData(input.intentionData as SupplyAndStakeLendingIntentionData);
        break;
      case TransactionSubType.WithdrawAndUnstakeLending:
        intention = WithdrawAndUnstakeLendingIntention.fromData(
          input.intentionData as WithdrawAndUnstakeLendingIntentionData,
        );
        break;
      case TransactionSubType.RedeemSca:
        intention = RedeemScaIntention.fromData(input.intentionData as RedeemScaIntentionData);
        break;
      case TransactionSubType.MigrateAndClaim:
        intention = MigrateAndClaimIntention.fromData(input.intentionData as MigrateAndClaimIntentionData);
        break;
      case TransactionSubType.BorrowWithReferral:
        intention = BorrowWithReferralIntention.fromData(input.intentionData as BorrowWithReferralIntentionData);
        break;
      case TransactionSubType.CreateReferralLink:
        intention = CreateReferralLinkIntention.fromData(input.intentionData as CreateReferralLinkIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ suiClient, account, network });
  }
}
