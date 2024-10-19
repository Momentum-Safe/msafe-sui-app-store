import { TransactionType } from '@msafe/sui3-utils';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiSignTransactionBlockInput, WalletAccount } from '@mysten/wallet-standard';

import { SuiNetworks } from '@/types';

// External interface to be use by msafe backend & sdk
//
// TODO: update to @mysten/sui after backend & sdk updated to @mysten/sui
export interface IAppHelper<T> {
  deserialize(
    input: SuiSignTransactionBlockInput & {
      network: SuiNetworks;
      clientUrl: string;
      account: WalletAccount;
      appContext?: any;
    },
  ): Promise<{
    txType: TransactionType;
    txSubType: string;
    intentionData: T;
  }>;
  // TODO: return @mysten/sui Transaction after backend & sdk updated to @mysten/sui
  build(input: {
    network: SuiNetworks;
    txType: TransactionType;
    txSubType: string;
    intentionData: T;
    clientUrl: string;
    account: WalletAccount;
  }): Promise<TransactionBlock>;
}
