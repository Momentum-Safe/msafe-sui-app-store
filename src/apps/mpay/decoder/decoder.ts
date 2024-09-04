import { MoveCallTransaction } from '@mysten/sui.js/dist/cjs/transactions';
import { Transaction } from '@mysten/sui/transactions';

import { CreateStreamDecodeHelper } from './create';
import { MoveCallHelper } from './moveCall';
import { Globals } from '../common';
import { StreamContract } from '../contract/StreamContract';
import { isSameTarget } from '../sui/utils';
import {
  DecodedCancelStream,
  DecodedClaimByProxy,
  DecodedClaimStream,
  DecodedCreateStream,
  DecodedSetAutoClaim,
  StreamDecodedTransaction,
  StreamTransactionType,
} from '../types/decode';

export class StreamTransactionDecoder {
  static decodeTransaction(globals: Globals, txb: Transaction): StreamDecodedTransaction {
    const helper = new DecodeHelper(globals, txb);
    return helper.decode();
  }
}

export class DecodeHelper {
  private readonly contract: StreamContract;

  constructor(
    public readonly globals: Globals,
    public readonly txb: Transaction,
  ) {
    this.contract = new StreamContract(globals.envConfig.contract, globals);
  }

  decode(): StreamDecodedTransaction {
    if (this.isCreateStreamTransaction()) {
      return this.decodeCreateStreamTransaction();
    }
    if (this.isClaimByProxyTransaction()) {
      return this.decodeClaimByProxyTransaction();
    }
    if (this.isSetAutoClaimTransaction()) {
      return this.decodeSetAutoClaimTransaction();
    }
    if (this.isCancelStreamTransaction()) {
      return this.decodeCancelStreamTransaction();
    }
    if (this.isClaimStreamTransaction()) {
      return this.decodeClaimTransaction();
    }
    throw new Error('Unknown stream transaction type');
  }

  private get transactions() {
    return this.txb.blockData.transactions;
  }

  private isCreateStreamTransaction() {
    const createStreamIndex = this.transactions.findIndex(
      (tx) => tx.kind === 'MoveCall' && isSameTarget(tx.target, this.contract.createStreamTarget),
    );
    return createStreamIndex !== -1;
  }

  private isSetAutoClaimTransaction() {
    return (
      this.transactions.length === 1 &&
      this.transactions[0].kind === 'MoveCall' &&
      isSameTarget(this.transactions[0].target, this.contract.setAutoClaimTarget)
    );
  }

  private isCancelStreamTransaction() {
    return (
      this.transactions.length === 1 &&
      this.transactions[0].kind === 'MoveCall' &&
      isSameTarget(this.transactions[0].target, this.contract.cancelStreamTarget)
    );
  }

  private isClaimStreamTransaction(): boolean {
    return (
      this.transactions.length === 1 &&
      this.transactions[0].kind === 'MoveCall' &&
      isSameTarget(this.transactions[0].target, this.contract.claimStreamTarget)
    );
  }

  private isClaimByProxyTransaction(): boolean {
    return (
      this.transactions.length === 1 &&
      this.transactions[0].kind === 'MoveCall' &&
      isSameTarget(this.transactions[0].target, this.contract.claimStreamByProxyTarget)
    );
  }

  private decodeCreateStreamTransaction(): DecodedCreateStream {
    const helper = new CreateStreamDecodeHelper(this.globals, this.txb);
    return helper.decode();
  }

  private decodeSetAutoClaimTransaction(): DecodedSetAutoClaim {
    const streamId = this.helper.decodeSharedObjectId(0);
    const enabled = this.helper.decodeInputBool(1);
    return {
      type: StreamTransactionType.SET_AUTO_CLAIM,
      streamId,
      enabled,
    };
  }

  private decodeClaimTransaction(): DecodedClaimStream {
    const streamId = this.helper.decodeSharedObjectId(0);
    return {
      type: StreamTransactionType.CLAIM,
      streamId,
    };
  }

  private decodeClaimByProxyTransaction(): DecodedClaimByProxy {
    const streamId = this.helper.decodeSharedObjectId(0);
    return {
      type: StreamTransactionType.CLAIM_BY_PROXY,
      streamId,
    };
  }

  private decodeCancelStreamTransaction(): DecodedCancelStream {
    const streamId = this.helper.decodeSharedObjectId(0);
    return {
      type: StreamTransactionType.CANCEL,
      streamId,
    };
  }

  private get helper() {
    const moveCall = this.transactions[0] as MoveCallTransaction;
    return new MoveCallHelper(moveCall, this.txb);
  }
}
