import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware.js';
import { getAllUsersFromDb } from '../../services/user.service.js';

export async function getAdminUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const users = await getAllUsersFromDb();
    res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách user:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Không thể lấy danh sách người dùng',
    });
  }
}