import { Transaction } from '@mysten/sui/transactions';

type GetDataReturnType = ReturnType<Transaction['getData']>;
export type TransactionInputs = GetDataReturnType['inputs'];
export type TransactionCommands = GetDataReturnType['commands'];
export type TransactionCommand = TransactionCommands[number];

export type TransferObjectsCommand = TransactionCommand['TransferObjects'];
export type MoveCallCommand = TransactionCommand['MoveCall'];
export type SplitCoinCommand = TransactionCommand['SplitCoins'];

export type TxBlockTransactionType = Transaction['blockData']['transactions'][number];
export type MoveCallTransactionType = TxBlockTransactionType & { kind: 'MoveCall' };
export type SplitCoinTransactionType = TxBlockTransactionType & { kind: 'SplitCoins' };
export type MoveCallTransactionArgumentType = MoveCallTransactionType['arguments'][number];

export type BcsType = 'U8' | 'U16' | 'U32' | 'U64' | 'U128' | 'U256' | 'Address' | 'String' | 'Bool';
