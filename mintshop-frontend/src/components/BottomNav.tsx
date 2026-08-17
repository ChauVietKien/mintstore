"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Coffee, ShoppingBag, User } from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthPopup } from './AuthPopup';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const { orders, fetchMyOrders } = useOrderStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyOrders();
    }
  }, [fetchMyOrders, isAuthenticated]);

  if (pathname?.startsWith('/admin')) return null;

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  ).length;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#fde8d7] shadow-lg max-w-lg mx-auto">
        <div className="flex justify-around items-center h-16 px-2">
          {/* Nút 1: Thực đơn (Trang chủ) */}
          <button
            onClick={() => {
              if (pathname !== '/') router.push('/');
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
              pathname === '/' 
                ? 'text-[#ea8025] font-bold'
                : 'text-stone-500 hover:text-[#ea8025]'
            }`}
          >
            <Coffee size={20} className={pathname === '/' ? 'scale-110' : ''} />
            <span className="text-[11px]">Thực Đơn</span>
          </button>

          {/* Nút 2: Theo Dõi Đơn Hàng */}
          <button
            onClick={() => router.push('/orders')}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 relative transition-all ${
              pathname === '/orders'
                ? 'text-[#ea8025] font-bold'
                : 'text-stone-500 hover:text-[#ea8025]'
            }`}
          >
            <div className="relative">
              <ShoppingBag size={20} className={pathname === '/orders' ? 'scale-110' : ''} />
              {activeOrdersCount > 0 && isAuthenticated && (
                <span className="absolute -top-1.5 -right-2 bg-[#ea8025] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {activeOrdersCount}
                </span>
              )}
            </div>
            <span className="text-[11px]">Đơn Hàng</span>
          </button>

          {/* Nút 3: Tài Khoản / Thông Tin */}
          <button
            onClick={() => {
              if (isAuthenticated) {
                router.push('/profile');
              } else {
                setIsAuthPopupOpen(true);
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
              pathname === '/profile'
                ? 'text-[#ea8025] font-bold'
                : 'text-stone-500 hover:text-[#ea8025]'
            }`}
          >
            <User size={20} className={pathname === '/profile' ? 'scale-110' : ''} />
            <span className="text-[11px]">{isAuthenticated ? (user?.name?.split(' ')[0] || 'Tài Khoản') : 'Đăng Nhập'}</span>
          </button>
        </div>
      </div>

      <AuthPopup isOpen={isAuthPopupOpen} onClose={() => setIsAuthPopupOpen(false)} />
    </>
  );
}
