import { JsonObject, MPayError, MPayErrorCode } from './base';

export class BackendError extends MPayError {
  constructor(msg: string, context?: JsonObject) {
    super(MPayErrorCode.BackendError, msg, { context });
  }
}
