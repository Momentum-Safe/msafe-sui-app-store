import { TransactionType } from '@msafe/sui3-utils';
import { MoveCallTransaction } from '@mysten/sui.js/dist/cjs/transactions';

import { Decoder } from './decoder';
import { DecodeResult } from '../types';
import { TransactionSubType } from '../types/utils';
import { MoveCallHelper } from '../utils/moveCallHelper';

export class DecoderReferral extends Decoder {
  decode() {
    if (this.isCreateReferralLink()) {
      return this.decodeCreateReferralLink();
    }
    if (this.isClaimRevenueReferral()) {
      return this.decodeClaimRevenueReferral();
    }
    if (this.isBindReferral()) {
      return this.decodeBindReferral();
    }
    return undefined;
  }

  private isClaimRevenueReferral() {
    return !!this.getMoveCallTransaction(
      `${this.coreId.referral}::referral_revenue_pool::claim_revenue_with_ve_sca_key`,
    );
  }

  private isCreateReferralLink() {
    return !!this.getMoveCallTransaction(`${this.coreId.veScaPkgId}::ve_sca::mint_ve_sca_placeholder_key`);
  }

  private isBindReferral() {
    return !!this.getMoveCallTransaction(`${this.coreId.referral}::referral_bindings::bind_ve_sca_referrer`);
  }

  private get helperClaimRevenueReferral() {
    const moveCalls = this.transactions
      .filter(
        (trans) =>
          trans.kind === 'MoveCall' &&
          trans.target.startsWith(`${this.coreId.referral}::referral_revenue_pool::claim_revenue_with_ve_sca_key`),
      )
      .map((trans) => new MoveCallHelper(trans as MoveCallTransaction, this.txb));
    return moveCalls;
  }

  private get helperBindReferral() {
    const moveCall = this.transactions.find(
      (trans) =>
        trans.kind === 'MoveCall' &&
        trans.target.startsWith(`${this.coreId.referral}::referral_bindings::bind_ve_sca_referrer`),
    ) as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }

  private decodeCreateReferralLink(): DecodeResult {
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CreateReferralLink,
      intentionData: {},
    };
  }

  private decodeClaimRevenueReferral(): DecodeResult {
    const veScaKey = this.helperClaimRevenueReferral[0].decodeOwnedObjectId(2);
    const coins = this.helperClaimRevenueReferral.map((helper) => helper.typeArg(0));
    console.log(coins);
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.ClaimRevenueReferral,
      intentionData: {
        veScaKey,
        coins,
      },
    };
  }

  private decodeBindReferral(): DecodeResult {
    const veScaKey = this.helperBindReferral.decodePureArg(1, 'address');
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.BindReferral,
      intentionData: {
        veScaKey,
      },
    };
  }
}
