import { ProfilePage } from '@/views/profile/ProfilePage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hồ Sơ Của Tôi - Mint Shop',
  description: 'Quản lý thông tin cá nhân và tài khoản.',
};

export default function Profile() {
  return <ProfilePage />;
}
