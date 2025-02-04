import { TransactionType } from '@msafe/sui3-utils';
import { Transaction } from '@mysten/sui/transactions';
import sortKeys from 'sort-keys-recursive';

import { BaseIntention } from '@/apps/interface/sui';
import { IntentionInput } from '@/apps/suilend/types/intention';

export abstract class SpringSuiBaseIntention<D> implements BaseIntention<D> {
  abstract txType: TransactionType;

  abstract txSubType: string;

  protected constructor(public readonly data: D) {}

  abstract build(input: IntentionInput): Promise<Transaction>;

  serialize() {
    return JSON.stringify(sortKeys(this.data));
  }
}
