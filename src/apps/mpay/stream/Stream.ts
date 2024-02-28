import { SuiObjectData, SuiObjectResponse, SuiParsedData } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { normalizeStructTag, parseStructTag } from '@mysten/sui.js/utils';
import { DateTime, Duration } from 'luxon';

import { decodeMetadata } from './metadata';
import { Globals } from '../common';
import { StreamContract } from '../contract/StreamContract';
import { NotCreatorError } from '../error/NotCreatorError';
import { NotRecipientError } from '../error/NotRecipientError';
import { RpcError } from '../error/RpcError';
import { SanityError } from '../error/SanityError';
import { StreamNotFoundError } from '../error/StreamNotFoundError';
import { RawStreamData, RawStreamStatusEnum } from '../types/data';
import { StreamEvent } from '../types/events';
import { PaginationOptions, Paginated } from '../types/pagination';
import { IStream, StreamInfo, StreamGroupCommonInfo, StreamProgress, StreamStatus } from '../types/stream';
import { MAX_U64, roundDateTime, roundDuration } from '../utils/utils';

export class Stream implements IStream {
  private readonly streamContract: StreamContract;

  public readonly type = 'Stream';

  constructor(
    public readonly globals: Globals,
    public readonly streamId: string,
    public rawData: RawStreamData,
  ) {
    this.streamContract = new StreamContract(globals.envConfig.contract, globals);
  }

  static async new(globals: Globals, streamId: string) {
    const rawData = await Stream.fetchStreamData(globals, streamId);
    return new Stream(globals, streamId, rawData);
  }

  static fromObjectData(globals: Globals, streamId: string, data: SuiObjectResponse) {
    const rawData = Stream.parseRawStreamData(streamId, data);
    return new Stream(globals, streamId, rawData);
  }

  get info(): StreamInfo {
    return {
      name: this.name,
      creator: this.creator,
      coinType: this.coinType,
      totalAmount: this.totalAmount,
      start: this.timeStart,
      end: this.timeEnd,
      cancelable: this.cancelable,
      cliffAmount: this.cliff,
      duration: this.duration,
      interval: this.interval,
      steps: this.totalSteps,
      nextReleaseDate: this.nextReleaseDate,
      nextReleaseAmount: this.nextReleaseAmount,

      groupId: this.groupId,
      streamId: this.streamId,
      recipient: this.recipient,
      progress: this.progress,
      autoClaim: this.autoClaim,
    };
  }

  get groupCommonInfo(): StreamGroupCommonInfo {
    return {
      name: this.name,
      groupId: this.groupId,
      creator: this.creator,
      start: this.timeStart,
      interval: this.interval,
      steps: this.totalSteps,
      cancelable: this.cancelable,
    };
  }

  async refresh() {
    this.rawData = await Stream.fetchStreamData(this.globals, this.streamId);
  }

  refreshWithData(data: SuiObjectResponse) {
    if (data.data?.objectId !== this.streamId) {
      throw new SanityError('Object Id does not align');
    }
    this.rawData = Stream.parseRawStreamData(this.streamId, data);
  }

  async historyEvents(pagination?: PaginationOptions): Promise<Paginated<StreamEvent>> {
    return this.globals.backend.getStreamHistory({
      streamId: this.streamId,
      pagination,
    });
  }

  async cancel() {
    if ((await this.globals.walletAddress()) !== this.creator) {
      throw new NotCreatorError();
    }
    const txb = new TransactionBlock();
    this.streamContract.cancelStream(txb, {
      streamId: this.streamId,
      coinType: this.coinType,
    });
    return txb;
  }

  async claim() {
    if ((await this.globals.walletAddress()) !== this.recipient) {
      throw new NotRecipientError();
    }
    const txb = new TransactionBlock();
    this.streamContract.claimStream(txb, {
      streamId: this.streamId,
      coinType: this.coinType,
    });
    return txb;
  }

  async setAutoClaim(enabled: boolean) {
    if ((await this.globals.walletAddress()) !== this.recipient) {
      throw new NotRecipientError();
    }
    const txb = new TransactionBlock();
    this.streamContract.setAutoClaim(txb, {
      streamId: this.streamId,
      coinType: this.coinType,
      enabled,
    });
    return txb;
  }

  async claimByProxy() {
    const txb = new TransactionBlock();
    this.streamContract.claimStreamByProxy(txb, {
      streamId: this.streamId,
      coinType: this.coinType,
    });
    return txb;
  }

  get wallet() {
    return this.globals.wallet;
  }

  get client() {
    return this.globals.suiClient;
  }

  get coinType() {
    return normalizeStructTag(this.rawData.coinType);
  }

  get progress(): StreamProgress {
    return {
      status: this.streamStatus,
      total: this.totalAmount,
      streamed: this.streamedAmount,
      claimed: this.claimedAmount,
      claimable: this.claimable,
      canceled: this.canceledAmount,
    };
  }

  get balance() {
    return this.rawData.balance;
  }

  get autoClaim() {
    return this.rawData.autoClaim;
  }

  get amountPerEpoch() {
    return this.rawData.config.amountPerEpoch;
  }

  get cancelable() {
    return this.rawData.config.cancelable;
  }

  get cliff() {
    return this.rawData.config.cliff;
  }

  get creator() {
    return this.rawData.config.creator;
  }

  get interval(): Duration {
    return roundDuration(this.rawData.config.epochInterval);
  }

  get groupId() {
    const { metadata } = this.rawData.config;
    const md = decodeMetadata(metadata);
    return md.groupId;
  }

  get name() {
    const { metadata } = this.rawData.config;
    const md = decodeMetadata(metadata);
    return md.name;
  }

  get recipient() {
    return this.rawData.config.recipient;
  }

  get timeStart(): DateTime {
    return roundDateTime(this.rawData.config.timeStart);
  }

  get duration(): Duration {
    const rawConfig = this.rawData.config;
    const duration = rawConfig.epochInterval * rawConfig.totalEpoch;
    return roundDuration(duration);
  }

  get timeEnd(): DateTime {
    return this.timeStart.plus(this.duration);
  }

  get totalSteps(): bigint {
    return this.rawData.config.totalEpoch;
  }

  get claimable(): bigint {
    return this.streamedAmount - this.claimedAmount;
  }

  get nextReleaseDate(): DateTime | null {
    if (this.currentEpoch === -1n) {
      return this.timeStart;
    }
    if (this.currentEpoch >= this.totalSteps || this.isCanceled) {
      return null;
    }
    return roundDateTime((this.currentEpoch + 1n) * this.rawData.config.epochInterval + this.rawData.config.timeStart);
  }

  get nextReleaseAmount(): bigint | null {
    if (this.currentEpoch === -1n) {
      return this.cliff;
    }
    if (this.currentEpoch >= this.totalSteps || this.isCanceled) {
      return null;
    }
    return this.amountPerEpoch;
  }

  get streamStatus(): StreamStatus {
    const rawStatus = this.rawData.status.status;
    if (rawStatus === RawStreamStatusEnum.CANCELED) {
      return StreamStatus.CANCELED;
    }
    if (rawStatus === RawStreamStatusEnum.CANCELED_COMPLETED) {
      return StreamStatus.SETTLED;
    }
    if (rawStatus === RawStreamStatusEnum.COMPLETED) {
      return StreamStatus.COMPLETED;
    }
    if (this.currentEpoch >= this.totalSteps) {
      return StreamStatus.STREAMED;
    }
    return StreamStatus.STREAMING;
  }

  get streamedAmount() {
    if (this.currentEpoch === -1n) {
      return 0n;
    }
    if (this.isCanceled) {
      return this.rawData.status.epochCanceled * this.amountPerEpoch + this.cliff;
    }
    return this.currentEpoch * this.amountPerEpoch + this.cliff;
  }

  get claimedAmount() {
    if (this.rawData.status.epochClaimed === MAX_U64) {
      return 0n;
    }
    return this.rawData.status.epochClaimed * this.amountPerEpoch + this.cliff;
  }

  get currentEpoch() {
    const timeNowMs = DateTime.now().toMillis();
    const timeStartMs = this.timeStart.toMillis();
    if (timeNowMs < timeStartMs) {
      return -1n;
    }
    const epoch = Math.floor((timeNowMs - timeStartMs) / Number(this.rawData.config.epochInterval));
    return BigInt(epoch) > Number(this.rawData.config.totalEpoch) ? this.rawData.config.totalEpoch : BigInt(epoch);
  }

  get totalAmount() {
    const rawConfig = this.rawData.config;
    return rawConfig.amountPerEpoch * rawConfig.totalEpoch + rawConfig.cliff;
  }

  get isCanceled() {
    const rawStatus = this.rawData.status.status;
    return rawStatus === RawStreamStatusEnum.CANCELED || rawStatus === RawStreamStatusEnum.CANCELED_COMPLETED;
  }

  get canceledAmount() {
    return this.isCanceled ? this.totalAmount - this.streamedAmount : 0n;
  }

  private static async fetchStreamData(globals: Globals, streamId: string) {
    const res = await globals.suiClient.getObject({
      id: streamId,
      options: {
        showContent: true,
        showType: true,
      },
    });
    return Stream.parseRawStreamData(streamId, res);
  }

  static parseRawStreamData(streamId: string, res: SuiObjectResponse): RawStreamData {
    if (res.error) {
      if (res.error.code === 'notExists') {
        throw new StreamNotFoundError(streamId);
      }
      throw new RpcError(`get stream data: ${res.error.code}`, {
        streamId,
        ...res.error,
      });
    }
    const content = (res.data as SuiObjectData).content as SuiParsedData;
    if (content.dataType !== 'moveObject') {
      throw new RpcError('Unexpected object type', {
        gotType: content.dataType,
      });
    }
    const { typeParams } = parseStructTag(content.type);
    const coinType = normalizeStructTag(typeParams[0]);

    const dataFields = content.fields as any;
    const config = dataFields.config.fields as any;
    const status = dataFields.status.fields as any;

    return {
      coinType,
      autoClaim: dataFields.auto_claim as boolean,
      balance: BigInt(dataFields.balance.fields.balance),
      config: {
        amountPerEpoch: BigInt(config.amount_per_epoch),
        cancelable: config.cancelable,
        cliff: BigInt(config.cliff),
        creator: config.creator,
        epochInterval: BigInt(config.epoch_interval),
        metadata: config.metadata,
        recipient: config.recipient,
        timeStart: BigInt(config.time_start),
        totalEpoch: BigInt(config.total_epoch),
      },
      status: {
        status: status.status as RawStreamStatusEnum,
        epochCanceled: BigInt(status.epoch_canceled),
        epochClaimed: BigInt(status.epoch_claimed),
      },
    };
  }
}
