export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export function successResponse<T>(data: T, message = 'Success', statusCode = 200) {
  return { success: true, statusCode, message, data };
}

export function errorResponse(message: string, statusCode = 400) {
  return { success: false, statusCode, message };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success'
) {
  return {
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}
