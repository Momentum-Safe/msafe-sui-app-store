import { MPayError, JsonObject, MPayErrorCode } from './base';

export class RpcError extends MPayError {
  constructor(msg: string, context?: JsonObject) {
    super(MPayErrorCode.RpcError, msg, {
      context,
    });
  }
}
