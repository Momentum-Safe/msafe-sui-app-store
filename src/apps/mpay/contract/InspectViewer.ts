import { Buffer } from 'buffer';

import { DevInspectResults, SuiExecutionResult } from '@mysten/sui.js/client';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';

import { InvalidRpcResultError } from '../error/InvalidRpcResultError';

export class InspectViewer {
  constructor(readonly results: DevInspectResults) {}

  callResult(index: number) {
    return this.results.results![index];
  }

  returnValue(returned: SuiExecutionResult, index: number) {
    return returned.returnValues![index];
  }

  getValue(callIndex = 0, returnIndex = 0) {
    const callResult = this.callResult(callIndex);
    return this.returnValue(callResult, returnIndex);
  }

  getAddress(callIndex = 0, returnIndex = 0) {
    const [value, type] = this.getValue(callIndex, returnIndex);
    if (type !== 'address') {
      throw new InvalidRpcResultError('Invalid contract return type.', {
        ctx: {
          expectType: 'address',
          gotType: type,
        },
      });
    }
    return normalizeSuiAddress(Buffer.from(value).toString('hex'));
  }

  getU64(callIndex = 0, returnIndex = 0) {
    const [value, type] = this.getValue(callIndex, returnIndex);
    if (type !== 'u64') {
      throw new InvalidRpcResultError('Invalid contract return type.', {
        ctx: {
          expectType: 'u64',
          gotType: type,
        },
      });
    }
    return Buffer.from(value).readBigInt64LE();
  }
}
