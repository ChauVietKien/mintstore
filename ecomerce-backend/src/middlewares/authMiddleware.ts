import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Không tìm thấy Token xác thực. Vui lòng đăng nhập lại.',
    });
  }

  const secret = process.env.JWT_SECRET || 'mintshop_super_secret_jwt_key_2026_secure';

  try {
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
