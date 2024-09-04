import { CoinBalance, CoinMetadata, SuiTransactionBlockResponse, DevInspectResults } from '@mysten/sui.js/client';
import { Transaction } from '@mysten/sui/transactions';
import { DateTime, Duration } from 'luxon';

import { StreamFilterStatus } from './backend';
import { IStream, IStreamGroup, StreamStatus } from './stream';
import { IMSafeAccount, ISingleWallet } from './wallet';
import { SuiIterator } from '../sui/iterator/iterator';

export interface IMPayClient {
  helper: IMPayHelper;

  connectSingleWallet(wallet: ISingleWallet): void;
  connectMSafeAccount(msafe: IMSafeAccount): void;

  getStream(streamId: string): Promise<IStream>;
  getIncomingStreams(query?: IncomingStreamQuery, pageSize?: number): Promise<IPagedStreamListIterator>;
  getOutgoingStreams(query?: OutgoingStreamQuery, pageSize?: number): Promise<IPagedStreamListIterator>;
  getCoinTypesForStreamFilter(): Promise<string[]>;
  getRecipientsForStreamFilter(options?: StreamFilterStatus): Promise<string[]>;
  getCreatorsForStreamFilter(options?: StreamFilterStatus): Promise<string[]>;

  createStream(info: CreateStreamInfo): Promise<Transaction>;
}

export interface PaymentWithFee {
  totalAmount: bigint;
  streamFeeAmount: bigint;
  flatFeeAmount: bigint;
}

export interface MPayFees {
  createFeePercent: Fraction;
  claimFeePercent: Fraction;
  flatFeePerStream: bigint;
}

export interface IMPayHelper {
  getBalance(address: string, coinType?: string | null): Promise<CoinBalanceWithMeta>;
  getAllBalance(address: string): Promise<CoinBalanceWithMeta[]>;
  getCoinMeta(coinType: string): Promise<CoinMetadata | undefined>;

  getStreamIdsFromCreateStreamResponse(res: SuiTransactionBlockResponse): string[];
  calculateCreateStreamFees(info: CreateStreamInfo): PaymentWithFee;
  feeParams(): MPayFees;
  calculateStreamAmount(input: { totalAmount: bigint; steps: bigint; cliff?: Fraction }): CalculatedStreamAmount;
  calculateTimelineByInterval(input: { timeStart: DateTime; interval: Duration; steps: bigint }): CalculatedTimeline;
  calculateTimelineByTotalDuration(input: { timeStart: DateTime; total: Duration; steps: bigint }): CalculatedTimeline;
  simulateTransactionBlock(txb: Transaction): Promise<DevInspectResults>;
}

export type IPagedStreamListIterator = SuiIterator<(IStream | IStreamGroup)[]>;

export interface IncomingStreamQuery {
  status?: StreamStatus | StreamStatus[];
  sender?: string | string[];
  coinType?: string | string[];
  claimable?: boolean;
}

export interface OutgoingStreamQuery {
  status?: StreamStatus | StreamStatus[];
  recipient?: string | string[];
  coinType?: string | string[];
}

export interface CreateStreamInfo {
  name: string;
  coinType: string;
  recipients: RecipientWithAmount[];
  interval: bigint; // Interval in milliseconds
  steps: bigint;
  startTimeMs: bigint;
  cancelable: boolean;
}

export interface RecipientWithAmount {
  address: string;
  amountPerStep: bigint;
  cliffAmount: bigint;
}

export interface CreateStreamInfoInternal {
  metadata: string;
  coinType: string;
  recipients: RecipientInfoInternal[];
  epochInterval: bigint;
  numberEpoch: bigint;
  startTime: bigint;
  cancelable: boolean;
}

export interface RecipientInfoInternal {
  address: string;
  cliffAmount: bigint;
  amountPerEpoch: bigint;
}

export interface CalculatedStreamAmount {
  realTotalAmount: bigint;
  cliffAmount: bigint;
  amountPerStep: bigint;
}

export interface CalculatedTimeline {
  timeStart: DateTime;
  timeEnd: DateTime;
  interval: Duration;
  steps: bigint;
}

export interface Fraction {
  numerator: bigint;
  denominator: bigint;
}

export type CoinBalanceWithMeta = CoinBalance & {
  coinMeta: CoinMetadata | undefined;
};
