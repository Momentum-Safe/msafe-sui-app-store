import { MPayError, JsonObject, MPayErrorCode } from './base';

export class InvalidRpcResultError extends MPayError {
  constructor(msg: string, ctx?: JsonObject) {
    super(MPayErrorCode.InvalidRpcResult, msg, { context: ctx });
  }
}
