import { Transaction } from '@mysten/sui/transactions';

import { BaseContract } from './BaseContract';
import { ContractConfig, Globals } from '../common';

export class RoleContract extends BaseContract {
  static ModuleName = 'role';

  static MethodName = {
    set_collector: 'set_collector',
    transfer_admin: 'transfer_admin',
    accept_admin: 'accept_admin',
    get_collector: 'get_collector',
    get_pending_admin: 'get_pending_admin',
    get_admin: 'get_admin',
  } as const;

  constructor(
    public readonly config: ContractConfig,
    public readonly globals: Globals,
  ) {
    super(RoleContract.ModuleName, config, globals);
  }

  setCollector(txb: Transaction, newCollector: string) {
    const roleObject = this.roleObject();
    return this.addContractCall(txb, {
      method: RoleContract.MethodName.set_collector,
      arguments: [roleObject, newCollector],
      typeArgs: [],
    });
  }

  transferAdmin(txb: Transaction, newAdmin: string) {
    const roleObject = this.roleObject();
    return this.addContractCall(txb, {
      method: RoleContract.MethodName.transfer_admin,
      arguments: [roleObject, newAdmin],
      typeArgs: [],
    });
  }

  acceptAdmin(txb: Transaction) {
    const roleObject = this.roleObject();
    return this.addContractCall(txb, {
      method: RoleContract.MethodName.accept_admin,
      arguments: [roleObject],
      typeArgs: [],
    });
  }

  getCollector(txb: Transaction) {
    const roleObject = this.roleObject();
    return this.addContractCall(txb, {
      method: RoleContract.MethodName.get_collector,
      arguments: [roleObject],
      typeArgs: [],
    });
  }

  getPendingAdmin(txb: Transaction) {
    const roleObject = this.roleObject();
    return this.addContractCall(txb, {
      method: RoleContract.MethodName.get_pending_admin,
      arguments: [roleObject],
      typeArgs: [],
    });
  }

  getAdmin(txb: Transaction) {
    const roleObject = this.roleObject();
    return this.addContractCall(txb, {
      method: RoleContract.MethodName.get_admin,
      arguments: [roleObject],
      typeArgs: [],
    });
  }
}
