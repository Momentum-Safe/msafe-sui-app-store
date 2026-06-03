import { fromBase64 } from '@mysten/bcs';
import type { Transaction } from '@mysten/sui/transactions';
import type { TransactionBlockInput } from '@mysten/sui.js/transactions';

type LegacyMoveCallArgument = {
  kind: string;
  index?: number;
  value?: unknown;
};

export type LegacyMoveCallTransaction = {
  kind: 'MoveCall';
  target: string;
  arguments: LegacyMoveCallArgument[];
  typeArguments?: string[];
};

export type LegacyBlockData = {
  sender?: string | null;
  version: number;
  gasConfig: {
    budget?: string | number | null;
    price?: string | number | null;
    owner?: string | null;
    payment?: Array<{ objectId: string; version: string | number; digest: string }> | null;
  };
  inputs: TransactionBlockInput[];
  transactions: Array<LegacyMoveCallTransaction | Record<string, unknown>>;
};

function toPureBytes(bytes: string | Uint8Array): number[] {
  const value = typeof bytes === 'string' ? fromBase64(bytes) : bytes;
  return Array.from(value);
}

function convertInput(input: Record<string, unknown>): TransactionBlockInput {
  const kind = input.$kind as string | undefined;

  if (kind === 'Pure' || 'Pure' in input) {
    const pure = input.Pure as { bytes?: string | Uint8Array } | undefined;
    const bytes = pure?.bytes ?? pure;
    return {
      type: 'pure',
      value: {
        Pure: toPureBytes(bytes as string | Uint8Array),
      },
    };
  }

  if (kind === 'Object' || 'Object' in input) {
    const object = input.Object as Record<string, unknown>;
    const objectKind = object.$kind as string | undefined;

    if (objectKind === 'ImmOrOwnedObject' || 'ImmOrOwnedObject' in object) {
      const immOrOwned = (object.ImmOrOwnedObject ?? object) as {
        objectId: string;
        version: string | number;
        digest: string;
      };
      return {
        type: 'object',
        objectType: 'immOrOwned',
        value: {
          Object: {
            ImmOrOwned: {
              objectId: immOrOwned.objectId,
              version: immOrOwned.version,
              digest: immOrOwned.digest,
            },
          },
        },
      };
    }

    if (objectKind === 'SharedObject' || 'SharedObject' in object) {
      const shared = (object.SharedObject ?? object) as {
        objectId: string;
        initialSharedVersion: string | number;
        mutable: boolean;
      };
      return {
        type: 'object',
        objectType: 'shared',
        value: {
          Object: {
            Shared: {
              objectId: shared.objectId,
              initialSharedVersion: shared.initialSharedVersion,
              mutable: shared.mutable,
            },
          },
        },
      };
    }
  }

  if (kind === 'UnresolvedObject' || 'UnresolvedObject' in input) {
    const unresolved = input.UnresolvedObject as { objectId: string };
    return {
      type: 'object',
      objectType: 'immOrOwned',
      value: {
        Object: {
          ImmOrOwned: {
            objectId: unresolved.objectId,
          },
        },
      },
    };
  }

  if (kind === 'UnresolvedPure' || 'UnresolvedPure' in input) {
    const unresolved = input.UnresolvedPure as { value: unknown };
    return {
      type: 'pure',
      value: unresolved.value,
    };
  }

  throw new Error(`Unsupported transaction input: ${JSON.stringify(input)}`);
}

function convertArgument(arg: Record<string, unknown>): LegacyMoveCallArgument {
  const kind = arg.$kind as string | undefined;

  if (kind === 'Input' || 'Input' in arg) {
    return {
      kind: 'Input',
      index: arg.Input as number,
    };
  }

  if (kind === 'GasCoin' || arg.GasCoin === true) {
    return { kind: 'GasCoin' };
  }

  if (kind === 'Result' || 'Result' in arg) {
    return { kind: 'Result', index: arg.Result as number };
  }

  if (kind === 'NestedResult' || 'NestedResult' in arg) {
    const [index, subIndex] = arg.NestedResult as [number, number];
    return { kind: 'NestedResult', index, value: subIndex };
  }

  throw new Error(`Unsupported move call argument: ${JSON.stringify(arg)}`);
}

function convertCommand(command: Record<string, unknown>): LegacyMoveCallTransaction | Record<string, unknown> {
  const kind = command.$kind as string | undefined;

  if (kind === 'MoveCall' || 'MoveCall' in command) {
    const moveCall = command.MoveCall as {
      package: string;
      module: string;
      function: string;
      typeArguments?: string[];
      arguments?: Record<string, unknown>[];
    };

    return {
      kind: 'MoveCall',
      target: `${moveCall.package}::${moveCall.module}::${moveCall.function}`,
      typeArguments: moveCall.typeArguments ?? [],
      arguments: (moveCall.arguments ?? []).map((arg) => convertArgument(arg)),
    };
  }

  if (!kind) {
    throw new Error(`Unsupported transaction command: ${JSON.stringify(command)}`);
  }

  const payload = command[kind];
  return {
    kind,
    ...(typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {}),
  };
}

export function getTransactionBlockData(tx: Transaction): LegacyBlockData {
  const legacyBlockData = (tx as Transaction & { blockData?: LegacyBlockData }).blockData;
  if (legacyBlockData) {
    return legacyBlockData;
  }

  const data = tx.getData();

  return {
    sender: data.sender,
    version: data.version,
    gasConfig: {
      budget: data.gasData.budget,
      price: data.gasData.price,
      owner: data.gasData.owner,
      payment: data.gasData.payment,
    },
    inputs: data.inputs.map((input) => convertInput(input as Record<string, unknown>)),
    transactions: data.commands.map((command) => convertCommand(command as Record<string, unknown>)),
  };
}
