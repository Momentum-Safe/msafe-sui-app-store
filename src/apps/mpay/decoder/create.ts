import { Transaction } from '@mysten/sui/transactions';

import { CreateStreamHelper } from '../builder/CreateStreamHelper';
import { Globals } from '../common';
import { MoveCallHelper } from './moveCall';
import { FeeContract } from '../contract/FeeContract';
import { StreamContract } from '../contract/StreamContract';
import { InvalidInputError } from '../error/InvalidInputError';
import { SanityError } from '../error/SanityError';
import { decodeMetadata } from '../stream/metadata';
import { getMoveCallTarget, isSameTarget } from '../sui/utils';
import { CreateStreamInfo, RecipientWithAmount } from '../types/client';
import { DecodedCreateStream, StreamTransactionType } from '../types/decode';

export class CreateStreamDecodeHelper {
  constructor(
    public readonly globals: Globals,
    public readonly txb: Transaction,
  ) {}

  decode(): DecodedCreateStream {
    const streamInfo = this.decodeCreateStreamInfo();
    const fees = this.createStreamHelper().calculateCreateStreamFees(streamInfo);
    return {
      type: StreamTransactionType.CREATE_STREAM,
      info: streamInfo,
      fees,
    };
  }

  private decodeCreateStreamInfo(): CreateStreamInfo {
    const moveCalls = this.createStreamTransactions();
    const infos = moveCalls.map((moveCall) => this.getCreationInfoFromMoveCall(moveCall));
    return this.aggregateGroupStreamInfo(infos);
  }

  private createStreamTransactions(): MoveCallHelper[] {
    const txs = this.commands.filter(
      (command) =>
        command.$kind === 'MoveCall' && isSameTarget(getMoveCallTarget(command)!, this.contract.createStreamTarget),
    );
    if (txs.length === 0) {
      throw new SanityError('No create stream transactions');
    }
    return txs.map((tx) => new MoveCallHelper(tx, this.txb));
  }

  private getCreationInfoFromMoveCall(moveCall: MoveCallHelper): SingleStreamCreationInfo {
    const metadata = moveCall.decodeInputString(4);
    const { name, groupId } = decodeMetadata(metadata);

    const recipient = moveCall.decodeInputAddress(5);
    const timeStart = moveCall.decodeInputU64(6);
    const cliff = moveCall.decodeInputU64(7);
    const epochInterval = moveCall.decodeInputU64(8);
    const totalEpoch = moveCall.decodeInputU64(9);
    const amountPerEpoch = moveCall.decodeInputU64(10);
    const cancelable = moveCall.decodeInputBool(11);
    const coinType = moveCall.typeArg(0);

    return {
      name,
      groupId,
      recipient,
      timeStart,
      cliff,
      epochInterval,
      totalEpoch,
      amountPerEpoch,
      cancelable,
      coinType,
    };
  }

  private aggregateGroupStreamInfo(infos: SingleStreamCreationInfo[]): CreateStreamInfo {
    const commonInfoSet = new Set(
      infos.map((info) =>
        JSON.stringify({
          name: info.name,
          groupId: info.groupId,
          timeStart: String(info.timeStart),
          epochInterval: String(info.epochInterval),
          totalEpoch: String(info.totalEpoch),
          cancelable: info.cancelable,
          coinType: info.coinType,
        }),
      ),
    );
    if (commonInfoSet.size !== 1) {
      throw new InvalidInputError('Stream group not have common info');
    }
    const recipients: RecipientWithAmount[] = infos.map((info) => ({
      address: info.recipient,
      amountPerStep: info.amountPerEpoch,
      cliffAmount: info.cliff,
    }));
    return {
      name: infos[0].name,
      coinType: infos[0].coinType,
      recipients,
      interval: infos[0].epochInterval,
      steps: infos[0].totalEpoch,
      startTimeMs: infos[0].timeStart,
      cancelable: infos[0].cancelable,
    };
  }

  private get commands() {
    return this.txb.getData().commands;
  }

  private get contract() {
    return new StreamContract(this.globals.envConfig.contract, this.globals);
  }

  private get feeContract() {
    return new FeeContract(this.globals.envConfig.contract, this.globals);
  }

  private createStreamHelper() {
    return new CreateStreamHelper(this.globals, this.feeContract, this.contract);
  }
}

interface SingleStreamCreationInfo {
  name: string;
  groupId: string;
  recipient: string;
  timeStart: bigint;
  cliff: bigint;
  epochInterval: bigint;
  totalEpoch: bigint;
  amountPerEpoch: bigint;
  cancelable: boolean;
  coinType: string;
}
