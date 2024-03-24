import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { Decoder } from './decoder';
import { SupplyLendingIntention, SupplyLendingIntentionData } from './intentions/supply-lending';
import { ScallopBuilder } from './models';
import { SuiNetworks } from './types';
import { TransactionSubType } from './types/utils';
import { MSafeAppHelper } from '../interface';

export type ScallopIntention = SupplyLendingIntention;

export type ScallopIntentionData = SupplyLendingIntentionData;

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
    const decoder = new Decoder(transactionBlock, builder.address.get('core.packages.protocol.id'));
    const result = decoder.decode();
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
      default:
        throw new Error('not implemented');
    }
    return intention.build({ suiClient, account, network });
  }
}
