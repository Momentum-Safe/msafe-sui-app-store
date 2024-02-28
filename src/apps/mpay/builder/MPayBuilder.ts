import { TransactionBlock } from '@mysten/sui.js/transactions';

import { CreateStreamHelper } from './CreateStreamHelper';
import { Globals } from '../common';
import { FeeContract } from '../contract/FeeContract';
import { StreamContract } from '../contract/StreamContract';
import { CreateStreamInfo } from '../types/client';

// TODO: add vault and admin control related code.
export class MPayBuilder {
  private readonly feeContract: FeeContract;

  private readonly streamContract: StreamContract;

  constructor(public readonly globals: Globals) {
    const config = globals.envConfig.contract;
    this.feeContract = new FeeContract(config, globals);
    this.streamContract = new StreamContract(config, globals);
  }

  async createStreams(info: CreateStreamInfo) {
    const infoInternal = CreateStreamHelper.convertCreateStreamInfoToInternal(info);
    return this.createStreamHelper().buildCreateStreamTransactionBlock(infoInternal);
  }

  createStreamHelper() {
    return new CreateStreamHelper(this.globals, this.feeContract, this.streamContract);
  }

  setAutoClaim(streamId: string, enabled: boolean, coinType: string) {
    const txb = new TransactionBlock();
    return this.streamContract.setAutoClaim(txb, {
      streamId,
      enabled,
      coinType,
    });
  }

  claimStream(streamId: string, coinType: string) {
    const txb = new TransactionBlock();
    return this.streamContract.claimStream(txb, {
      streamId,
      coinType,
    });
  }

  claimStreamByProxy(streamId: string, coinType: string) {
    const txb = new TransactionBlock();
    return this.streamContract.claimStreamByProxy(txb, {
      streamId,
      coinType,
    });
  }

  cancelStream(streamId: string, coinType: string) {
    const txb = new TransactionBlock();
    this.streamContract.cancelStream(txb, {
      streamId,
      coinType,
    });
    return txb;
  }
}
