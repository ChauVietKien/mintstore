"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, User, FileText, CheckCircle2, ShieldCheck, CreditCard, Banknote } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore, Order } from '@/store/useOrderStore';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { createOrder } = useOrderStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOMO' | 'BANK'>('COD');
  
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const subtotal = getTotalPrice();
  // Phí ship 15.000đ, Miễn phí giao hàng cho đơn từ 150.000đ
  const shippingFee = subtotal >= 150000 || subtotal === 0 ? 0 : 15000;
  const totalAmount = subtotal + shippingFee;

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (!customerName || !customerPhone || !shippingAddress) {
      alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Gọi OrderStore tạo đơn hàng mới (Tự động lưu vào PostgreSQL DB & truyền đơn về Admin)
      const newOrder = await createOrder({
        customerName,
        customerPhone,
        shippingAddress,
        note,
        items,
        subtotal,
        shippingFee,
        totalAmount,
        paymentMethod,
      });

      setCreatedOrder(newOrder);
      setIsSuccessModalOpen(true);
      clearCart(); // Làm sạch giỏ hàng sau khi đặt thành công
    } catch (err: any) {
      alert("Có lỗi khi tạo đơn hàng. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3.5 flex items-center shadow-sm">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-900 text-center flex-1 pr-6">Xác Nhận Đơn Hàng</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {items.length === 0 && !isSuccessModalOpen ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-200 my-8">
            <p className="text-slate-500 font-medium mb-4">Giỏ hàng của bạn đang trống.</p>
            <Link 
              href="/" 
              className="inline-block bg-[#d45836] text-white font-bold px-6 py-3 rounded-full hover:bg-[#b04529] transition-all text-sm"
            >
              Quay lại chọn nước uống
            </Link>
          </div>
        ) : (
          <form onSubmit={handleConfirmOrder} className="space-y-4">
            {/* Block 1: Thông tin người nhận */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="text-[#d45836]" size={18} /> Thông Tin Giao Hàng
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Họ và tên *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input 
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Vd: Nguyễn Văn A"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d45836] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Số điện thoại nhận nước *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input 
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Vd: 0901234567"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d45836] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Địa chỉ nhận nước chi tiết *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input 
                      type="text"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Vd: Số 123 Nguyễn Huệ, P. Bến Nghé, Q.1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d45836] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Ghi chú cho shipper/quán (Tùy chọn)</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input 
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Vd: Giao giờ hành chính, gọi trước khi giao"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d45836] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Block 2: Danh sách món đã chọn */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
              <h2 className="font-bold text-base text-slate-900 mb-3 border-b border-slate-100 pb-3">
                Món Nước Đã Chọn ({items.length})
              </h2>
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#fde9d6] overflow-hidden shrink-0">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">{item.name}</h4>
                        <p className="text-xs text-slate-500">
                          {item.size} x {item.quantity} {item.note && `• ${item.note}`}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-slate-900">{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Block 3: Phương thức thanh toán */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
              <h2 className="font-bold text-base text-slate-900 mb-3 border-b border-slate-100 pb-3">
                Phương Thức Thanh Toán
              </h2>
              <div className="space-y-2">
                <label 
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#d45836] bg-[#fdf2ee] text-[#d45836] font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote size={20} />
                    <span className="text-sm">Tiền mặt khi nhận nước (COD)</span>
                  </div>
                  <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => {}} className="accent-[#d45836]" />
                </label>

                <label 
                  onClick={() => setPaymentMethod('MOMO')}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'MOMO'
                      ? 'border-[#d45836] bg-[#fdf2ee] text-[#d45836] font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} />
                    <span className="text-sm">Thanh toán MoMo / QR Code</span>
                  </div>
                  <input type="radio" name="payment" checked={paymentMethod === 'MOMO'} onChange={() => {}} className="accent-[#d45836]" />
                </label>
              </div>
            </div>

            {/* Block 4: Chi tiết tiền hàng & Phí ship */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-2.5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tiền hàng</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm text-slate-600">
                <span>Phí giao hàng (Phí ship)</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-emerald-600">MIỄN PHÍ</span>
                ) : (
                  <span className="font-semibold text-slate-900">{formatCurrency(shippingFee)}</span>
                )}
              </div>

              {subtotal < 150000 && (
                <p className="text-[11px] text-amber-600 font-medium bg-amber-50 p-2 rounded-xl border border-amber-100">
                  💡 Mẹo: Mua thêm {formatCurrency(150000 - subtotal)} để được MIỄN PHÍ GIAO HÀNG!
                </p>
              )}

              <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-slate-100">
                <span className="text-slate-900">Tổng thanh toán</span>
                <span className="text-[#d45836] text-xl">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#d45836] hover:bg-[#b04529] text-white font-bold py-4 rounded-full text-base transition-all shadow-lg shadow-[#d45836]/20 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'ĐANG LƯU ĐƠN HÀNG...' : `XÁC NHẬN ĐẶT HÀNG (${formatCurrency(totalAmount)})`}
            </button>
          </form>
        )}
      </main>

      {/* Pop-up Thông Báo Đặt Hàng Thành Công */}
      {isSuccessModalOpen && createdOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Đặt Hàng Thành Công!</h3>
            <p className="text-xs text-slate-500 mb-4">Mã đơn hàng: <span className="font-bold text-slate-900">{createdOrder.orderNumber}</span></p>

            <div className="bg-slate-50 rounded-2xl p-3.5 text-left text-xs space-y-1.5 mb-6 border border-slate-100">
              <p><span className="text-slate-500">Khách hàng:</span> <span className="font-bold text-slate-800">{createdOrder.customerName}</span></p>
              <p><span className="text-slate-500">SĐT:</span> <span className="font-bold text-slate-800">{createdOrder.customerPhone}</span></p>
              <p><span className="text-slate-500">Địa chỉ:</span> <span className="font-semibold text-slate-800">{createdOrder.shippingAddress}</span></p>
              <p><span className="text-slate-500">Tổng tiền:</span> <span className="font-bold text-[#d45836]">{formatCurrency(createdOrder.totalAmount)}</span></p>
              <p><span className="text-slate-500">Trạng thái:</span> <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">🟡 Chờ quán duyệt đơn</span></p>
            </div>

            <div className="space-y-2">
              <Link
                href="/admin"
                className="w-full bg-emerald-800 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-900 transition-all shadow-sm"
              >
                <ShieldCheck size={16} /> Mở Admin Để Duyệt Đơn Này
              </Link>
              <Link
                href="/"
                className="w-full bg-slate-100 text-slate-700 font-semibold py-3 rounded-2xl text-xs block hover:bg-slate-200 transition-all"
              >
                Trở Về Trang Chủ
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
