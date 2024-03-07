import { CreateStreamInfo, PaymentWithFee } from './client';

export type StreamDecodedTransaction =
  | DecodedCreateStream
  | DecodedSetAutoClaim
  | DecodedClaimStream
  | DecodedCancelStream
  | DecodedClaimByProxy
  | undefined;

export enum StreamTransactionType {
  CREATE_STREAM = 'CreateStream',
  SET_AUTO_CLAIM = 'SetAutoClaim',
  CLAIM = 'Claim',
  CLAIM_BY_PROXY = 'ClaimByProxy',
  CANCEL = 'Cancel',
}

export interface DecodedCreateStream {
  type: StreamTransactionType.CREATE_STREAM;

  info: CreateStreamInfo;
  fees: PaymentWithFee;
}

export interface CoinMerge {
  coinType: string;
  primary: string | 'GAS';
  merged?: string[];
}

export interface DecodedSetAutoClaim {
  type: StreamTransactionType.SET_AUTO_CLAIM;

  streamId: string;
  enabled: boolean;
}

export interface DecodedClaimStream {
  type: StreamTransactionType.CLAIM;

  streamId: string;
}

export interface DecodedClaimByProxy {
  type: StreamTransactionType.CLAIM_BY_PROXY;

  streamId: string;
}

export interface DecodedCancelStream {
  type: StreamTransactionType.CANCEL;

  streamId: string;
}
