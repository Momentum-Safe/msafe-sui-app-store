import { IotaClient } from '@iota/iota-sdk/client';
import { TransactionBlock } from '@iota/iota-sdk/transactions';
import { WalletAccount } from '@iota/wallet-standard';
import { TransactionType } from '@msafe/iota-utils';
import sortKeys from 'sort-keys-recursive';

import { TransactionIntention } from '@/apps/interface';
import { SuiNetworks } from '@/types';

export abstract class CoreBaseIntention<D> implements TransactionIntention<D> {
  abstract txType: TransactionType;

  abstract txSubType: string;

  protected constructor(public readonly data: D) {}

  get application() {
    return 'msafe-core';
  }

  serialize() {
    return JSON.stringify(sortKeys(this.data));
  }

  abstract build(input: {
    client: IotaClient;
    account: WalletAccount;
    network: SuiNetworks;
  }): Promise<TransactionBlock>;
}
