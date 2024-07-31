import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';

import { CoreBaseIntention } from '@/apps/msafe-core/intention';
import { SuiNetworks } from '@/types';

import { ScallopClient } from '../../models/scallopClient';
import { NetworkType } from '../../types';
import { TransactionSubType } from '../../types/utils';
import { scallopInstance } from '../../models';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OpenObligationIntentionData {}

export class OpenObligationIntention extends CoreBaseIntention<OpenObligationIntentionData> {
  txType: TransactionType.Other;

  txSubType: TransactionSubType.OpenObligation;

  constructor(public readonly data: OpenObligationIntentionData) {
    super(data);
  }

  async build(input: {
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock> {
    const scallopClient = scallopInstance.client;
    scallopClient.client = input.suiClient;
    scallopClient.walletAddress = input.account.address;
    
    return scallopClient.openObligation();
  }

  static fromData(data: OpenObligationIntentionData): OpenObligationIntention {
    return new OpenObligationIntention(data);
  }
}
