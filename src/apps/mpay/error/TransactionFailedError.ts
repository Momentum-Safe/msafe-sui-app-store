import { MPayError, MPayErrorCode } from './base';

export class TransactionFailedError extends MPayError {
  constructor(status: string | undefined, msg: string | undefined) {
    super(MPayErrorCode.TransactionFailed, `Transaction failed: ${msg}`, {
      context: {
        status,
        msg,
      },
    });
  }
}
