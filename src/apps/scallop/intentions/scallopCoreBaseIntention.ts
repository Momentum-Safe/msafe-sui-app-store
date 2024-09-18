import { TransactionType } from '@msafe/sui3-utils';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { WalletAccount } from '@mysten/wallet-standard';
import sortKeys from 'sort-keys-recursive';

import { BaseIntentionLegacy } from '@/apps/interface/sui-js';
import { SuiNetworks } from '@/types';

import { Scallop } from '../models';

export abstract class ScallopCoreBaseIntention<D> implements BaseIntentionLegacy<D> {
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
    suiClient: SuiClient;
    account: WalletAccount;
    network: SuiNetworks;
    scallop: Scallop;
  }): Promise<TransactionBlock>;
}
