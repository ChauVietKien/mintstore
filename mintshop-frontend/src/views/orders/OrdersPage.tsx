"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Coffee, Truck, CheckCircle2, X, MapPin, Phone, ShoppingBag, Navigation } from 'lucide-react';
import { useOrderStore, OrderStatus } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export function OrdersPage() {
  const router = useRouter();
  const { orders, fetchMyOrders } = useOrderStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'PROCESSING' | 'COMPLETED' | 'CANCELLED'>('PROCESSING');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isAuthenticated) {
      fetchMyOrders();
    }
  }, [isAuthenticated, fetchMyOrders]);

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-sm w-full">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Chưa Đăng Nhập</h2>
          <p className="text-slate-500 mb-6">Bạn cần đăng nhập để theo dõi đơn hàng của mình.</p>
          <Link href="/" className="bg-[#ea8025] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#d46f19]">
            Quay Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"><Clock size={14} /> Chờ duyệt</span>;
      case 'BREWING':
        return <span className="bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"><Coffee size={14} /> Đang pha</span>;
      case 'DELIVERING':
        return <span className="bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"><Truck size={14} /> Đang giao</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"><CheckCircle2 size={14} /> Đã giao</span>;
      case 'CANCELLED':
        return <span className="bg-rose-50 text-rose-900 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"><X size={14} /> Đã hủy</span>;
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (activeTab === 'PROCESSING') {
      return ord.status === 'PENDING' || ord.status === 'BREWING' || ord.status === 'DELIVERING';
    }
    if (activeTab === 'COMPLETED') {
      return ord.status === 'COMPLETED';
    }
    if (activeTab === 'CANCELLED') {
      return ord.status === 'CANCELLED';
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3.5 flex items-center shadow-sm">
        <button onClick={() => router.push('/')} className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-900 text-center flex-1 pr-6">Đơn Hàng</h1>
      </header>

      {/* Tabs */}
      <div className="bg-white px-4 border-b border-slate-200 sticky top-[57px] z-20">
        <div className="flex justify-between max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab('PROCESSING')}
            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${
              activeTab === 'PROCESSING' ? 'border-[#ea8025] text-[#ea8025]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Đang Xử Lý
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${
              activeTab === 'COMPLETED' ? 'border-[#ea8025] text-[#ea8025]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Lịch Sử
          </button>
          <button
            onClick={() => setActiveTab('CANCELLED')}
            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${
              activeTab === 'CANCELLED' ? 'border-[#ea8025] text-[#ea8025]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Đã Hủy
          </button>
        </div>
      </div>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm mt-4">
            <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium mb-4">Không có đơn hàng nào.</p>
            <Link href="/" className="inline-block bg-[#ea8025] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#d46f19] text-sm transition-colors">
              Bắt Đầu Đặt Món
            </Link>
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div key={ord.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs text-slate-400 font-bold">#{ord.orderNumber}</span>
                  <h4 className="font-bold text-slate-800">{ord.customerName}</h4>
                  <p className="text-xs text-slate-500">{new Date(ord.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <div>{getStatusBadge(ord.status)}</div>
              </div>

              <div className="text-sm text-slate-600 space-y-1.5">
                <div className="flex justify-between items-start gap-2">
                  <p className="flex items-center gap-2 flex-1"><MapPin size={16} className="text-[#ea8025] shrink-0" /> {ord.shippingAddress}</p>
                  {ord.latitude && ord.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${ord.latitude},${ord.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                      title="Xem vị trí chính xác trên bản đồ"
                    >
                      <Navigation size={10} /> Bản đồ
                    </a>
                  )}
                </div>
                <p className="flex items-center gap-2"><Phone size={16} className="text-[#ea8025] shrink-0" /> {ord.customerPhone}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2 text-sm">
                {ord.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span><span className="font-bold text-slate-900">{item.quantity}x</span> {item.productName || item.name} ({item.size})</span>
                    <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Tổng thanh toán:</span>
                <span className="font-extrabold text-[#ea8025] text-lg">{formatCurrency(ord.totalAmount)}</span>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
