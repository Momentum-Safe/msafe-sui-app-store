import { TransactionBlock } from '@mysten/sui.js/transactions';

import { BaseContract } from './BaseContract';
import { ContractConfig, Globals } from '../common';

export class VaultContract extends BaseContract {
  static ModuleName = 'vault';

  static MethodName = {
    withdraw_fee: 'withdraw_fee',
    balance: 'balance',
  } as const;

  constructor(
    public readonly config: ContractConfig,
    public readonly globals: Globals,
  ) {
    super(VaultContract.ModuleName, config, globals);
  }

  withdrawFee(txb: TransactionBlock, coinType: string) {
    const roleObject = this.roleObject();
    const vaultObject = this.vaultObject();
    return this.addContractCall(txb, {
      method: VaultContract.MethodName.withdraw_fee,
      arguments: [roleObject, vaultObject],
      typeArgs: [coinType],
    });
  }

  balance(txb: TransactionBlock, coinType: string) {
    const vaultObject = this.vaultObject();
    return this.addContractCall(txb, {
      method: VaultContract.MethodName.balance,
      arguments: [vaultObject],
      typeArgs: [coinType],
    });
  }
}
