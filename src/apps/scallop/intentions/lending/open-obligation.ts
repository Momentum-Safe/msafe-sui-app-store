import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import { ScallopClient } from '@scallop-io/sui-scallop-sdk';

import { SuiClient } from '@/compat/mysten-sui-json-rpc';
import { SuiNetworks } from '@/types';

import { TransactionSubType } from '../../types/utils';
import { fromScallopTransaction } from '../../utils/transaction';
import { ScallopCoreBaseIntention } from '../scallopCoreBaseIntention';

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
    scallopClient: ScallopClient;
  }): Promise<Transaction> {
    return fromScallopTransaction(await input.scallopClient.openObligation(false));
  }

  static fromData(data: OpenObligationIntentionData): OpenObligationIntention {
    return new OpenObligationIntention(data);
  }
}
