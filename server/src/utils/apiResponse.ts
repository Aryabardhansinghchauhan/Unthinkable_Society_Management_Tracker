import { Response } from 'express';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  data: T | null;
  error: ApiError | null;
}

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200): Response => {
  const response: ApiResponse<T> = {
    data,
    error: null,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  code = 'ERROR',
  details?: any
): Response => {
  const response: ApiResponse<null> = {
    data: null,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  return res.status(statusCode).json(response);
};
