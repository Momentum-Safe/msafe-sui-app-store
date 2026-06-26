import {
  CancelStreamIntentionData,
  ClaimByProxyStreamIntentionData,
  ClaimStreamIntentionData,
  CreateStreamIntentionData,
  SetAutoClaimIntentionData,
  TransactionType,
} from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { IdentifierString, WalletAccount } from '@mysten/wallet-standard';

import { IAppHelperInternalGrpc } from '@/apps/interface/sui-grpc';
import { SuiNetworks } from '@/types';

import { CancelStreamIntention } from './cancel-stream';
import { ClaimByProxyStreamIntention } from './claim-by-proxy-stream';
import { ClaimStreamIntention } from './claim-stream';
import { Env, Globals } from './common';
import { CreateStreamIntention } from './create-stream';
import { DecodeHelper } from './decoder/decoder';
import { SetAutoClaimStreamIntention } from './set-auto-claim-stream';
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

export class MPayAppHelper implements IAppHelperInternalGrpc<MPayIntentionData> {
  application = 'mpay';

  supportSDK = '@mysten/sui-v2' as const;

  async deserialize(input: {
    transaction: Transaction;
    chain: IdentifierString;
    network: SuiNetworks;
    suiGrpcClient: Parameters<IAppHelperInternalGrpc<MPayIntentionData>['deserialize']>[0]['suiGrpcClient'];
    account: WalletAccount;
  }): Promise<{ txType: TransactionType; txSubType: string; intentionData: MPayIntentionData }> {
    const { network, transaction, suiGrpcClient } = input;
    const globals = Globals.new(network === 'sui:mainnet' ? Env.prod : Env.dev, { suiGrpcClient });
    const decoder = new DecodeHelper(globals, transaction);
    const result = decoder.decode();

    let intention: MPayIntention;

    switch (result.type) {
      case StreamTransactionType.CREATE_STREAM:
        intention = new CreateStreamIntention(result.info);
        break;
      case StreamTransactionType.SET_AUTO_CLAIM:
        intention = new SetAutoClaimStreamIntention({ streamId: result.streamId, enabled: result.enabled });
        break;
      case StreamTransactionType.CLAIM:
        intention = new ClaimStreamIntention({ streamId: result.streamId });
        break;
      case StreamTransactionType.CLAIM_BY_PROXY:
        intention = new ClaimByProxyStreamIntention({ streamId: result.streamId });
        break;
      case StreamTransactionType.CANCEL:
        intention = new CancelStreamIntention({ streamId: result.streamId });
        break;
      default:
        throw new Error(`Unknown transaction type: ${result}`);
    }

    return {
      txType: intention.txType,
      txSubType: intention.txSubType,
      intentionData: intention.data,
    };
  }

  async build(input: {
    intentionData: MPayIntentionData;
    txType: TransactionType;
    txSubType: string;
    suiGrpcClient: Parameters<IAppHelperInternalGrpc<MPayIntentionData>['build']>[0]['suiGrpcClient'];
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<Transaction> {
    const { intentionData } = input;
    let intention: MPayIntention;
    switch (input.txSubType as StreamTransactionType) {
      case StreamTransactionType.CREATE_STREAM:
        intention = new CreateStreamIntention(intentionData as CreateStreamIntentionData);
        break;
      case StreamTransactionType.CLAIM:
        intention = new ClaimStreamIntention(intentionData as ClaimStreamIntentionData);
        break;
      case StreamTransactionType.CLAIM_BY_PROXY:
        intention = new ClaimByProxyStreamIntention(intentionData as ClaimByProxyStreamIntentionData);
        break;
      case StreamTransactionType.SET_AUTO_CLAIM:
        intention = new SetAutoClaimStreamIntention(intentionData as SetAutoClaimIntentionData);
        break;
      case StreamTransactionType.CANCEL:
        intention = new CancelStreamIntention(intentionData as CancelStreamIntentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ ...input });
  }
}
