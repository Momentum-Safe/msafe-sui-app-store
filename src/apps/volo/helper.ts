import { TransactionType } from '@msafe/sui3-utils';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternalGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { Decoder } from './decoder';
import { ClaimTicketIntention, ClaimTicketIntentionData } from './intentions/claimTicket';
import { StakeIntention, StakeIntentionData } from './intentions/stake';
import { UnStakeIntention, UnStakeIntentionData } from './intentions/unStake';
import { TransactionSubType } from './types';

export type VoloIntention = StakeIntention | UnStakeIntention | ClaimTicketIntention;

export type VoloIntentionData = StakeIntentionData | UnStakeIntentionData | ClaimTicketIntentionData;

export class VoloAppHelper implements IAppHelperInternalGrpc<VoloIntentionData> {
  application = 'volo';

  supportSDK = '@mysten/sui-v2' as const;

  async deserialize(input: {
    transaction: Transaction;
    network: SuiNetworks;
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
  }): Promise<{ txType: TransactionType; txSubType: TransactionSubType; intentionData: VoloIntentionData }> {
    const decoder = new Decoder(input.transaction);
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
    suiGrpcClient: SuiGrpcClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { suiGrpcClient, account, network } = input;
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
    return intention.build({ suiGrpcClient, account, network });
  }
}
