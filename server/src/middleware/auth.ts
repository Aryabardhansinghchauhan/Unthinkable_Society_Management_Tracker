import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser } from '../models/User';
import { sendError } from '../utils/apiResponse';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    sendError(res, 'Authentication required. Please log in.', 401, 'UNAUTHORIZED');
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      sendError(
        res,
        'The user belonging to this token no longer exists.',
        401,
        'UNAUTHORIZED'
      );
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    sendError(res, 'Invalid or expired session token.', 401, 'INVALID_TOKEN');
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(
        res,
        'You do not have permission to perform this action.',
        403,
        'FORBIDDEN'
      );
      return;
    }
    next();
  };
};
