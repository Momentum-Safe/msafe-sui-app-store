import { SuiObjectResponse } from '@mysten/sui.js/client';
import { normalizeStructTag, normalizeSuiAddress } from '@mysten/sui.js/utils';
import { DateTime } from 'luxon';

import { Stream } from './Stream';
import { StreamGroup } from './StreamGroup';
import { Globals } from '../common';
import { InvalidInputError } from '../error/InvalidInputError';
import { SanityError } from '../error/SanityError';
import { SuiIterator } from '../sui/iterator/iterator';
import { ObjectBatchIterator, ListOidIterator } from '../sui/iterator/object';
import {
  StreamRef,
  BackendIncomingStreamFilterOptions,
  BackendOutgoingStreamFilterOptions,
  StreamFilterStatus,
} from '../types/backend';
import { IPagedStreamListIterator, IncomingStreamQuery, OutgoingStreamQuery } from '../types/client';
import { IStream, IStreamGroup, StreamStatus } from '../types/stream';

export class PagedStreamListIterator implements IPagedStreamListIterator {
  private constructor(
    public readonly it: StreamListIterator,
    public readonly pageSize: number,
  ) {}

  static async newIncoming(input: {
    globals: Globals;
    query?: IncomingStreamQuery;
    pageSize: number;
  }): Promise<PagedStreamListIterator> {
    const it = await StreamListIterator.newIncoming(input);
    return new PagedStreamListIterator(it, input.pageSize);
  }

  static async newOutgoing(input: {
    globals: Globals;
    query?: OutgoingStreamQuery;
    pageSize: number;
  }): Promise<PagedStreamListIterator> {
    const it = await StreamListIterator.newOutgoing(input);
    return new PagedStreamListIterator(it, input.pageSize);
  }

  async hasNext() {
    return this.it.hasNext();
  }

  async next(): Promise<(IStream | IStreamGroup)[]> {
    const res: (IStream | IStreamGroup)[] = [];
    while (res.length < this.pageSize && (await this.it.hasNext())) {
      res.push(await this.it.next());
    }
    return res;
  }
}

export class StreamListIterator implements SuiIterator<IStream | IStreamGroup> {
  cachedNext: IStream | IStreamGroup | undefined | null;

  private constructor(private readonly requester: StreamListRequester) {}

  static async newIncoming(input: { globals: Globals; query?: IncomingStreamQuery }) {
    const requester = await StreamListRequester.newIncomingQuery(input);
    return new StreamListIterator(requester);
  }

  static async newOutgoing(input: { globals: Globals; query?: OutgoingStreamQuery }) {
    const requester = await StreamListRequester.newOutgoingQuery(input);
    return new StreamListIterator(requester);
  }

  async hasNext(): Promise<boolean> {
    if (this.cachedNext === undefined) {
      this.cachedNext = await this.requester.doNextRequest();
    }
    return this.cachedNext !== null;
  }

  async next(): Promise<IStream | IStreamGroup> {
    if (this.cachedNext === undefined) {
      const res = await this.requester.doNextRequest();
      if (res === null) {
        throw new SanityError('No more results');
      }
      return res;
    }
    const res = this.cachedNext;
    this.cachedNext = undefined;
    if (res === null) {
      throw new SanityError('No more results');
    }
    return res as IStream | IStreamGroup;
  }
}

export class StreamListRequester {
  public current = 0;

  public objectIter: ObjectBatchIterator;

  private constructor(
    public readonly globals: Globals,
    public readonly recipient: string,
    public readonly groupRefs: StreamRef[][],
    public readonly query?: IncomingStreamQuery | OutgoingStreamQuery,
  ) {
    this.current = 0;
    const oidIter = new ListOidIterator(groupRefs.flat().map((ref) => ref.streamId));
    this.objectIter = new ObjectBatchIterator(globals.suiClient, oidIter);
  }

  static async newIncomingQuery(input: { globals: Globals; query?: IncomingStreamQuery }) {
    const backendQuery = convertToIncomingBackendQuery(input.query);
    const recipient = await input.globals.walletAddress();
    const refs = await input.globals.backend.getIncomingStreams(recipient, backendQuery);
    const filtered = refs.filter((ref: any) => normalizeSuiAddress(ref.recipient) === normalizeSuiAddress(recipient));
    const groupedRefs = groupAndSortRefs(filtered);

    return new StreamListRequester(input.globals, recipient, groupedRefs, input.query);
  }

  static async newOutgoingQuery(input: { globals: Globals; query?: OutgoingStreamQuery }) {
    const backendQuery = convertToOutgoingBackendQuery(input.query);
    const sender = await input.globals.walletAddress();
    const refs = await input.globals.backend.getOutgoingStreams(sender, backendQuery);
    const groupedRefs = groupAndSortRefs(refs);
    return new StreamListRequester(input.globals, sender, groupedRefs, input.query);
  }

  async doNextRequest(): Promise<IStream | IStreamGroup | null> {
    if (this.current >= this.groupRefs.length) {
      return null;
    }
    const stRefs = this.groupRefs[this.current];
    if (stRefs.length === 1) {
      const stream = await getStreamFromIterator(this.globals, stRefs[0].streamId, this.objectIter);
      this.current++;
      return isStreamOfQuery(stream, this.query) ? stream : this.doNextRequest();
    }
    if (stRefs.length > 1) {
      const sg = await getStreamGroupFromIterator(
        this.globals,
        stRefs.map((ref) => ref.streamId),
        this.objectIter,
      );
      this.current++;
      return isStreamGroupOfQuery(sg, this.query) ? sg : this.doNextRequest();
    }
    throw new SanityError('Stream group with no stream');
  }
}

export function groupAndSortRefs(refs: StreamRef[]) {
  const m = new Map<string, StreamRef[]>();
  refs.forEach((ref) => {
    const groupList = m.get(ref.groupId);
    if (groupList) {
      groupList.push(ref);
      m.set(ref.groupId, groupList);
    } else {
      m.set(ref.groupId, [ref]);
    }
  });
  return Array.from(m.values()).sort(
    (gl1, gl2) => DateTime.fromISO(gl2[0].createDate).toMillis() - DateTime.fromISO(gl1[0].createDate).toMillis(),
  );
}

function isStreamOfQuery(stream: IStream, query: IncomingStreamQuery | OutgoingStreamQuery | undefined) {
  if (query === undefined) {
    return true;
  }
  const isStatus = isStreamOfStatus(stream, query.status);
  if (query && 'claimable' in query && query.claimable !== undefined) {
    const isClaimable = query.claimable ? stream.progress.claimable !== 0n : stream.progress.claimable === 0n;
    return isStatus && isClaimable;
  }
  return isStatus;
}

function isStreamOfStatus(stream: IStream, filter: StreamStatus | StreamStatus[] | undefined): boolean {
  if (filter === undefined) {
    return true;
  }
  if (!Array.isArray(filter)) {
    return stream.progress.status === filter;
  }
  return filter.includes(stream.progress.status);
}

function isStreamGroupOfQuery(sg: IStreamGroup, query: IncomingStreamQuery | OutgoingStreamQuery | undefined): boolean {
  if (!query) {
    return true;
  }
  let isStatus = false;
  sg.streams.forEach((stream) => {
    if (isStreamOfQuery(stream, query)) {
      isStatus = true;
    }
  });
  return isStatus;
}

async function getStreamFromIterator(globals: Globals, streamId: string, it: ObjectBatchIterator) {
  const data = await getStreamObjectResponseFromIter(it, streamId);
  return Stream.fromObjectData(globals, streamId, data);
}

async function getStreamGroupFromIterator(globals: Globals, streamIds: string[], it: ObjectBatchIterator) {
  const objResponses: SuiObjectResponse[] = [];
  while (objResponses.length < streamIds.length) {
    const data = await getStreamObjectResponseFromIter(it, streamIds[objResponses.length]);
    objResponses.push(data);
  }
  return StreamGroup.newFromObjectResponse(globals, streamIds, objResponses);
}

async function getStreamObjectResponseFromIter(it: ObjectBatchIterator, streamId: string) {
  if (!(await it.hasNext())) {
    throw new SanityError('object iterator has been consumed');
  }
  const data = await it.next();
  if (!data || data.error || data.data === undefined || data.data === null) {
    throw new SanityError(`object iterator undefined response`, {
      cause: data?.error,
    });
  }
  if (data?.data?.objectId !== streamId) {
    throw new SanityError('stream id not aligned');
  }
  return data;
}

// Convert IncomingStreamQuery to BackendIncomingStreamFilterOptions
function convertToIncomingBackendQuery(query?: IncomingStreamQuery): BackendIncomingStreamFilterOptions {
  return {
    status: convertStreamStatus(query?.status),
    coinType: normalizeCoinTypeFilter(query?.coinType),
    sender: normalizeAddressFilter(query?.sender),
  };
}

function convertToOutgoingBackendQuery(query?: OutgoingStreamQuery): BackendOutgoingStreamFilterOptions {
  return {
    status: convertStreamStatus(query?.status),
    coinType: normalizeCoinTypeFilter(query?.coinType),
    recipient: normalizeAddressFilter(query?.recipient),
  };
}

export function convertStreamStatus(status: undefined | StreamStatus | StreamStatus[]): StreamFilterStatus {
  if (status === undefined || status.length === 0) {
    return 'all';
  }
  if (!Array.isArray(status)) {
    return convertStreamStatusSingle(status);
  }
  return status.reduce((res: StreamFilterStatus | undefined, st) => {
    const sts = convertStreamStatus(st);
    if (!res) {
      return sts;
    }
    if (res === sts) {
      return sts;
    }
    return 'all';
  }, undefined) as StreamFilterStatus;
}

function convertStreamStatusSingle(status: StreamStatus): StreamFilterStatus {
  switch (status) {
    case 'STREAMING':
    case 'STREAMED':
    case 'CANCELED':
      return 'active';
    case 'COMPLETED':
    case 'SETTLED':
      return 'inactive';
    default:
      throw new InvalidInputError('Unknown stream filtered status');
  }
}

function normalizeCoinTypeFilter(coinType: string | string[] | undefined) {
  if (!coinType) {
    return undefined;
  }
  if (!Array.isArray(coinType)) {
    return normalizeStructTag(coinType);
  }
  return coinType.length !== 0 ? coinType.map((ct) => normalizeStructTag(ct)) : undefined;
}

function normalizeAddressFilter(address: string | string[] | undefined) {
  if (!address) {
    return undefined;
  }
  if (!Array.isArray(address)) {
    return normalizeSuiAddress(address);
  }
  return address.length !== 0 ? address.map((addr) => normalizeSuiAddress(addr)) : undefined;
}
