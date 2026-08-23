import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error Handler]', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    sendError(res, messages.join(', '), 400, 'VALIDATION_ERROR', err.errors);
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    sendError(
      res,
      `Duplicate value entered for ${field}. Please use another value.`,
      400,
      'DUPLICATE_KEY_ERROR'
    );
    return;
  }

  if (err.name === 'CastError') {
    sendError(res, `Resource not found with ID ${err.value}`, 404, 'NOT_FOUND');
    return;
  }

  sendError(
    res,
    err.message || 'Something went wrong on our end.',
    err.statusCode || 500,
    err.code || 'INTERNAL_SERVER_ERROR'
  );
};
