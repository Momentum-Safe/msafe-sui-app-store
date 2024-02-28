/// StreamRef is the simplified stream info.
/// Full stream info shall be obtained from chain data. StreamRef is a brief for immutable stream

import { StreamEvent } from './events';
import { PaginationOptions, Paginated } from './pagination';

/// config info.
export interface StreamRef {
  groupId: string;
  streamId: string;
  sender: string;
  recipient: string;
  coinType: string;
  createDate: string;
}

/// IBackend interface for supporting Stream registry query and history events.
export interface IBackend {
  getIncomingStreams(recipient: string, options?: BackendIncomingStreamFilterOptions): Promise<StreamRef[]>;
  getOutgoingStreams(sender: string, options?: BackendOutgoingStreamFilterOptions): Promise<StreamRef[]>;
  getAllCoinTypes(address: string): Promise<string[]>;
  getAllRecipients(sender: string, options?: StreamFilterStatus): Promise<string[]>;
  getAllSenders(recipient: string, options?: StreamFilterStatus): Promise<string[]>;

  getStreamHistory(query: {
    streamId?: string;
    groupId?: string;
    pagination?: PaginationOptions;
  }): Promise<Paginated<StreamEvent>>;
}

//   streaming: !canceled && streamed != 100
//   streamed: !canceled && streamed === 100 && claimable !== 0
//   canceled: canceled && claimable !== 0

//   completed: !canceled && streamed === 100 && claimable === 0
//   settled: canceled && claimable === 0

// StreamFilterStatus only applies for active / inactive status.
// SDK will do the filtering for streams.
// active - 'streamed', 'canceled', 'streaming' - RawStatus.status === OPEN | CANCELED
// inactive - 'settled', 'completed' === COMPLETED | CANCELED_COMPLETED
export type StreamFilterStatus = 'active' | 'inactive' | 'all';

/// BackendIncomingStreamFilterOptions Options for querying Incoming StreamRefs from backend.
/// Note that the pagination is currently not supported since the stream number
/// to displayed on frontend requires more complicated computation.
/// Shall add later.
export interface BackendIncomingStreamFilterOptions {
  status?: StreamFilterStatus;

  // One or more coin types
  coinType?: string | string[];

  sender?: string | string[];
}

/// BackedOutgoingStreamFilterOptions Options for querying Outgoing StreamRefs from backend.
export interface BackendOutgoingStreamFilterOptions {
  status?: StreamFilterStatus;

  coinType?: string | string[];

  recipient?: string | string[];
}
