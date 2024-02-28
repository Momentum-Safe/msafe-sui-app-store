import { PagedData, Requester } from './requester';

export const REQUEST_PAGE_SIZE = 25;

export interface SuiIterator<T> {
  next: () => Promise<T | undefined>;
  hasNext: () => Promise<boolean>;
}

export async function getAllFromIterator<T>(it: SuiIterator<T>): Promise<(T | undefined) | (T | undefined)[]> {
  const res: (T | undefined)[] = [];
  while (await it.hasNext()) {
    const val = await it.next();
    res.push(val);
  }
  if (res && Array.isArray(res[0])) {
    return res.flat(1) as T;
  }
  return res;
}

export class PagedIterator<T> implements SuiIterator<(T | undefined)[]> {
  private curPage: PagedData<T> | undefined;

  private init: boolean;

  constructor(public readonly requester: Requester<T>) {
    this.curPage = undefined;
    this.init = true;
  }

  async hasNext(): Promise<boolean> {
    if (this.init) {
      if (!this.curPage) {
        this.curPage = await this.requester.doNextRequest();
      }
      return !!this.curPage.data?.length || this.curPage.hasNext;
    }
    if (!this.curPage) {
      throw new Error('invalid implementation of iterator');
    }
    return this.curPage.hasNext;
  }

  async next(): Promise<(T | undefined)[]> {
    if (this.init) {
      this.init = false;
      if (!this.curPage) {
        this.curPage = await this.requester.doNextRequest();
      }
      return this.curPage.data;
    }
    this.curPage = await this.requester.doNextRequest();
    return this.curPage.data;
  }
}

export class EntryIterator<T> implements SuiIterator<T> {
  cursor: number;

  pager: PagedIterator<T>;

  curData: (T | undefined)[];

  constructor(public readonly requester: Requester<T>) {
    this.pager = new PagedIterator<T>(requester);
    this.curData = [];
    this.cursor = 0;
  }

  async hasNext(): Promise<boolean> {
    if (this.cursor < this.curData.length - 1) {
      return true;
    }
    return this.pager.hasNext();
  }

  async next(): Promise<T | undefined> {
    this.cursor += 1;
    while (this.cursor >= this.curData.length) {
      if (!(await this.pager.hasNext())) {
        throw new Error('not more data'); // Shall not happen for legit data source.
      } else {
        this.curData = await this.pager.next();
        this.cursor = 0;
      }
    }
    return this.curData[this.cursor];
  }
}
