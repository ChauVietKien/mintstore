"use client";

import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  X, ShieldCheck, LogOut, LayoutDashboard, 
  User, Mail, Lock, Eye, EyeOff, Sparkles,
  ShoppingBag, Heart, Clock
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
  const { user, isAuthenticated, isAdmin, loginWithGoogleToken, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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
    setMessage('Đăng nhập Google thất bại. Vui lòng thử lại.');
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Tính năng đăng nhập bằng Email đang phát triển. Vui lòng dùng Google!');
  };

  const handleEmailRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Tính năng đăng ký bằng Email đang phát triển. Vui lòng dùng Google!');
  };

  const handleLogout = () => {
    logout();
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Popup Card */}
        <div 
          className="bg-white rounded-3xl max-w-[400px] w-full shadow-2xl overflow-hidden"
          style={{ animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {/* Decorative Header */}
          <div className="relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 px-6 pt-6 pb-8 text-white overflow-hidden">
            {/* Floating circles decoration */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <X size={16} />
            </button>

            {isAuthenticated ? (
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mb-3 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-white/80" />
                  )}
                </div>
                <h2 className="text-lg font-bold">{user?.name}</h2>
                <p className="text-emerald-200 text-xs mt-0.5">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    {user?.role === 'ADMIN' ? '👑 Quản trị viên' : '🛒 Khách hàng'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles size={18} className="text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold leading-tight">Mint Shop</h2>
                    <p className="text-emerald-200 text-[11px]">Đặt nước uống dễ dàng & nhanh chóng</p>
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
                  <div className="bg-slate-50 rounded-2xl p-3 text-center">
                    <ShoppingBag size={18} className="mx-auto text-emerald-600 mb-1" />
                    <span className="text-xs text-slate-500 block">Đơn hàng</span>
                    <span className="text-sm font-bold text-slate-800">0</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 text-center">
                    <Heart size={18} className="mx-auto text-rose-500 mb-1" />
                    <span className="text-xs text-slate-500 block">Yêu thích</span>
                    <span className="text-sm font-bold text-slate-800">0</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 text-center">
                    <Clock size={18} className="mx-auto text-amber-500 mb-1" />
                    <span className="text-xs text-slate-500 block">Điểm tích</span>
                    <span className="text-sm font-bold text-slate-800">0</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {isAdmin && (
                  <Link 
                    href="/admin"
                    onClick={onClose}
                    className="w-full bg-emerald-700 text-white text-sm font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors shadow-sm"
                  >
                    <LayoutDashboard size={18} /> Vào Trang Quản Trị
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full bg-slate-100 text-slate-600 text-sm font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            ) : (
              /* ========== TRẠNG THÁI CHƯA ĐĂNG NHẬP ========== */
              <div className="space-y-4">
                {/* Login / Register Tabs */}
                <div className="flex bg-slate-100 rounded-2xl p-1">
                  <button
                    onClick={() => { setActiveTab('login'); setMessage(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      activeTab === 'login'
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => { setActiveTab('register'); setMessage(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      activeTab === 'register'
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Đăng ký
                  </button>
                </div>

                {activeTab === 'login' ? (
                  /* ===== TAB ĐĂNG NHẬP ===== */
                  <form onSubmit={handleEmailLogin} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                      <input
                        type="email"
                        placeholder="Email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <button type="button" className="text-xs text-emerald-700 font-medium hover:underline">
                        Quên mật khẩu?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-700 text-white font-bold text-sm py-3 rounded-2xl hover:bg-emerald-800 transition-colors shadow-sm active:scale-[0.98]"
                    >
                      Đăng nhập
                    </button>
                  </form>
                ) : (
                  /* ===== TAB ĐĂNG KÝ ===== */
                  <form onSubmit={handleEmailRegister} className="space-y-3">
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Họ và tên"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                      <input
                        type="email"
                        placeholder="Email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Tạo mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-700 text-white font-bold text-sm py-3 rounded-2xl hover:bg-emerald-800 transition-colors shadow-sm active:scale-[0.98]"
                    >
                      Đăng ký tài khoản
                    </button>
                  </form>
                )}

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-slate-400 font-medium">hoặc tiếp tục với</span>
                  </div>
                </div>

                {/* Google Login Button */}
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    shape="circle"
                    theme="outline"
                    text="continue_with"
                    width="340"
                  />
                </div>

                {loading && (
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    Đang kết nối...
                  </div>
                )}
                {message && (
                  <p className={`text-xs font-medium text-center ${message.includes('thất bại') || message.includes('phát triển') ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isAuthenticated && (
            <div className="px-6 pb-5 pt-0">
              <p className="text-center text-[10px] text-slate-400 leading-relaxed">
                Bằng việc tiếp tục, bạn đồng ý với{' '}
                <span className="text-emerald-600 font-medium cursor-pointer hover:underline">Điều khoản Sử dụng</span>
                {' '}và{' '}
                <span className="text-emerald-600 font-medium cursor-pointer hover:underline">Chính sách Bảo mật</span>
                {' '}của Mint Shop.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </GoogleOAuthProvider>
  );
}
