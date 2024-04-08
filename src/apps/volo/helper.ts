import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount, SuiSignTransactionBlockInput } from '@mysten/wallet-standard';

import { MSafeAppHelper } from '@/apps/interface';
import { SuiNetworks } from '@/types';

import { Decoder } from './decoder';
import { ClaimTicketIntention, ClaimTicketIntentionData } from './intentions/claimTicket';
import { StakeIntention, StakeIntentionData } from './intentions/stake';
import { UnStakeIntention, UnStakeIntentionData } from './intentions/unStake';
import { TransactionSubType } from './types';

export type VoloIntention = StakeIntention | UnStakeIntention | ClaimTicketIntention;

export type VoloIntentionData = StakeIntentionData | UnStakeIntentionData | ClaimTicketIntentionData;

export class VoloAppHelper implements MSafeAppHelper<VoloIntentionData> {
  application = 'volo';

  async deserialize(
    input: SuiSignTransactionBlockInput & { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount },
  ): Promise<{ txType: TransactionType; txSubType: TransactionSubType; intentionData: VoloIntentionData }> {
    const { transactionBlock } = input;
    const decoder = new Decoder(transactionBlock);
    const result = decoder.decode();
    return {
      txType: TransactionType.Other,
      txSubType: result.type,
      intentionData: result.intentionData,
    };
  }

  async build(input: {
    intentionData: VoloIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<TransactionBlock> {
    const { suiClient, account } = input;
    let intention: VoloIntention;
    switch (input.txSubType) {
      case TransactionSubType.Stake:
        intention = StakeIntention.fromData(input.intentionData as StakeIntentionData);
        break;
      case TransactionSubType.UnStake:
        intention = UnStakeIntention.fromData(input.intentionData as UnStakeIntentionData);
        break;
      case TransactionSubType.ClaimTicket:
        intention = ClaimTicketIntention.fromData(input.intentionData as ClaimTicketIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ suiClient, account });
  }
}
