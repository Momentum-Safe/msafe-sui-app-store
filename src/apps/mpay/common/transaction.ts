import { TransactionArgument, TransactionBlock } from '@mysten/sui.js/transactions';

export type MoveNumber = bigint | string | number;
export type Ref<T> = T | ResultRef;
export type ObjectId = string;

export class MoveObject {
  constructor(public readonly object: string) {}

  moveArg(txb: TransactionBlock) {
    return txb.object(this.object);
  }
}

export class ObjectVector {
  constructor(public readonly objects: string[]) {}

  moveArgs(txb: TransactionBlock) {
    return txb.makeMoveVec({ objects: this.objects.map((o) => txb.object(o)) });
  }
}

export class ResultRef {
  constructor(public readonly result: TransactionArgument & TransactionArgument[]) {
    // eslint-disable-next-line no-constructor-return
    return new Proxy(this, {
      set() {
        throw new Error('The transaction result is a proxy, and does not support setting properties directly');
      },
      get(target, property) {
        // This allows this transaction argument to be used in the singular form:
        if (property in target) {
          return Reflect.get(target, property);
        }

        const nestedResultFor = (resultIndex: number) => new ResultRef(target.result[resultIndex] as any);

        // Support destructuring:
        if (property === Symbol.iterator) {
          return function* () {
            let i = 0;
            while (true) {
              yield nestedResultFor(i);
              i++;
            }
          };
        }

        if (typeof property === 'symbol') {
          // eslint-disable-next-line consistent-return
          return;
        }

        const resultIndex = parseInt(property, 10);
        if (Number.isNaN(resultIndex) || resultIndex < 0) {
          // eslint-disable-next-line consistent-return
          return;
        }
        return nestedResultFor(resultIndex);
      },
    });
  }

  moveArg() {
    return this.result;
  }
}
