import { MPayError, MPayErrorCode } from './base';

export class NoBackendError extends MPayError {
  constructor() {
    super(MPayErrorCode.NoBackend, 'Backend is not specified');
  }
}
