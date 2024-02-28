import { MPayError, MPayErrorCode } from './base';

export class NotCreatorError extends MPayError {
  constructor() {
    super(MPayErrorCode.NotCreator, 'Connected wallet is not creator');
  }
}
