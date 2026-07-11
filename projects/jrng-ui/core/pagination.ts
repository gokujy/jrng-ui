export interface JPaginationOptions {
  readonly page: number;
  readonly totalItems: number;
  readonly pageSize: number;
  readonly siblingCount?: number;
  readonly boundaryCount?: number;
}

export interface JPaginationState {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly firstItem: number;
  readonly lastItem: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
  readonly pages: readonly number[];
}

export function jCreatePagination(options: JPaginationOptions): JPaginationState {
  const totalItems = Math.max(0, Math.trunc(options.totalItems));
  const pageSize = Math.max(1, Math.trunc(options.pageSize));
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(1, Math.trunc(options.page)), totalPages);
  const siblingCount = Math.max(0, Math.trunc(options.siblingCount ?? 1));
  const boundaryCount = Math.max(0, Math.trunc(options.boundaryCount ?? 1));
  const pages = new Set<number>();
  for (let value = 1; value <= Math.min(boundaryCount, totalPages); value += 1) pages.add(value);
  for (
    let value = Math.max(1, page - siblingCount);
    value <= Math.min(totalPages, page + siblingCount);
    value += 1
  )
    pages.add(value);
  for (let value = Math.max(1, totalPages - boundaryCount + 1); value <= totalPages; value += 1)
    pages.add(value);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    firstItem: totalItems === 0 ? 0 : (page - 1) * pageSize + 1,
    lastItem: Math.min(page * pageSize, totalItems),
    hasPrevious: page > 1,
    hasNext: page < totalPages,
    pages: [...pages].sort((left, right) => left - right),
  };
}
