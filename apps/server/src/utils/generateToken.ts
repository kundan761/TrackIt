import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

const JWT_SECRET = config.get('server.jwt_secret', 'your-secret-key-change-in-production');
const JWT_EXPIRE = config.get('server.jwt_expire', '7d');
const JWT_REFRESH_SECRET = config.get('server.jwt_refresh_secret', 'your-refresh-secret-key');
const JWT_REFRESH_EXPIRE = config.get('server.jwt_refresh_expire', '30d');

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

