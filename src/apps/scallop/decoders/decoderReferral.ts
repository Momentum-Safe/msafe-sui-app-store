import { TransactionType } from '@msafe/sui3-utils';

import { Decoder } from './decoder';
import { DecodeResult } from '../types';
import { TransactionSubType } from '../types/utils';

export class DecoderReferral extends Decoder {
  decode() {
    if (this.isCreateReferralLink()) {
      return this.decodeCreateReferralLink();
    }
    return undefined;
  }

  private decodeCreateReferralLink(): DecodeResult {
    return {
      txType: TransactionType.Other,
      type: TransactionSubType.CreateReferralLink,
      intentionData: {},
    };
  }

  private isCreateReferralLink() {
    return !!this.getMoveCallTransaction(`${this.coreId.veScaPkgId}::ve_sca::mint_ve_sca_placeholder_key`);
  }
}
