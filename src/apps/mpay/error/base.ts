export enum MPayErrorCode {
  sanity,
  walletNotConnected,
  InvalidInput,
  InvalidRpcResult,
  NotEnoughBalance,
  StreamNotFound,
  RpcError,
  NotCreator,
  NotRecipient,
  InvalidStreamGroup,
  BackendError,
  NoBackend,
  TransactionFailed,
}

export type JsonObject =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | readonly JsonObject[]
  | { readonly [key: string]: JsonObject }
  | { toJSON(): JsonObject };

export class MPayError extends Error {
  public readonly mpayErrorCode: number;

  public readonly context?: JsonObject;

  constructor(mpayErrorCode: number, msg: string, options: { cause?: unknown; context?: JsonObject } = {}) {
    const { cause, context } = options;
    if (cause) {
      super(`[MPay] ${msg}: ${cause}`);
    } else {
      super(`[MPay] ${msg}`);
    }
    this.mpayErrorCode = mpayErrorCode;
    this.context = context;
  }
}
