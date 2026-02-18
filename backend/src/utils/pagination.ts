export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
  };
}

export function getPaginationParams(page?: number, limit?: number): PaginationParams {
  const defaultLimit = parseInt(process.env.DEFAULT_PAGE_LIMIT || '5');
  return {
    page: Math.max(1, page || 1),
    limit: Math.max(1, limit || defaultLimit)
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      pageSize: limit
    }
  };
}
