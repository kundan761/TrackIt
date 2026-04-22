import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

const JWT_SECRET = config.get('JWT_SECRET');
const JWT_EXPIRE = config.get('JWT_EXPIRE');
const JWT_REFRESH_SECRET = config.get('JWT_REFRESH_SECRET');
const JWT_REFRESH_EXPIRE = config.get('JWT_REFRESH_EXPIRE');

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
  });
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
};

