export interface Paginated<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalSize: number;
}

export interface PaginationOptions {
  pageSize: number;
  pageNumber: number;
}
