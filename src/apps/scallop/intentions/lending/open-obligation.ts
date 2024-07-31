import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';
import { SuiNetworks } from '@/types';
import { TransactionSubType } from '../../types/utils';
import { Scallop } from '../../models';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OpenObligationIntentionData {}

export class OpenObligationIntention extends ScallopCoreBaseIntention<OpenObligationIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.OpenObligation;

  constructor(public readonly data: OpenObligationIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock> {
    return input.scallop.client.openObligation();
  }

  static fromData(data: OpenObligationIntentionData): OpenObligationIntention {
    return new OpenObligationIntention(data);
  }
}
