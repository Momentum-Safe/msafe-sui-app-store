export interface PagedData<T> {
  data: (T | undefined)[];
  hasNext: boolean;
}

export interface Requester<T> {
  doNextRequest: () => Promise<PagedData<T>>;
}
