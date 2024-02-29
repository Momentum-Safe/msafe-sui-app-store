import { StreamEventType, TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { MSafeAppHelper } from '@/apps/interface';
import { SuiNetworks } from '@/types';

import { Env, Globals } from './common';
import { CreateStreamIntention, CreateStreamIntentionData } from './create-stream';
import { DecodeHelper } from './decoder/decoder';
import { StreamTransactionType } from './types/decode';

export type MPayIntention = CreateStreamIntention;

export type MPayIntentionData = CreateStreamIntentionData;

export class MPayAppHelper implements MSafeAppHelper<MPayIntentionData> {
  application = 'mpay';

  async deserialize(
    input: SuiSignTransactionBlockInput & { network: SuiNetworks; suiClient: SuiClient; account: WalletAccount },
  ): Promise<{ txType: TransactionType; txSubType: string; intentionData: CreateStreamIntentionData }> {
    const { chain, transactionBlock } = input;
    const globals = Globals.new(chain === 'sui:mainnet' ? Env.prod : Env.dev);
    const decoder = new DecodeHelper(globals, transactionBlock);
    const result = decoder.decode();
    console.log('🚀 ~ MPayHelper ~ deserialize ~ input:', input, result);
    if (result.type === StreamTransactionType.CREATE_STREAM) {
      return {
        txType: TransactionType.Other,
        txSubType: StreamEventType.Create,
        intentionData: result.info,
      };
    }
    throw new Error(`Unknown transaction type: ${result.type}`);
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
    switch (input.txSubType) {
      case StreamEventType.Create:
        intention = CreateStreamIntention.fromData(intentionData);
        break;
      default:
        throw new Error('not implemented');
    }
    return intention.build({ network, suiClient, account });
  }
}
