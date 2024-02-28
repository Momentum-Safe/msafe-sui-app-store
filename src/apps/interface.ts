import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

export interface MSafeAppHelper<T extends TransactionIntention<D>, D> {
  application: string;
  deserialize(input: SuiSignTransactionBlockInput): T;
  build(input: {
    network: SuiNetworks;
    txType: TransactionType;
    txSubType: string;
    intentionData: D;
    suiClient: SuiClient;
    account: WalletAccount;
  }): Promise<TransactionBlock>;
}

export interface TransactionIntention<D> {
  application: string;
  txType: TransactionType;
  txSubType: string;
  data: D;
  serialize(): string;
}
