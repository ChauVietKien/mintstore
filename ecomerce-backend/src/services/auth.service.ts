import jwt from 'jsonwebtoken';
import { verifyGoogleToken } from '../utils/googleAuth.js';
import prisma from '../utils/prisma.js';

export async function loginOrRegisterWithGoogle(idToken: string) {
  // 1. Xác thực ID Token với Google Server
  const googleData = await verifyGoogleToken(idToken);
  const { email, name, picture } = googleData;

  // 2. Kiểm tra email có thuộc danh sách ADMIN được cấp phép không
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase());
  
  const isAdminEmail = adminEmails.includes(email.toLowerCase());

  let userRole: 'ADMIN' | 'CUSTOMER' = isAdminEmail ? 'ADMIN' : 'CUSTOMER';
  let userId = `user_${Date.now()}`;

  // 3. Nếu Database khả dụng, thực hiện Upsert User
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Nếu user đã tồn tại và email thuộc danh sách Admin, nâng cấp role thành ADMIN
      if (isAdminEmail && existingUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' },
        });
      }
      userRole = isAdminEmail ? 'ADMIN' : existingUser.role;
      userId = existingUser.id;
    } else {
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: 'GOOGLE_AUTHENTICATED_NO_PASSWORD',
          role: userRole,
        },
      });
      userId = newUser.id;
    }
  } catch (dbError) {
    console.warn('Cảnh báo DB: Chưa thể kết nối PostgreSQL, đang chạy chế độ Auth Mock/In-Memory.');
  }

  // 4. Tạo JWT Token bảo mật cho hệ thống Mint Shop
  const secret = process.env.JWT_SECRET || 'mintshop_super_secret_jwt_key_2026_secure';
  const token = jwt.sign(
    {
      userId,
      email,
      name,
      role: userRole,
    },
    secret,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: userId,
      email,
      name,
      avatar: picture,
      role: userRole,
    },
    token,
  };
}
