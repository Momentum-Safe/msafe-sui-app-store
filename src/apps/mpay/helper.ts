import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { MSafeAppHelper } from '@/apps/interface';
import { SuiNetworks } from '@/types';

import { CancelStreamIntention, CancelStreamIntentionData } from './cancel-stream';
import { ClaimByProxyStreamIntention, ClaimByProxyStreamIntentionData } from './claim-by-proxy-stream';
import { ClaimStreamIntention, ClaimStreamIntentionData } from './claim-stream';
import { Env, Globals } from './common';
import { CreateStreamIntention, CreateStreamIntentionData } from './create-stream';
import { DecodeHelper } from './decoder/decoder';
import { SetAutoClaimIntentionData, SetAutoClaimStreamIntention } from './set-auto-claim-stream';
import { StreamTransactionType } from './types/decode';

export type MPayIntention =
  | CreateStreamIntention
  | SetAutoClaimStreamIntention
  | ClaimStreamIntention
  | CancelStreamIntention
  | ClaimByProxyStreamIntention;

export type MPayIntentionData =
  | CreateStreamIntentionData
  | SetAutoClaimIntentionData
  | ClaimStreamIntentionData
  | ClaimByProxyStreamIntentionData
  | CancelStreamIntentionData;

export class MPayAppHelper implements MSafeAppHelper<MPayIntentionData> {
  application = 'mpay';

  async deserialize(
    input: SuiSignTransactionBlockInput & { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount },
  ): Promise<{ txType: TransactionType; txSubType: string; intentionData: MPayIntentionData }> {
    const { chain, transactionBlock } = input;
    const globals = Globals.new(chain === 'sui:mainnet' ? Env.prod : Env.dev);
    const decoder = new DecodeHelper(globals, transactionBlock);
    const result = decoder.decode();
    if (result.type === StreamTransactionType.CREATE_STREAM) {
      return {
        txType: TransactionType.Other,
        txSubType: result.type,
        intentionData: result.info,
      };
    }
    if (result.type === StreamTransactionType.CLAIM) {
      return {
        txType: TransactionType.Other,
        txSubType: result.type,
        intentionData: {
          streamId: result.streamId,
        },
      };
    }
    if (result.type === StreamTransactionType.CLAIM_BY_PROXY) {
      return {
        txType: TransactionType.Other,
        txSubType: result.type,
        intentionData: {
          streamId: result.streamId,
        },
      };
    }
    if (result.type === StreamTransactionType.SET_AUTO_CLAIM) {
      return {
        txType: TransactionType.Other,
        txSubType: result.type,
        intentionData: {
          streamId: result.streamId,
          enabled: result.enabled,
        },
      };
    }
    if (result.type === StreamTransactionType.CANCEL) {
      return {
        txType: TransactionType.Other,
        txSubType: result.type,
        intentionData: {
          streamId: result.streamId,
        },
      };
    }
    throw new Error(`Unknown transaction type: ${result}`);
  }

  async build(input: {
    intentionData: MPayIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const { network, intentionData, suiClient, account } = input;
    let intention: MPayIntention;
    switch (input.txSubType as StreamTransactionType) {
      case StreamTransactionType.CREATE_STREAM:
        intention = CreateStreamIntention.fromData(intentionData as CreateStreamIntentionData);
        break;
      case StreamTransactionType.CLAIM:
        intention = ClaimStreamIntention.fromData(intentionData as ClaimStreamIntentionData);
        break;
      case StreamTransactionType.CLAIM_BY_PROXY:
        intention = ClaimByProxyStreamIntention.fromData(intentionData as ClaimByProxyStreamIntentionData);
        break;
      case StreamTransactionType.SET_AUTO_CLAIM:
        intention = SetAutoClaimStreamIntention.fromData(intentionData as SetAutoClaimIntentionData);
        break;
      case StreamTransactionType.CANCEL:
        intention = CancelStreamIntention.fromData(intentionData as CancelStreamIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ network, suiClient, account });
  }
}
