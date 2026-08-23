import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { env } from '../config/env';
import { USER_ROLES } from '../config/constants';
import { sendError, sendSuccess } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const sanitizeUser = (user: any) => {
  const { passwordHash, ...rest } = user.toObject ? user.toObject() : user;
  return rest;
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, flatNumber, building } = req.body;

    if (!name || !email || !password) {
      sendError(res, 'Name, email, and password are required.', 400, 'VALIDATION_ERROR');
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      sendError(res, 'An account with this email already exists.', 400, 'DUPLICATE_EMAIL');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim(),
      passwordHash,
      role: USER_ROLES.RESIDENT,
      flatNumber: flatNumber?.trim(),
      building: building?.trim(),
    });

    const token = generateToken(user._id.toString());

    sendSuccess(
      res,
      {
        user: sanitizeUser(user),
        token,
      },
      201
    );
  } catch (error: any) {
    sendError(res, error.message || 'Registration failed', 500, 'SERVER_ERROR');
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Please provide email and password.', 400, 'VALIDATION_ERROR');
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await user.comparePassword(password))) {
      sendError(res, 'Invalid email or password.', 401, 'INVALID_CREDENTIALS');
      return;
    }

    const token = generateToken(user._id.toString());

    sendSuccess(res, {
      user: sanitizeUser(user),
      token,
    });
  } catch (error: any) {
    sendError(res, error.message || 'Login failed', 500, 'SERVER_ERROR');
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // Stateless JWT - client drops the token
  sendSuccess(res, { message: 'Logged out successfully.' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    sendError(res, 'Not authenticated', 401, 'UNAUTHORIZED');
    return;
  }
  sendSuccess(res, { user: sanitizeUser(req.user) });
};
