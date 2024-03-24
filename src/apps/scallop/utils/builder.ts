import { TransactionBlock } from '@mysten/sui.js/transactions';

/**
 * Check and get the sender from the transaction block.
 *
 * @param txBlock - TxBlock created by SuiKit.
 * @return Sender of transaction.
 */
export const requireSender = (txBlock: TransactionBlock) => {
  const { sender } = txBlock.blockData;
  if (!sender) {
    throw new Error('Sender is required');
  }
  return sender;
};
