// This file is only for SDK internal use. Do no export this file.

export enum RawStreamStatusEnum {
  OPEN = 0,
  COMPLETED = 1,
  CANCELED = 16,
  CANCELED_COMPLETED = 17,
}

export type RawStreamData = {
  coinType: string;
  balance: bigint;
  autoClaim: boolean;
  config: RawStreamConfig;
  status: RawStreamStatus;
};

/// StreamConfig is the configuration of a streaming payment
/// It is immutable once created
export interface RawStreamConfig {
  amountPerEpoch: bigint;
  cancelable: boolean;
  cliff: bigint;
  creator: string;
  epochInterval: bigint;
  metadata: string;
  recipient: string;
  timeStart: bigint;
  totalEpoch: bigint;
}

/// StreamStatus is the status of a streaming payment
/// It will be updated when the stream is canceled or claimed
export interface RawStreamStatus {
  status: RawStreamStatusEnum;
  // number of epoch that receiver has claimed
  epochClaimed: bigint;
  // number of epoch happened before stream is canceled
  epochCanceled: bigint;
}
