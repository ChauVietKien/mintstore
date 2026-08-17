"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Save, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import Link from 'next/link';

export function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateProfile } = useAuthStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  if (!isMounted) return null;

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-sm w-full">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Chưa Đăng Nhập</h2>
          <p className="text-slate-500 mb-6">Vui lòng đăng nhập để xem hồ sơ.</p>
          <Link href="/" className="bg-[#ea8025] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#d46f19]">
            Quay Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateProfile({ name, phone, address });
      if (res?.success) {
        toast.success(res.message);
      } else {
        toast.error(res?.message || "Cập nhật thất bại.");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi lưu thông tin.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất tài khoản.");
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3.5 flex items-center shadow-sm">
        <button onClick={() => router.push('/')} className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-900 text-center flex-1 pr-6">Hồ Sơ Cá Nhân</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6 mt-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 bg-[#ea8025] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
              <p className="text-slate-500">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Họ và tên</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea8025] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Vd: 0901234567"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea8025] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Địa chỉ giao hàng mặc định</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Vd: 123 Đường ABC, Quận 1..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ea8025] focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#ea8025] hover:bg-[#d46f19] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <Save size={18} /> {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </form>
        </div>

        <div className="space-y-3">
          {user.role === 'ADMIN' && (
            <button
              onClick={() => router.push('/admin')}
              className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-sm"
            >
              <ShieldCheck size={20} /> Mở Trang Quản Trị
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full bg-white text-rose-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors border border-rose-100 shadow-sm"
          >
            <LogOut size={20} /> Đăng Xuất
          </button>
        </div>
      </main>
    </div>
  );
}
