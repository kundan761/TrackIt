import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/generateToken.js';
import User from '../models/User.js';
import { AuthRequest } from '../types/index.js';
import { AppError } from './errorHandler.js';

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      req.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      return next(new AppError('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`User role '${req.user.role}' is not authorized to access this route`, 403)
      );
    }

    next();
  };
};

