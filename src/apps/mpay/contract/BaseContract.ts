import { Transaction } from '@mysten/sui/transactions';

import { ContractConfig, Globals } from '../common';
import { ObjectVector, MoveObject, ResultRef, Ref, ObjectId, toPureArg } from '../common/transaction';
import { CLOCK_ID } from '../const';

export class BaseContract {
  constructor(
    public readonly moduleName: string,
    public readonly config: ContractConfig,
    public readonly globals: Globals,
  ) {}

  addContractCall(txb: Transaction, input: { method: string; arguments: unknown[]; typeArgs?: string[] }) {
    const target =
      `${this.config.contractId}::${this.moduleName}::${input.method}` as `${string}::${string}::${string}`;
    txb.moveCall({
      target,
      arguments: input.arguments.map((arg) => {
        if (arg instanceof ObjectVector) {
          return arg.moveArgs(txb);
        }
        if (arg instanceof MoveObject) {
          return arg.moveArg(txb);
        }
        if (arg instanceof ResultRef) {
          return arg.moveArg();
        }
        return toPureArg(txb, arg);
      }),
      typeArguments: input.typeArgs,
    });
    return txb;
  }

  makeObject(object: Ref<ObjectId>) {
    return typeof object === 'string' ? new MoveObject(object) : object;
  }

  vaultObject() {
    return new MoveObject(this.config.vaultObjId);
  }

  roleObject() {
    return new MoveObject(this.config.roleObjId);
  }

  feeObject() {
    return new MoveObject(this.config.feeObjId);
  }

  clockObject() {
    return new MoveObject(CLOCK_ID);
  }
}
