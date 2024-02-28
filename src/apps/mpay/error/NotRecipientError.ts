import { MPayError, MPayErrorCode } from './base';

export class NotRecipientError extends MPayError {
  constructor() {
    super(MPayErrorCode.NotRecipient, 'Connected wallet is not recipient');
  }
}
