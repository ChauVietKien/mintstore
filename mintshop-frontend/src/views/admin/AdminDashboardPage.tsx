"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrderStore, OrderStatus } from '@/store/useOrderStore';
import { useProductStore } from '@/store/useProductStore';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
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
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export function AdminDashboardPage() {
  const { user, logout } = useAuthStore();
  const { orders, fetchOrders, updateOrderStatus } = useOrderStore();
  const { products, fetchProducts, addProduct, toggleAvailability, deleteProduct } = useProductStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users'>('orders');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Form Thêm Món Nước Mới (Hỗ trợ Upload File trực tiếp lên Cloudinary)
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [cloudName, setCloudName] = useState('');
  const [uploading, setUploading] = useState(false);

  // Admin management
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminList, setAdminList] = useState(['maithanhda70@gmail.com']);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

  if (!isMounted) return null;

  // Protected Admin Check
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-200 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Truy Cập Bị Từ Chối</h2>
          <p className="text-slate-600 text-sm mb-6">
            Bạn cần đăng nhập bằng tài khoản Google được cấp quyền Admin (<span className="font-semibold text-emerald-700">maithanhda70@gmail.com</span>) để xem trang này.
          </p>
          <div className="flex gap-3">
            <Link 
              href="/" 
              className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all text-sm"
            >
              <Home size={18} /> Về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Thao tác Chọn File từ máy tính ➔ Tự động Upload lên Cloudinary qua Upload Preset
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file, cloudName || undefined);
      setNewProdImage(imageUrl);
      alert('Tải ảnh lên Cloudinary thành công!');
    } catch (err: any) {
      alert('Upload ảnh lên Cloudinary thất bại. Hãy kiểm tra tên Cloud Name của bạn hoặc chọn ảnh mẫu bên dưới.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      alert("Vui lòng điền tên món nước và giá cơ bản!");
      return;
    }

    const priceNum = parseFloat(newProdPrice);
    if (isNaN(priceNum)) {
      alert("Giá tiền không hợp lệ!");
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
    alert(`Đã thêm thành công món nước: ${newProdName} vào PostgreSQL Database!`);
  };

  const handleAddAdminEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || adminList.includes(newAdminEmail)) return;
    setAdminList([...adminList, newAdminEmail.trim()]);
    setNewAdminEmail('');
    alert(`Đã cấp quyền Admin cho email: ${newAdminEmail}`);
  };

  // Ưu tiên đơn đặt trước lên trên cùng (FIFO)
  const sortedOrders = [...orders].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  const filteredOrders = filterStatus === 'ALL' 
    ? sortedOrders 
    : sortedOrders.filter((o) => o.status === filterStatus);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock size={13} /> Chờ duyệt</span>;
      case 'BREWING':
        return <span className="bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Coffee size={13} /> Đang pha chế</span>;
      case 'DELIVERING':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Truck size={13} /> Đang giao</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={13} /> Hoàn thành</span>;
      case 'CANCELLED':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><X size={13} /> Đã hủy</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* Header Bar */}
      <header className="bg-emerald-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-700 rounded-xl flex items-center justify-center text-white font-black text-lg">
              M
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Mint Shop Admin</h1>
              <p className="text-xs text-emerald-300 mt-1">Quản lý Đơn hàng Realtime & PostgreSQL Database</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-800/80 border border-emerald-700/60 px-3 py-1.5 rounded-full text-xs">
              <ShieldCheck className="text-amber-400" size={16} />
              <span className="font-medium text-emerald-100">{user.email}</span>
              <span className="bg-amber-400 text-emerald-950 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">Super Admin</span>
            </div>

            <Link href="/" className="bg-emerald-800 hover:bg-emerald-700 text-white p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors">
              <Home size={18} />
              <span className="hidden md:inline">Về Shop</span>
            </Link>

            <button 
              onClick={logout}
              className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Thoát</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Navigation Tabs */}
        <div className="flex justify-between items-center border-b border-slate-200 mb-6 pb-2">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shrink-0 ${
                activeTab === 'orders'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShoppingBag size={18} /> Quản Lý Đơn Hàng ({orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length})
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shrink-0 ${
                activeTab === 'products'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Coffee size={18} /> Quản Lý Thực Đơn ({products.length})
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shrink-0 ${
                activeTab === 'users'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users size={18} /> Phân Quyền Admin ({adminList.length})
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              onClick={() => setIsAddProductModalOpen(true)}
              className="bg-[#d45836] text-white font-bold text-xs py-2.5 px-4 rounded-2xl flex items-center gap-1.5 hover:bg-[#b04529] transition-all shadow-sm shrink-0"
            >
              <Plus size={16} /> Thêm Món Nước Mới
            </button>
          )}
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
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                    filterStatus === st
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st === 'ALL' && 'Tất cả đơn'}
                  {st === 'PENDING' && '🟡 Chờ duyệt'}
                  {st === 'BREWING' && '🔵 Đang pha chế'}
                  {st === 'DELIVERING' && '🟣 Đang giao'}
                  {st === 'COMPLETED' && '🟢 Hoàn thành'}
                  {st === 'CANCELLED' && '🔴 Đã hủy'}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-200">
                Chưa có đơn hàng nào ở trạng thái này.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOrders.map((ord, idx) => (
                  <div key={ord.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative">
                    {/* Badge ưu tiên đơn đặt trước */}
                    {idx === 0 && ord.status === 'PENDING' && (
                      <div className="absolute -top-3 left-4 bg-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                        ⭐ Ưu tiên duyệt trước (#1)
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
                        <div>
                          <span className="font-mono text-xs text-slate-400 font-bold">#{ord.orderNumber}</span>
                          <h3 className="font-bold text-slate-900 text-base">{ord.customerName}</h3>
                          <p className="text-xs text-slate-500">{ord.customerPhone} • {ord.createdAt}</p>
                        </div>
                        <div>{getStatusBadge(ord.status)}</div>
                      </div>

                      <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        📍 <span className="font-medium">{ord.shippingAddress}</span>
                      </p>

                      {/* Order Items */}
                      <div className="space-y-2 mb-4">
                        {ord.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-sm border-b border-dashed border-slate-100 pb-1.5">
                            <div>
                              <span className="font-semibold text-slate-800">{item.quantity}x {item.name}</span>
                              {item.size && <span className="text-xs text-slate-500 ml-1">({item.size})</span>}
                              {item.note && <p className="text-xs text-amber-600 font-medium italic">Ghi chú: {item.note}</p>}
                            </div>
                            <span className="font-bold text-slate-700">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-100 mb-4">
                        <span className="text-xs text-slate-500 font-medium">Tổng tiền (Phí ship: {formatCurrency(ord.shippingFee)})</span>
                        <span className="text-base font-bold text-[#d45836]">{formatCurrency(ord.totalAmount)}</span>
                      </div>

                      {/* Action Buttons for Admin */}
                      <div className="flex gap-2">
                        {ord.status === 'PENDING' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'BREWING')}
                            className="flex-1 bg-sky-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-sky-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Coffee size={14} /> Duyệt & Pha chế
                          </button>
                        )}
                        {ord.status === 'BREWING' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'DELIVERING')}
                            className="flex-1 bg-purple-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Truck size={14} /> Giao hàng
                          </button>
                        )}
                        {ord.status === 'DELIVERING' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'COMPLETED')}
                            className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Check size={14} /> Hoàn thành
                          </button>
                        )}
                        {ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'CANCELLED')}
                            className="bg-slate-100 text-rose-600 hover:bg-rose-100 p-2 rounded-xl text-xs font-bold transition-colors"
                            title="Hủy đơn"
                          >
                            <X size={16} />
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
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Danh Sách Nước Uống ({products.length})</h2>
                <p className="text-xs text-slate-500">Gạt công tắc để Bật/Tắt còn hàng hoặc xóa món nước</p>
              </div>
              <button
                onClick={() => setIsAddProductModalOpen(true)}
                className="bg-[#d45836] text-white font-bold text-xs py-2.5 px-4 rounded-2xl flex items-center gap-1.5 hover:bg-[#b04529] transition-all shadow-sm"
              >
                <Plus size={16} /> Thêm Món Mới
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {products.map((p) => (
                <div key={p.id} className="py-4 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#fde9d6] rounded-full overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                      {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                      <p className="text-xs font-semibold text-[#d45836]">{formatCurrency(p.basePrice)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleAvailability(p.id)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                        p.isAvailable
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-rose-50 border-rose-300 text-rose-700'
                      }`}
                    >
                      {p.isAvailable ? '🟢 CÒN HÀNG' : '🔴 TẠM HẾT MÓN'}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa món "${p.name}"?`)) {
                          deleteProduct(p.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                      title="Xóa món"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PHÂN QUYỀN ADMIN */}
        {activeTab === 'users' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <UserPlus className="text-emerald-700" size={20} /> Cấp Quyền Admin Cho Tài Khoản Google Mới
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Nhập email Google của nhân viên/quản lý. Ngay khi họ bấm "Đăng nhập bằng Google", hệ thống sẽ tự động cấp quyền Admin.
            </p>

            <form onSubmit={handleAddAdminEmail} className="flex gap-3 mb-6">
              <input 
                type="email"
                required
                placeholder="Vd: nhanvien1@gmail.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="flex-1 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <button
                type="submit"
                className="bg-emerald-800 text-white font-bold text-sm px-6 rounded-2xl hover:bg-emerald-900 transition-colors shadow-sm"
              >
                Cấp quyền Admin
              </button>
            </form>

            <h3 className="font-bold text-sm text-slate-800 mb-3">Danh sách Email được cấp quyền Admin:</h3>
            <div className="space-y-2">
              {adminList.map((email, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <ShieldCheck className="text-emerald-600" size={16} /> {email}
                  </div>
                  {email === 'maithanhda70@gmail.com' ? (
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">Super Admin (Chủ)</span>
                  ) : (
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">Admin</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Pop-up Modal Thêm Món Nước Mới */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Coffee className="text-[#d45836]" size={20} /> Thêm Món Nước Mới
              </h3>
              <button onClick={() => setIsAddProductModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tên món nước *</label>
                <input 
                  type="text"
                  required
                  placeholder="Vd: Trà Ô Long Nhài Sữa"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d45836]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Giá cơ bản (VND) *</label>
                <input 
                  type="number"
                  required
                  placeholder="Vd: 65000"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d45836]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Cloud Name Cloudinary của bạn (Tùy chọn)</label>
                <input 
                  type="text"
                  placeholder="Vd: diyvzyawq"
                  value={cloudName}
                  onChange={(e) => setCloudName(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#d45836]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Tải Ảnh Từ Máy Tính (Preset: <span className="font-mono text-emerald-700">h40n7LG4wDvQ6A22x83u4qgKquo</span>)
                </label>
                
                <div className="relative border-2 border-dashed border-slate-200 hover:border-[#d45836] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50">
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-slate-600 text-xs py-2">
                      <Loader2 className="animate-spin text-[#d45836]" size={20} />
                      <span>Đang tải ảnh lên Cloudinary...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-500 py-1">
                      <Upload className="text-[#d45836]" size={24} />
                      <span className="text-xs font-bold text-slate-700">Bấm để chọn file ảnh từ máy tính</span>
                      <span className="text-[10px]">Định dạng PNG, JPG, WEBP (Tự động tải lên Cloudinary)</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Đường dẫn URL Ảnh (Tự động điền)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input 
                    type="url"
                    placeholder="https://res.cloudinary.com/..."
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d45836]"
                  />
                </div>
              </div>

              {newProdImage && (
                <div className="flex items-center gap-3 bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200">
                  <div className="w-12 h-12 rounded-xl bg-[#fde9d6] overflow-hidden shrink-0">
                    <img src={newProdImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-emerald-800 flex-1 truncate">Xem trước ảnh đã tải lên</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Hoặc chọn nhanh ảnh mẫu có sẵn:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    '/images/tra-olong-oi-hong.png',
                    '/images/tra-da-xay-oi-hong.png',
                    '/images/oi-hong-latte-matcha.png',
                    '/images/coldbrew-oi-hong.png',
                  ].map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewProdImage(imgUrl)}
                      className={`w-14 h-14 rounded-2xl bg-[#fde9d6] overflow-hidden border-2 transition-all ${
                        newProdImage === imgUrl ? 'border-[#d45836] scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl text-xs hover:bg-slate-200 transition-all"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-[#d45836] text-white font-bold py-3 rounded-2xl text-xs hover:bg-[#b04529] transition-all shadow-md disabled:opacity-50"
                >
                  {uploading ? 'Đang tải ảnh...' : 'Thêm Món Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
