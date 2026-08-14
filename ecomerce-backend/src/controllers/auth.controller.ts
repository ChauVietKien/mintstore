import { Request, Response } from 'express';
import { loginOrRegisterWithGoogle } from '../services/auth.service.js';

export async function handleGoogleLogin(req: Request, res: Response) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu Google ID Token.',
      });
    }

    const result = await loginOrRegisterWithGoogle(idToken);

    res.status(200).json({
      status: 'success',
      message: 'Đăng nhập Google thành công!',
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      status: 'error',
      message: error.message || 'Đăng nhập Google thất bại.',
    });
  }
}
