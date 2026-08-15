import { Request, Response } from 'express';
import { loginOrRegisterWithGoogle, registerUser, loginUser } from '../services/auth.service.js';

export async function handleRegister(req: Request, res: Response) {
  try {
    const { email, password, name, phone } = req.body;
    const result = await registerUser({ email, password, name, phone });

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
