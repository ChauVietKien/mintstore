"use client";

import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  X, ShieldCheck, LogOut, LayoutDashboard, 
  User, Mail, Lock, Eye, EyeOff, Sparkles,
  ShoppingBag, Heart, Clock, Phone, CheckCircle2, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "102552181823-b2sm2hnide622rig9lscr3rceci1i6ac.apps.googleusercontent.com";

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthPopup({ isOpen, onClose }: AuthPopupProps) {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, loginWithGoogleToken, loginWithEmail, registerWithEmail, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    setMessage('Đang xác thực với Google...');
    setIsError(false);
    
    const res = await loginWithGoogleToken(credentialResponse.credential);
    setLoading(false);
    setMessage(res.message);

    if (res.role === 'ADMIN') {
      onClose();
      router.push('/admin');
    } else if (res.success) {
      setTimeout(() => onClose(), 1200);
    }
  };

  const handleGoogleError = () => {
    setIsError(true);
    setMessage('Đăng nhập Google thất bại. Vui lòng thử lại.');
  };

  // Đăng Nhập Bằng Form Email/Mật khẩu
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setIsError(true);
      setMessage('Vui lòng điền đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    setMessage('Đang kiểm tra thông tin đăng nhập...');
    setIsError(false);

    const res = await loginWithEmail(email.trim(), password);
    setLoading(false);

    if (res.success) {
      setIsError(false);
      setMessage(`Đăng nhập thành công! ${res.role === 'ADMIN' ? 'Đang mở trang Admin...' : ''}`);

      if (res.role === 'ADMIN') {
        setTimeout(() => {
          onClose();
          router.push('/admin');
        }, 800);
      } else {
        setTimeout(() => onClose(), 1000);
      }
    } else {
      setIsError(true);
      setMessage(res.message);
    }
  };

  // Đăng Ký Bằng Form Email/Mật khẩu
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setIsError(true);
      setMessage('Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setIsError(true);
      setMessage('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);
    setMessage('Đang tạo tài khoản trong PostgreSQL Database...');
    setIsError(false);

    const res = await registerWithEmail(email.trim(), password, fullName.trim(), phone.trim());
    setLoading(false);

    if (res.success) {
      setIsError(false);
      setMessage(`Đăng ký thành công! ${res.role === 'ADMIN' ? 'Đã gán quyền Admin. Đang chuyển trang...' : ''}`);

      if (res.role === 'ADMIN') {
        setTimeout(() => {
          onClose();
          router.push('/admin');
        }, 1000);
      } else {
        setTimeout(() => onClose(), 1200);
      }
    } else {
      setIsError(true);
      setMessage(res.message);
    }
  };

  const handleLogout = () => {
    logout();
    setMessage('');
    setIsError(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Popup Card */}
        <div 
          className="bg-white rounded-3xl max-w-[410px] w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        >
          {/* Decorative Header */}
          <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 px-6 pt-6 pb-8 text-white overflow-hidden">
            {/* Floating circles decoration */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-20"
            >
              <X size={16} />
            </button>

            {isAuthenticated ? (
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mb-3 overflow-hidden shadow-inner">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-white/90" />
                  )}
                </div>
                <h2 className="text-lg font-bold">{user?.name}</h2>
                <p className="text-emerald-200 text-xs mt-0.5">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="bg-amber-400 text-emerald-950 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                    {user?.role === 'ADMIN' ? '👑 Super Admin' : '🛒 Thành viên'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner">
                    M
                  </div>
                  <div>
                    <h2 className="text-xl font-bold leading-tight flex items-center gap-1.5">
                      Mint Shop <Sparkles size={16} className="text-amber-300 fill-amber-300" />
                    </h2>
                    <p className="text-emerald-200 text-xs">Đặt trà sữa & nước uống ngon ngất ngây</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Body */}
          <div className="px-6 py-5">
            {isAuthenticated ? (
              /* ========== TRẠNG THÁI ĐÃ ĐĂNG NHẬP ========== */
              <div className="space-y-3">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                    <ShoppingBag size={18} className="mx-auto text-emerald-600 mb-1" />
                    <span className="text-[11px] text-slate-500 block">Đơn hàng</span>
                    <span className="text-sm font-bold text-slate-800">100% Ok</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                    <Heart size={18} className="mx-auto text-rose-500 mb-1" />
                    <span className="text-[11px] text-slate-500 block">Yêu thích</span>
                    <span className="text-sm font-bold text-slate-800">Trà Olong</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                    <Clock size={18} className="mx-auto text-amber-500 mb-1" />
                    <span className="text-[11px] text-slate-500 block">Tích điểm</span>
                    <span className="text-sm font-bold text-slate-800">500đ</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {isAdmin && (
                  <Link 
                    href="/admin"
                    onClick={onClose}
                    className="w-full bg-emerald-800 text-white text-sm font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-900 transition-all shadow-md active:scale-95"
                  >
                    <LayoutDashboard size={18} /> Vào Trang Quản Trị Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full bg-slate-100 text-slate-700 text-sm font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                >
                  <LogOut size={16} /> Đăng xuất tài khoản
                </button>
              </div>
            ) : (
              /* ========== TRẠNG THÁI CHƯA ĐĂNG NHẬP ========== */
              <div className="space-y-4">
                {/* Login / Register Tabs */}
                <div className="flex bg-slate-100 rounded-2xl p-1 border border-slate-200/60">
                  <button
                    onClick={() => { setActiveTab('login'); setMessage(''); setIsError(false); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                      activeTab === 'login'
                        ? 'bg-white text-emerald-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => { setActiveTab('register'); setMessage(''); setIsError(false); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                      activeTab === 'register'
                        ? 'bg-white text-emerald-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Tạo tài khoản mới
                  </button>
                </div>

                {activeTab === 'login' ? (
                  /* ===== TAB ĐĂNG NHẬP ===== */
                  <form onSubmit={handleEmailLogin} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                        <input
                          type="email"
                          required
                          placeholder="Vd: maithanhda70@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white bg-slate-50 text-slate-900 placeholder:text-slate-400 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Mật khẩu *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full border border-slate-200 rounded-2xl pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white bg-slate-50 text-slate-900 placeholder:text-slate-400 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 mt-1"
                    >
                      {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP NGAY'}
                    </button>
                  </form>
                ) : (
                  /* ===== TAB ĐĂNG KÝ ===== */
                  <form onSubmit={handleEmailRegister} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Họ và tên *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
                        <input
                          type="text"
                          required
                          placeholder="Vd: Nguyễn Văn A"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white bg-slate-50 text-slate-900 placeholder:text-slate-400 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Email đăng ký *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                        <input
                          type="email"
                          required
                          placeholder="Vd: khachhang@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white bg-slate-50 text-slate-900 placeholder:text-slate-400 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Số điện thoại (Tùy chọn)</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 text-slate-400" size={16} />
                        <input
                          type="tel"
                          placeholder="Vd: 0901234567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white bg-slate-50 text-slate-900 placeholder:text-slate-400 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Tạo mật khẩu *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="Tối thiểu 6 ký tự"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full border border-slate-200 rounded-2xl pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white bg-slate-50 text-slate-900 placeholder:text-slate-400 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 mt-1"
                    >
                      {loading ? 'Đang tạo tài khoản...' : 'TẠO TÀI KHOẢN NGAY'}
                    </button>
                  </form>
                )}

                {/* Feedback Messages */}
                {message && (
                  <div className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
                    isError 
                      ? 'bg-rose-50 border-rose-200 text-rose-700' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    {isError ? <AlertCircle size={16} className="shrink-0" /> : <CheckCircle2 size={16} className="shrink-0" />}
                    <span>{message}</span>
                  </div>
                )}

                {/* Divider */}
                <div className="relative pt-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">hoặc đăng nhập bằng Google</span>
                  </div>
                </div>

                {/* Google Login Button */}
                <div className="flex justify-center pt-1">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    shape="circle"
                    theme="outline"
                    text="continue_with"
                    width="340"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
