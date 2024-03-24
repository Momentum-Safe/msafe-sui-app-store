import { TransactionBlock } from '@mysten/sui.js/transactions';

import { newBorrowIncentiveTxBlock } from './borrowIncentiveBuilder';
import { newCoreTxBlock } from './coreBuilder';
import { newSpoolTxBlock } from './spoolBuilder';
import type { ScallopBuilder } from '../models';
import type { ScallopTxBlock } from '../types';

/**
 * Create a new ScallopTxBlock instance.
 *
 * @param builder - Scallop builder instance.
 * @param txBlock - Scallop txBlock, txBlock created by SuiKit, or original transaction block.
 * @return ScallopTxBlock.
 */
export const newScallopTxBlock = (
  builder: ScallopBuilder,
  initTxBlock?: ScallopTxBlock | TransactionBlock,
): ScallopTxBlock => {
  const borrowIncentiveTxBlock = newBorrowIncentiveTxBlock(builder, initTxBlock);
  const spoolTxBlock = newSpoolTxBlock(builder, borrowIncentiveTxBlock);
  const coreTxBlock = newCoreTxBlock(builder, spoolTxBlock);

  return new Proxy(coreTxBlock, {
    get: (target, prop) => {
      if (prop in borrowIncentiveTxBlock) {
        return Reflect.get(borrowIncentiveTxBlock, prop);
      }
      if (prop in spoolTxBlock) {
        return Reflect.get(spoolTxBlock, prop);
      }
      return Reflect.get(target, prop);
    },
  }) as ScallopTxBlock;
};
