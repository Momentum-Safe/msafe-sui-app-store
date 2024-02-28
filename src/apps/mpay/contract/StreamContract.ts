import { TransactionBlock } from '@mysten/sui.js/transactions';

import { BaseContract } from './BaseContract';
import { ContractConfig, Globals } from '../common';
import { Ref, ObjectId, MoveNumber } from '../common/transaction';

export class StreamContract extends BaseContract {
  static ModuleName = 'stream';

  static MethodName = {
    create_stream: 'create_stream',
    set_auto_claim: 'set_auto_claim',
    cancel_stream: 'cancel_stream',
    claim_stream: 'claim_stream',
    claim_stream_by_proxy: 'claim_stream_by_proxy',
    stream_current_epoch: 'stream_current_epoch',
    now_milli_seconds: 'now_milli_seconds',
  } as const;

  constructor(
    public readonly config: ContractConfig,
    public readonly globals: Globals,
  ) {
    super(StreamContract.ModuleName, config, globals);
  }

  createStream(
    txb: TransactionBlock,
    input: {
      paymentCoin: Ref<ObjectId>;
      flatFeeCoin: Ref<ObjectId>;
      metadata: string;
      recipient: string;
      timeStart: Ref<MoveNumber>;
      cliff: Ref<MoveNumber>;
      epochInterval: Ref<MoveNumber>;
      numEpoch: Ref<MoveNumber>;
      amountPerEpoch: Ref<MoveNumber>;
      cancelable: boolean;
      coinType: string;
    },
  ) {
    const feeObject = this.feeObject();
    const vaultObject = this.vaultObject();
    const paymentCoinObject = this.makeObject(input.paymentCoin);
    const flatFeeObject = this.makeObject(input.flatFeeCoin);
    const clockObject = this.clockObject();
    return this.addContractCall(txb, {
      method: StreamContract.MethodName.create_stream,
      arguments: [
        feeObject,
        vaultObject,
        paymentCoinObject,
        flatFeeObject,
        input.metadata,
        input.recipient,
        input.timeStart,
        input.cliff,
        input.epochInterval,
        input.numEpoch,
        input.amountPerEpoch,
        input.cancelable,
        clockObject,
      ],
      typeArgs: [input.coinType],
    });
  }

  setAutoClaim(
    txb: TransactionBlock,
    input: {
      streamId: Ref<ObjectId>;
      enabled: boolean;
      coinType: string;
    },
  ) {
    const streamObject = this.makeObject(input.streamId);
    return this.addContractCall(txb, {
      method: StreamContract.MethodName.set_auto_claim,
      arguments: [streamObject, input.enabled],
      typeArgs: [input.coinType],
    });
  }

  cancelStream(
    txb: TransactionBlock,
    input: {
      streamId: Ref<ObjectId>;
      coinType: string;
    },
  ) {
    const streamObject = this.makeObject(input.streamId);
    const clockObject = this.clockObject();
    return this.addContractCall(txb, {
      method: StreamContract.MethodName.cancel_stream,
      arguments: [streamObject, clockObject],
      typeArgs: [input.coinType],
    });
  }

  claimStream(
    txb: TransactionBlock,
    input: {
      streamId: Ref<ObjectId>;
      coinType: string;
    },
  ) {
    const streamObject = this.makeObject(input.streamId);
    const clockObject = this.clockObject();
    return this.addContractCall(txb, {
      method: StreamContract.MethodName.claim_stream,
      arguments: [streamObject, clockObject],
      typeArgs: [input.coinType],
    });
  }

  claimStreamByProxy(
    txb: TransactionBlock,
    input: {
      streamId: Ref<ObjectId>;
      coinType: string;
    },
  ) {
    const streamObject = this.makeObject(input.streamId);
    const vaultObject = this.vaultObject();
    const feeObject = this.feeObject();
    const clockObject = this.clockObject();
    return this.addContractCall(txb, {
      method: StreamContract.MethodName.claim_stream_by_proxy,
      arguments: [streamObject, vaultObject, feeObject, clockObject],
      typeArgs: [input.coinType],
    });
  }

  get createStreamTarget() {
    return `${this.config.contractId}::${StreamContract.ModuleName}::${StreamContract.MethodName.create_stream}`;
  }

  get setAutoClaimTarget() {
    return `${this.config.contractId}::${StreamContract.ModuleName}::${StreamContract.MethodName.set_auto_claim}`;
  }

  get cancelStreamTarget() {
    return `${this.config.contractId}::${StreamContract.ModuleName}::${StreamContract.MethodName.cancel_stream}`;
  }

  get claimStreamTarget() {
    return `${this.config.contractId}::${StreamContract.ModuleName}::${StreamContract.MethodName.claim_stream}`;
  }

  get claimStreamByProxyTarget() {
    return `${this.config.contractId}::${StreamContract.ModuleName}::${StreamContract.MethodName.claim_stream_by_proxy}`;
  }
}
