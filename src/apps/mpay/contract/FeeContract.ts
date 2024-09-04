import { Transaction } from '@mysten/sui/transactions';

import { BaseContract } from './BaseContract';
import { ContractConfig, Globals } from '../common';
import { MoveNumber } from '../common/transaction';

export class FeeContract extends BaseContract {
  static ModuleName = 'fee_module';

  static MethodName = {
    set_streaming_fee: 'set_streaming_fee',
    set_claim_fee: 'set_claim_fee',
    set_streaming_flat_fee: 'set_streaming_flat_fee',
    streaming_flat_fee: 'streaming_flat_fee',
    streaming_fee: 'streaming_fee',
    claim_fee: 'claim_fee',
    fee_denominator: 'fee_denominator',
  } as const;

  constructor(
    public readonly config: ContractConfig,
    public readonly globals: Globals,
  ) {
    super(FeeContract.ModuleName, config, globals);
  }

  setStreamingFee(txb: Transaction, createFeeNumerator: MoveNumber) {
    const roleObject = this.roleObject();
    const feeObject = this.feeObject();
    return this.addContractCall(txb, {
      method: FeeContract.MethodName.set_streaming_fee,
      arguments: [roleObject, feeObject, createFeeNumerator],
      typeArgs: [],
    });
  }

  setStreamingFlatFee(txb: Transaction, flatFee: MoveNumber) {
    const roleObject = this.roleObject();
    const feeObject = this.feeObject();
    return this.addContractCall(txb, {
      method: FeeContract.MethodName.set_streaming_flat_fee,
      arguments: [roleObject, feeObject, flatFee],
      typeArgs: [],
    });
  }

  setClaimFee(txb: Transaction, claimFee: MoveNumber) {
    const roleObject = this.roleObject();
    const feeObject = this.feeObject();
    return this.addContractCall(txb, {
      method: FeeContract.MethodName.set_claim_fee,
      arguments: [roleObject, feeObject, claimFee],
      typeArgs: [],
    });
  }

  streamingFee(txb: Transaction, amount: MoveNumber) {
    const feeObject = this.feeObject();
    return this.addContractCall(txb, {
      method: FeeContract.MethodName.streaming_fee,
      arguments: [feeObject, amount],
      typeArgs: [],
    });
  }

  claimFee(txb: Transaction, amount: MoveNumber) {
    return this.addContractCall(txb, {
      method: FeeContract.MethodName.claim_fee,
      arguments: [this.feeObject(), amount],
      typeArgs: [],
    });
  }

  feeDenominator(txb: Transaction) {
    return this.addContractCall(txb, {
      method: FeeContract.MethodName.fee_denominator,
      arguments: [this.feeObject()],
      typeArgs: [],
    });
  }
}
