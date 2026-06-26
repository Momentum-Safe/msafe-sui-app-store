import { bcs } from '@mysten/bcs';

import { InvalidRpcResultError } from '../error/InvalidRpcResultError';
import { MpaySimulateResult, readU64FromCommandResult } from '../utils/rpc';

export class InspectViewer {
  constructor(readonly results: MpaySimulateResult) {}

  getU64(callIndex = 0, returnIndex = 0) {
    try {
      return readU64FromCommandResult(this.results, callIndex, returnIndex);
    } catch {
      const [value, type] = this.getLegacyValue(callIndex, returnIndex);
      if (type !== 'u64') {
        throw new InvalidRpcResultError('Invalid contract return type.', {
          ctx: {
            expectType: 'u64',
            gotType: type,
          },
        });
      }
      return bcs.u64().parse(Uint8Array.from(value));
    }
  }

  private getLegacyValue(callIndex = 0, returnIndex = 0) {
    const callResult = this.results.results?.[callIndex];
    const returnValues = callResult?.returnValues;
    if (!returnValues?.[returnIndex]) {
      throw new InvalidRpcResultError('Invalid contract return type.', {
        ctx: {
          expectType: 'u64',
          gotType: 'missing',
        },
      });
    }
    return returnValues[returnIndex];
  }
}
