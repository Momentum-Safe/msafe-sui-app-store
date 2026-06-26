import { Transaction } from '@mysten/sui/transactions';

import { CreateStreamDecodeHelper } from './create';
import { MoveCallHelper } from './moveCall';
import { Globals } from '../common';
import { StreamContract } from '../contract/StreamContract';
import { getMoveCallTarget, isSameTarget } from '../sui/utils';
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

  private get commands() {
    return this.txb.getData().commands;
  }

  private isCreateStreamTransaction() {
    const createStreamIndex = this.commands.findIndex(
      (command) =>
        command.$kind === 'MoveCall' && isSameTarget(getMoveCallTarget(command)!, this.contract.createStreamTarget),
    );
    return createStreamIndex !== -1;
  }

  private isSetAutoClaimTransaction() {
    return (
      this.commands.length === 1 &&
      this.commands[0].$kind === 'MoveCall' &&
      isSameTarget(getMoveCallTarget(this.commands[0])!, this.contract.setAutoClaimTarget)
    );
  }

  private isCancelStreamTransaction() {
    return (
      this.commands.length === 1 &&
      this.commands[0].$kind === 'MoveCall' &&
      isSameTarget(getMoveCallTarget(this.commands[0])!, this.contract.cancelStreamTarget)
    );
  }

  private isClaimStreamTransaction(): boolean {
    return (
      this.commands.length === 1 &&
      this.commands[0].$kind === 'MoveCall' &&
      isSameTarget(getMoveCallTarget(this.commands[0])!, this.contract.claimStreamTarget)
    );
  }

  private isClaimByProxyTransaction(): boolean {
    return (
      this.commands.length === 1 &&
      this.commands[0].$kind === 'MoveCall' &&
      isSameTarget(getMoveCallTarget(this.commands[0])!, this.contract.claimStreamByProxyTarget)
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
    const moveCall = this.commands[0];
    if (moveCall.$kind !== 'MoveCall') {
      throw new Error('MoveCall not found');
    }
    return new MoveCallHelper(moveCall, this.txb);
  }
}
