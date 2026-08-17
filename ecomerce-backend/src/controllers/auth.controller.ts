import { Request, Response, CookieOptions } from 'express';
import { loginOrRegisterWithGoogle, registerUser, loginUser } from '../services/auth.service.js';

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
};

function setAuthTokenCookie(res: Response, token: string) {
  if (token) {
    res.cookie('token', token, COOKIE_OPTIONS);
  }
}

export async function handleRegister(req: Request, res: Response) {
  try {
    const { email, password, name, phone } = req.body;
    const result = await registerUser({ email, password, name, phone });

    setAuthTokenCookie(res, result.token);

    res.status(201).json({
      status: 'success',
      message: 'Đăng ký tài khoản thành công!',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'error',
      message: error.message || 'Đăng ký thất bại.',
    });
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });

    setAuthTokenCookie(res, result.token);

    res.status(200).json({
      status: 'success',
      message: 'Đăng nhập thành công!',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'error',
      message: error.message || 'Đăng nhập thất bại.',
    });
  }
}

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

    setAuthTokenCookie(res, result.token);

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

export async function handleLogout(req: Request, res: Response) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.status(200).json({
    status: 'success',
    message: 'Đăng xuất thành công!',
  });
}

export async function handleUpdateProfile(req: any, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Không tìm thấy thông tin xác thực.' });
    }

    const { name, phone, address } = req.body;
    
    // update in prisma
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật thông tin thành công!',
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Lỗi khi cập nhật profile:', error.message);
    res.status(500).json({ status: 'error', message: 'Lỗi server khi cập nhật thông tin.' });
  }
}
