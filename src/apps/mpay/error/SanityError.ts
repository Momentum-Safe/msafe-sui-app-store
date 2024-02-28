import { MPayError, JsonObject, MPayErrorCode } from './base';

/**
 * SanityError is the error reported because of error in code.
 * For normal user process, the sanity error shall never be thrown.
 */
export class SanityError extends MPayError {
  constructor(msg: string, options: { cause?: unknown; context?: JsonObject } = {}) {
    super(MPayErrorCode.sanity, msg, options);
  }
}
