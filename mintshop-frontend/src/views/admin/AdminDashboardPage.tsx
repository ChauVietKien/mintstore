"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore, OrderStatus } from '@/store/useOrderStore';
import { useProductStore } from '@/store/useProductStore';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { useUserStore } from '@/store/useUserStore';
import {
  ShieldCheck,
  ShoppingBag,
  Coffee,
  Users,
  LogOut,
  Home,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Check,
  X,
  UserPlus,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Navigation
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { calculateDistanceKm, MINT_SHOP_LOCATION } from '@/lib/distance';
import toast from 'react-hot-toast';

export function AdminDashboardPage() {
  const { user, logout } = useAuthStore();
  const { orders, fetchOrders, updateOrderStatus } = useOrderStore();
  const { products, fetchProducts, addProduct, toggleAvailability, deleteProduct } = useProductStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users'>('orders');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [ownerLocation, setOwnerLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Lấy vị trí GPS thực tế của thiết bị chủ quán nếu có bật GPS
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setOwnerLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Form Thêm Món Nước Tinh Giản
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Admin management
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminList, setAdminList] = useState(['maithanhda70@gmail.com']);
  const [isMounted, setIsMounted] = useState(false);

  // User store
  const { users, loading: loadingUsers, fetchAdminUsers } = useUserStore();

  useEffect(() => {
    setIsMounted(true);
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchAdminUsers();
    }
  }, [activeTab, fetchAdminUsers]);

  if (!isMounted) return null;

  // Protected Admin Check
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#fffaf5] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-[#fde8d7] text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#451a03] mb-2">Truy Cập Bị Từ Chối</h2>
          <p className="text-stone-600 text-sm mb-6">
            Bạn cần đăng nhập bằng tài khoản Admin (<span className="font-semibold text-[#ea8025]">maithanhda70@gmail.com</span>) để xem trang này.
          </p>
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 bg-[#fff3e8] text-[#ea8025] font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#fde2cb] transition-all text-sm"
            >
              <Home size={18} /> Về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Upload Ảnh Từ Máy Tính
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setNewProdImage(imageUrl);
    } catch (err: any) {
      toast.error('Tải ảnh thất bại. Vui lòng thử lại!');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      toast.error("Vui lòng nhập tên món nước và giá bán!");
      return;
    }

    const priceNum = parseFloat(newProdPrice);
    if (isNaN(priceNum)) {
      toast.error("Giá tiền không hợp lệ!");
      return;
    }

    const finalImage = newProdImage.trim() || '/images/tra-olong-oi-hong.png';

    await addProduct({
      name: newProdName.trim(),
      basePrice: priceNum,
      image: finalImage,
      sizes: [
        { name: 'Vừa', extraPrice: 0 },
        { name: 'Lớn', extraPrice: 10000 },
      ],
    });

    setNewProdName('');
    setNewProdPrice('');
    setNewProdImage('');
    setIsAddProductModalOpen(false);
    toast.success(`Đã thêm món mới "${newProdName}" thành công!`);
  };

  const handleAddAdminEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || adminList.includes(newAdminEmail)) return;
    setAdminList([...adminList, newAdminEmail.trim()]);
    setNewAdminEmail('');
    toast.success(`Đã cấp quyền Admin cho email: ${newAdminEmail}`);
  };

  // Ưu tiên đơn đặt trước lên trên cùng (FIFO)
  const sortedOrders = [...orders].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  const filteredOrders = filterStatus === 'ALL'
    ? sortedOrders
    : sortedOrders.filter((o) => o.status === filterStatus);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1"><Clock size={13} /> Chờ duyệt</span>;
      case 'BREWING':
        return <span className="bg-sky-50 text-sky-900 border border-sky-200 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1"><Coffee size={13} /> Đang pha chế</span>;
      case 'DELIVERING':
        return <span className="bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1"><Truck size={13} /> Đang giao</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={13} /> Hoàn thành</span>;
      case 'CANCELLED':
        return <span className="bg-rose-50 text-rose-900 border border-rose-200 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1"><X size={13} /> Đã hủy</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#451a03] font-sans">
      {/* Header Bar */}
      <header className="bg-gradient-to-r from-[#ea8025] to-[#d46f19] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Mint Logo" className="h-10 object-contain drop-shadow-sm" />
            <span className="text-xs font-extrabold bg-white/20 border border-white/30 text-white px-2 py-0.5 rounded-lg tracking-wider">ADMIN</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/20 border border-white/30 px-3 py-1.5 rounded-full text-xs">
              <ShieldCheck className="text-amber-200" size={15} />
              <span className="font-medium text-white">{user.email}</span>
            </div>

            <Link href="/" className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors border border-white/30">
              <Home size={15} />
              <span className="hidden md:inline">Trang Chủ</span>
            </Link>

            <button
              onClick={logout}
              className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-xl text-xs font-bold transition-colors border border-white/30"
              title="Đăng xuất"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Navigation Tabs */}
        <div className="flex justify-between items-center border-b border-[#fde8d7] mb-6 pb-2">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all shrink-0 ${activeTab === 'orders'
                ? 'bg-[#ea8025] text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-[#fff3e8] border border-[#fde8d7]'
                }`}
            >
              <ShoppingBag size={16} /> Đơn Hàng ({orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length})
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all shrink-0 ${activeTab === 'products'
                ? 'bg-[#ea8025] text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-[#fff3e8] border border-[#fde8d7]'
                }`}
            >
              <Coffee size={16} /> Thực Đơn ({products.length})
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all shrink-0 ${activeTab === 'users'
                  ? 'bg-[#ea8025] text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-[#fff3e8] border border-[#fde8d7]'
                }`}
            >
              <Users size={16} /> Người Dùng ({users.length})
            </button>
          </div>
        </div>

        {/* TAB 1: QUẢN LÝ ĐƠN HÀNG */}
        {activeTab === 'orders' && (
          <div>
            {/* Status Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['ALL', 'PENDING', 'BREWING', 'DELIVERING', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${filterStatus === st
                    ? 'bg-[#ea8025] text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-[#fde8d7] hover:bg-[#fff3e8]'
                    }`}
                >
                  {st === 'ALL' && 'Tất cả đơn'}
                  {st === 'PENDING' && 'Chờ duyệt'}
                  {st === 'BREWING' && 'Đang pha'}
                  {st === 'DELIVERING' && 'Đang giao'}
                  {st === 'COMPLETED' && 'Hoàn thành'}
                  {st === 'CANCELLED' && 'Đã hủy'}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-stone-500 border border-[#fde8d7] text-sm">
                Chưa có đơn hàng nào trong danh sách.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((ord) => (
                  <div key={ord.id} className="bg-white rounded-3xl border border-[#fde8d7] shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex justify-between items-start mb-2.5 border-b border-amber-100/60 pb-2.5">
                        <div>
                          <span className="font-mono text-xs text-stone-400 font-bold">#{ord.orderNumber}</span>
                          <h3 className="font-bold text-[#451a03] text-sm">{ord.customerName}</h3>
                          <p className="text-xs text-stone-500">{ord.customerPhone} • {ord.createdAt}</p>
                        </div>
                        <div>{getStatusBadge(ord.status)}</div>
                      </div>

                      <div className="text-xs text-stone-600 mb-3 bg-[#fffaf5] p-2.5 rounded-2xl border border-[#fde8d7] flex justify-between items-start gap-2">
                        <p className="flex-1 leading-tight">
                          📍 <span className="font-medium">{ord.shippingAddress}</span>
                        </p>
                        {ord.latitude && ord.longitude ? (
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[10px] font-extrabold text-[#d45836] bg-[#fdf2ee] border border-[#fde2cb] px-2 py-0.5 rounded-full">
                              ⚡ {calculateDistanceKm(ord.latitude, ord.longitude)} km
                            </span>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&origin=${ownerLocation ? `${ownerLocation.lat},${ownerLocation.lng}` : `${MINT_SHOP_LOCATION.lat},${MINT_SHOP_LOCATION.lng}`}&destination=${ord.latitude},${ord.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-xl flex items-center gap-1 transition-colors shadow-xs"
                              title={ownerLocation ? "Chỉ đường từ vị trí GPS hiện tại của chủ quán" : "Chỉ đường từ Mint Shop"}
                            >
                              <Navigation size={11} className="text-sky-600" /> Chỉ đường
                            </a>
                          </div>
                        ) : (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ord.shippingAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 px-2 py-1 rounded-xl flex items-center gap-1 shrink-0 transition-colors"
                            title="Tìm địa chỉ trên Google Maps"
                          >
                            <Navigation size={11} className="text-stone-500" /> Maps
                          </a>
                        )}
                      </div>

                      {/* Order Items */}
                      <div className="space-y-1.5 mb-3">
                        {ord.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-xs border-b border-dashed border-stone-100 pb-1">
                            <div>
                              <span className="font-semibold text-stone-800">{item.quantity}x {item.name}</span>
                              {item.size && <span className="text-stone-500 ml-1">({item.size})</span>}
                              {item.note && <p className="text-amber-700 italic">Ghi chú: {item.note}</p>}
                            </div>
                            <span className="font-bold text-stone-800">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center pt-2.5 border-t border-stone-100 mb-3 text-xs">
                        <span className="text-stone-500">Tổng thanh toán</span>
                        <span className="font-extrabold text-[#ea8025] text-sm">{formatCurrency(ord.totalAmount)}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {ord.status === 'PENDING' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'BREWING')}
                            className="flex-1 bg-[#ea8025] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#d46f19] transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Coffee size={13} /> Duyệt đơn
                          </button>
                        )}
                        {ord.status === 'BREWING' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'DELIVERING')}
                            className="flex-1 bg-purple-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Truck size={13} /> Giao hàng
                          </button>
                        )}
                        {ord.status === 'DELIVERING' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'COMPLETED')}
                            className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Check size={13} /> Hoàn thành
                          </button>
                        )}
                        {ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'CANCELLED')}
                            className="bg-stone-100 text-rose-600 hover:bg-rose-100 p-2 rounded-xl text-xs font-bold transition-colors"
                            title="Hủy đơn"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: QUẢN LÝ THỰC ĐƠN */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-[#fde8d7] p-5 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-bold text-[#451a03]">Thực Đơn Sản Phẩm ({products.length})</h2>
                <p className="text-xs text-stone-500">Quản lý Bật/Tắt hoặc xóa món</p>
              </div>
              <button
                onClick={() => setIsAddProductModalOpen(true)}
                className="bg-[#ea8025] text-white font-bold text-xs py-2 px-3.5 rounded-2xl flex items-center gap-1 hover:bg-[#d46f19] transition-all shadow-sm"
              >
                <Plus size={15} /> Thêm Món Mới
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs">
                Chưa có sản phẩm nào. Bấm "Thêm Món Mới" để tạo sản phẩm đầu tiên!
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {products.map((p) => (
                  <div key={p.id} className="py-3 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#fffaf5] border border-[#fde8d7] rounded-2xl overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                        {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#451a03] text-xs">{p.name}</h4>
                        <p className="text-xs font-bold text-[#ea8025]">{formatCurrency(p.basePrice)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAvailability(p.id)}
                        className={`px-3 py-1.5 rounded-2xl text-[11px] font-bold transition-all border ${p.isAvailable
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}
                      >
                        {p.isAvailable ? 'Còn hàng' : 'Hết món'}
                      </button>

                      <button
                        onClick={() => {
                          deleteProduct(p.id);
                          toast.success(`Đã xóa món "${p.name}"`);
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        title="Xóa món"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PHÂN QUYỀN & DANH SÁCH NGƯỜI DÙNG */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Cấp Quyền Admin */}
            <div className="max-w-xl bg-white rounded-3xl border border-[#fde8d7] p-5 shadow-sm">
              <h2 className="text-base font-bold mb-1.5 flex items-center gap-2 text-[#451a03]">
                <UserPlus className="text-[#ea8025]" size={18} /> Cấp Quyền Admin Mới
              </h2>
              <p className="text-xs text-stone-500 mb-4">
                Nhập email để tự động gán quyền Admin khi đăng nhập.
              </p>

              <form onSubmit={handleAddAdminEmail} className="flex gap-2 mb-4">
                <input
                  type="email"
                  required
                  placeholder="nhanvien@gmail.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="flex-1 border border-[#fde2cb] bg-[#fffaf5] rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#ea8025] focus:bg-white text-stone-900"
                />
                <button
                  type="submit"
                  className="bg-[#ea8025] text-white font-bold text-xs px-4 rounded-2xl hover:bg-[#d46f19] transition-colors shadow-sm"
                >
                  Cấp quyền
                </button>
              </form>

              <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                <ShieldCheck size={14} className="text-[#ea8025]" />
                <span>Danh sách Admin hiện tại: {adminList.join(', ')}</span>
              </div>
            </div>

            {/* Danh sách người dùng */}
            <div className="bg-white rounded-3xl border border-[#fde8d7] p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                <div>
                  <h3 className="font-bold text-base text-[#451a03] flex items-center gap-2">
                    <Users className="text-[#ea8025]" size={20} /> Danh Sách Người Dùng ({users.length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    Toàn bộ tài khoản đã đăng ký trên hệ thống
                  </p>
                </div>
                <button
                  onClick={fetchAdminUsers}
                  className="text-xs font-bold text-[#ea8025] bg-[#fffaf5] border border-[#fde8d7] px-3 py-1.5 rounded-xl hover:bg-[#fde2cb] transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={12} className={loadingUsers ? 'animate-spin' : ''} />
                  <span>{loadingUsers ? 'Tải...' : 'Làm mới'}</span>
                </button>
              </div>

              {loadingUsers ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  Đang tải danh sách...
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 bg-[#fffaf5] rounded-2xl border border-[#fde8d7]">
                  <p className="text-stone-500 text-xs">Chưa có người dùng nào.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map((usr) => (
                    <div key={usr.id} className="bg-[#fffaf5] border border-[#fde8d7] rounded-3xl p-4 shadow-sm flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#ea8025] text-white flex items-center justify-center font-bold text-sm">
                            {usr.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#451a03]">{usr.name}</h4>
                            <p className="text-xs text-stone-500 flex items-center gap-1">
                              <Mail size={12} className="text-stone-400" /> {usr.email}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          usr.role === 'ADMIN'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}>
                          {usr.role === 'ADMIN' ? '🛡️ Admin' : '👤 Khách hàng'}
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 space-y-1.5 bg-white p-3 rounded-2xl border border-[#fde8d7]">
                        <p className="flex items-center gap-2">
                          <Phone size={13} className="text-[#ea8025] shrink-0" />
                          <span>{usr.phone || 'Chưa có SĐT'}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin size={13} className="text-[#ea8025] shrink-0" />
                          <span className="truncate">{usr.address || 'Chưa có địa chỉ'}</span>
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1 border-t border-stone-200/60 text-stone-500">
                        <span>Đã đặt: <strong className="text-[#ea8025]">{usr._count?.orders || 0} đơn</strong></span>
                        <span>Tham gia: {new Date(usr.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Pop-up Modal Thêm Món Nước Mới */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl animate-modal-pop border border-[#fde8d7]">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-[#451a03] flex items-center gap-2">
                <Coffee className="text-[#ea8025]" size={18} /> Thêm Món Nước Mới
              </h3>
              <button onClick={() => setIsAddProductModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#451a03] block mb-1">Tên món nước *</label>
                <input
                  type="text"
                  required
                  placeholder="Vd: Trà Olong Ổi Hồng"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full border border-[#fde2cb] bg-[#fffaf5] rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#ea8025] focus:bg-white text-stone-900 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#451a03] block mb-1">Giá bán (VND) *</label>
                <input
                  type="number"
                  required
                  placeholder="Vd: 65000"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className="w-full border border-[#fde2cb] bg-[#fffaf5] rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#ea8025] focus:bg-white text-stone-900 transition-all"
                />
              </div>

              {/* Tải Ảnh Từ Máy Tính */}
              <div>
                <label className="text-xs font-bold text-[#451a03] block mb-1">
                  Hình ảnh sản phẩm *
                </label>

                <div className="relative border-2 border-dashed border-[#fde2cb] hover:border-[#ea8025] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[#fffaf5]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-[#ea8025] text-xs font-bold py-2">
                      <Loader2 className="animate-spin" size={18} />
                      <span>Đang tải ảnh...</span>
                    </div>
                  ) : newProdImage ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border border-[#fde2cb] shrink-0">
                        <img src={newProdImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-emerald-700 block">✓ Ảnh đã sẵn sàng!</span>
                        <span className="text-[10px] text-stone-400">Bấm để đổi ảnh khác</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-stone-500 py-1.5">
                      <Upload className="text-[#ea8025]" size={22} />
                      <span className="text-xs font-bold text-[#451a03]">Bấm chọn ảnh từ máy tính</span>
                      <span className="text-[10px] text-stone-400">PNG, JPG, WEBP</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="flex-1 bg-[#fff3e8] text-[#ea8025] font-bold py-3 rounded-2xl text-xs hover:bg-[#fde2cb] transition-all border border-[#fde2cb]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-[#ea8025] text-white font-bold py-3 rounded-2xl text-xs hover:bg-[#d46f19] transition-all shadow-md disabled:opacity-50 active:scale-95"
                >
                  {uploading ? 'Đang tải...' : 'Thêm Món Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
