import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { verifyGoogleToken } from '../utils/googleAuth.js';
import prisma from '../utils/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mintshop_super_secret_jwt_key_2026_secure';

function isEmailAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || 'maithanhda70@gmail.com')
    .split(',')
    .map((e) => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

// 1. Đăng ký tài khoản mới bằng Email/Mật khẩu
export async function registerUser(data: { email: string; password: string; name: string; phone?: string }) {
  const { email, password, name, phone } = data;

  if (!email || !password || !name) {
    throw new Error('Vui lòng điền đầy đủ Email, Mật khẩu và Họ tên.');
  }

  // Kiểm tra email đã tồn tại chưa
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error('Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.');
  }

  // Hash mật khẩu an toàn bằng bcryptjs
  const hashedPassword = await bcrypt.hash(password, 10);
  const isAdmin = isEmailAdmin(email);
  const role = isAdmin ? 'ADMIN' : 'CUSTOMER';

  const newUser = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      phone: phone || null,
      role,
    },
  });

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
    },
    token,
  };
}

// 2. Đăng nhập bằng Email/Mật khẩu
export async function loginUser(data: { email: string; password: string }) {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error('Vui lòng nhập Email và Mật khẩu.');
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new Error('Email hoặc mật khẩu không chính xác.');
  }

  // Kiểm tra mật khẩu
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Email hoặc mật khẩu không chính xác.');
  }

  // Cập nhật role nếu email nằm trong danh sách Admin
  let currentRole = user.role;
  if (isEmailAdmin(email) && user.role !== 'ADMIN') {
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: 'ADMIN' },
    });
    currentRole = 'ADMIN';
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name, role: currentRole },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: currentRole,
    },
    token,
  };
}

// 3. Đăng nhập/Đăng ký bằng Google ID Token
export async function loginOrRegisterWithGoogle(idToken: string) {
  const googleData = await verifyGoogleToken(idToken);
  const { email, name, picture } = googleData;

  const isAdminEmail = isEmailAdmin(email);
  let userRole: 'ADMIN' | 'CUSTOMER' = isAdminEmail ? 'ADMIN' : 'CUSTOMER';
  let userId = `user_${Date.now()}`;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      if (isAdminEmail && existingUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email: email.toLowerCase() },
          data: { role: 'ADMIN' },
        });
      }
      userRole = isAdminEmail ? 'ADMIN' : existingUser.role;
      userId = existingUser.id;
    } else {
      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          password: 'GOOGLE_AUTHENTICATED_NO_PASSWORD',
          role: userRole,
        },
      });
      userId = newUser.id;
    }
  } catch (dbError) {
    console.warn('Cảnh báo DB: Chưa thể kết nối PostgreSQL khi đăng nhập Google.');
  }

  const token = jwt.sign(
    { userId, email, name, role: userRole },
    JWT_SECRET,
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
