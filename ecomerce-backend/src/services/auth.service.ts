import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { verifyGoogleToken } from '../utils/googleAuth.js';
import prisma from '../utils/prisma.js';
import { getJwtSecret } from '../utils/jwt.js';

function isEmailAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || 'maithanhda70@gmail.com')
    .split(',')
    .map((e) => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

// 1. Đăng ký tài khoản mới bằng Email/Mật khẩu
export async function registerUser(data: { email: string; password: string; name: string; phone?: string }) {
  const { email, password, name, phone } = data;
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password || !name) {
    throw new Error('Vui lòng điền đầy đủ Email, Mật khẩu và Họ tên.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const isAdmin = isEmailAdmin(cleanEmail);
  const role = isAdmin ? 'ADMIN' : 'CUSTOMER';

  // Kiểm tra email đã tồn tại chưa
  const existingUser = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (existingUser) {
    // Nếu tài khoản đã tồn tại qua Google Auth hoặc Admin, cho phép thiết lập lại Mật khẩu Form!
    if (existingUser.password === 'GOOGLE_AUTHENTICATED_NO_PASSWORD' || isAdmin) {
      const updatedUser = await prisma.user.update({
        where: { email: cleanEmail },
        data: {
          password: hashedPassword,
          name: name.trim(),
          phone: phone || existingUser.phone,
          role,
        },
      });

      const token = jwt.sign(
        { userId: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role },
        getJwtSecret(),
        { expiresIn: '7d' }
      );

      return {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          role: updatedUser.role,
        },
        token,
      };
    }

    throw new Error('Email này đã được sử dụng. Vui lòng sử dụng tính năng Đăng nhập!');
  }

  const newUser = await prisma.user.create({
    data: {
      email: cleanEmail,
      name: name.trim(),
      password: hashedPassword,
      phone: phone || null,
      role,
    },
  });

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
    getJwtSecret(),
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
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    throw new Error('Vui lòng nhập Email và Mật khẩu.');
  }

  const isAdmin = isEmailAdmin(cleanEmail);
  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  // Nếu là email Admin (maithanhda70@gmail.com) nhưng chưa có trong DB -> Tự động khởi tạo Admin
  if (!user && isAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: 'Thanh Đà (Super Admin)',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    const token = jwt.sign(
      { userId: newAdmin.id, email: newAdmin.email, name: newAdmin.name, role: 'ADMIN' },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: 'ADMIN',
      },
      token,
    };
  }

  if (!user) {
    throw new Error('Tài khoản chưa tồn tại. Vui lòng bấm sang tab "Tạo tài khoản mới" để đăng ký!');
  }

  // Nếu user từng đăng nhập Google (chưa có mật khẩu Form) hoặc là Admin
  if (user.password === 'GOOGLE_AUTHENTICATED_NO_PASSWORD' || isAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        password: hashedPassword,
        role: isAdmin ? 'ADMIN' : user.role,
      },
    });

    const token = jwt.sign(
      { userId: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
      token,
    };
  }

  // Kiểm tra mật khẩu đối với tài khoản thông thường
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Mật khẩu không chính xác. Vui lòng kiểm tra lại!');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name, role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
    token,
  };
}

// 3. Đăng nhập/Đăng ký bằng Google ID Token
export async function loginOrRegisterWithGoogle(idToken: string) {
  const googleData = await verifyGoogleToken(idToken);
  const { email, name, picture } = googleData;
  const cleanEmail = email.trim().toLowerCase();

  const isAdminEmail = isEmailAdmin(cleanEmail);
  let userRole: 'ADMIN' | 'CUSTOMER' = isAdminEmail ? 'ADMIN' : 'CUSTOMER';
  let userId = `user_${Date.now()}`;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      if (isAdminEmail && existingUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email: cleanEmail },
          data: { role: 'ADMIN' },
        });
      }
      userRole = isAdminEmail ? 'ADMIN' : existingUser.role;
      userId = existingUser.id;
    } else {
      const newUser = await prisma.user.create({
        data: {
          email: cleanEmail,
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
    { userId, email: cleanEmail, name, role: userRole },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: userId,
      email: cleanEmail,
      name,
      avatar: picture,
      role: userRole,
    },
    token,
  };
}
