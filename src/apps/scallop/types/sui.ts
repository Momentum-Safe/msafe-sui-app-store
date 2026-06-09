import { TransactionData } from '@mysten/sui/transactions';

export type TransactionInputs = TransactionData['inputs'];
export type TransactionCommands = TransactionData['commands'];
export type TransactionCommand = TransactionCommands[number];
export type TransactionCommandKind = TransactionCommand['$kind'];

export type TransferObjectsCommand = TransactionCommand['TransferObjects'];
export type MoveCallCommand = TransactionCommand['MoveCall'];
export type SplitCoinCommand = TransactionCommand['SplitCoins'];

// A single resolved input (CallArg) from getData().inputs.
export type TransactionInput = TransactionInputs[number];
// Full command variants (replace the deprecated blockData-based aliases).
export type MoveCallTransactionType = Extract<TransactionCommand, { $kind: 'MoveCall' }>;
export type SplitCoinTransactionType = Extract<TransactionCommand, { $kind: 'SplitCoins' }>;
// A single argument reference of a MoveCall command.
export type MoveCallTransactionArgumentType = NonNullable<MoveCallCommand>['arguments'][number];

export type BcsType = 'U8' | 'U16' | 'U32' | 'U64' | 'U128' | 'U256' | 'Address' | 'String' | 'Bool';
