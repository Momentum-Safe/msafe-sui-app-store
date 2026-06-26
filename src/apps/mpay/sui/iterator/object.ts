import type { MsafeSuiGrpcClient } from '@/lib/suiGrpcClient';

import { SuiIterator, getAllFromIterator, EntryIterator } from './iterator';
import { Requester, PagedData } from './requester';
import { MpayObjectResponse, mpayMultiGetObjects } from '../../utils/rpc';

export type ObjectFilter = (objRes: MpayObjectResponse) => boolean;

export const REQUEST_PAGE_SIZE = 25;

export type ObjectDataOptions = {
  showType?: boolean;
  showContent?: boolean;
};

// OidIter is the iterator to give the list of object ids
export type OidIter = SuiIterator<string>;
export interface BatchObjectOptions {
  filter?: ObjectFilter;
  pageSize?: number;
  objectOptions?: ObjectDataOptions;
}

// getObjectsById get the list of objects by id.
// Compared with the multiGetObject method defined by SUI, this method will do the pagination
// for get object requests.
export async function getObjectsById(
  suiClient: MsafeSuiGrpcClient,
  ids: string[],
  options?: BatchObjectOptions,
): Promise<(MpayObjectResponse | undefined)[]> {
  const oidIter = new ListOidIterator(ids);
  const iter = new ObjectBatchIterator(suiClient, oidIter, options);
  return (await getAllFromIterator(iter)) as MpayObjectResponse[];
}

// ListOidIterator is the iterator that iterate through a list of ids.
// This iterator shall be used when the number requested objects is big
// which is inappropriate to fit the requested objects into a single
// request.
export class ListOidIterator implements OidIter {
  cursor: number;

  constructor(public readonly ids: string[]) {
    this.cursor = -1;
  }

  async hasNext(): Promise<boolean> {
    return this.cursor < this.ids.length - 1;
  }

  async next(): Promise<string> {
    this.cursor += 1;
    if (this.cursor >= this.ids.length) {
      throw new Error('invalid iterator implementation'); // Shall be unreachable
    }
    return this.ids[this.cursor];
  }
}

export class ObjectBatchIterator extends EntryIterator<MpayObjectResponse> {
  constructor(
    public readonly suiClient: MsafeSuiGrpcClient,
    public readonly idIter: OidIter,
    public readonly options?: BatchObjectOptions,
  ) {
    super(new ObjectBatchRequester(suiClient, idIter, options));
  }
}

// TODO: Unit test this class
export class ObjectBatchRequester implements Requester<MpayObjectResponse> {
  filter: ObjectFilter | undefined;

  pageSize: number;

  objectOptions: ObjectDataOptions;

  constructor(
    public readonly suiClient: MsafeSuiGrpcClient,
    public readonly stringIter: OidIter,
    public options?: BatchObjectOptions,
  ) {
    this.filter = options?.filter;
    this.pageSize = options?.pageSize || REQUEST_PAGE_SIZE;
    this.objectOptions = options?.objectOptions || {
      showType: true,
      showContent: true,
    };
  }

  async doNextRequest(): Promise<PagedData<MpayObjectResponse>> {
    const requestPage: string[] = [];
    while (requestPage.length < this.pageSize) {
      const hasNext = await this.stringIter.hasNext();
      if (!hasNext) {
        break;
      }
      const objId = await this.stringIter.next();
      if (objId) {
        requestPage.push(objId);
      }
    }
    const res = await mpayMultiGetObjects(this.suiClient, requestPage);
    let filtered: MpayObjectResponse[];
    if (this.filter) {
      const { filter } = this;
      filtered = res.filter((r): r is MpayObjectResponse => !!r && filter(r));
    } else {
      filtered = res.filter((r): r is MpayObjectResponse => !!r);
    }
    return {
      data: filtered,
      hasNext: await this.stringIter.hasNext(),
    };
  }
}
