import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../utils/jwt.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'CUSTOMER';
  };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Không tìm thấy Token xác thực. Vui lòng đăng nhập lại.',
    });
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      status: 'error',
      message: 'Token không hợp lệ hoặc đã hết hạn.',
    });
  }
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      status: 'error',
      message: 'Truy cập bị từ chối! Yêu cầu quyền quản trị viên Admin.',
    });
  }
  next();
}
