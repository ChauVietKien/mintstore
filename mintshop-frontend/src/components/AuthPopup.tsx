"use client";

import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  X, LogOut, LayoutDashboard, 
  User, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle
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
      setTimeout(() => onClose(), 1000);
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
    setMessage('Đang kiểm tra thông tin...');
    setIsError(false);

    const res = await loginWithEmail(email.trim(), password);
    setLoading(false);

    if (res.success) {
      setIsError(false);
      setMessage(`Đăng nhập thành công!`);

      if (res.role === 'ADMIN') {
        setTimeout(() => {
          onClose();
          router.push('/admin');
        }, 600);
      } else {
        setTimeout(() => onClose(), 800);
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
      setMessage('Vui lòng điền Họ tên, Email và Mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setIsError(true);
      setMessage('Mật khẩu tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);
    setMessage('Đang khởi tạo tài khoản...');
    setIsError(false);

    const res = await registerWithEmail(email.trim(), password, fullName.trim(), phone.trim());
    setLoading(false);

    if (res.success) {
      setIsError(false);
      setMessage(`Đăng ký thành công!`);

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
          className="bg-white rounded-3xl max-w-[390px] w-full shadow-2xl overflow-hidden animate-modal-pop border border-[#fde8d7]"
        >
          {/* Header Bar */}
          <div className="relative bg-gradient-to-br from-[#ea8025] to-[#d46f19] px-6 pt-6 pb-6 text-white overflow-hidden">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors z-20"
            >
              <X size={16} />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={28} className="text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-white">{user?.name}</h2>
                  <p className="text-amber-100 text-xs">{user?.email}</p>
                  <span className="inline-block mt-1 bg-white text-[#ea8025] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {user?.role === 'ADMIN' ? '👑 Super Admin' : 'Thành Viên'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                    M
                  </div>
                  <div>
                    <h2 className="text-lg font-bold leading-tight text-white">
                      Mint Shop
                    </h2>
                    <p className="text-amber-100 text-xs">Đăng nhập / Đăng ký tài khoản</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="px-6 py-5">
            {isAuthenticated ? (
              /* ===== ĐÃ ĐĂNG NHẬP ===== */
              <div className="space-y-2.5">
                {isAdmin && (
                  <Link 
                    href="/admin"
                    onClick={onClose}
                    className="w-full bg-[#ea8025] hover:bg-[#d46f19] text-white text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 uppercase tracking-wider"
                  >
                    <LayoutDashboard size={16} /> Vào Trang Quản Trị Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full bg-[#fff3e8] text-[#ea8025] text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#fde2cb] transition-colors border border-[#fde2cb]"
                >
                  <LogOut size={15} /> Đăng xuất tài khoản
                </button>
              </div>
            ) : (
              /* ===== CHƯA ĐĂNG NHẬP ===== */
              <div className="space-y-4">
                {/* Tabs */}
                <div className="flex bg-[#fff3e8] rounded-2xl p-1 border border-[#fde2cb]">
                  <button
                    onClick={() => { setActiveTab('login'); setMessage(''); setIsError(false); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'login'
                        ? 'bg-white text-[#ea8025] shadow-sm'
                        : 'text-stone-500 hover:text-[#ea8025]'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => { setActiveTab('register'); setMessage(''); setIsError(false); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'register'
                        ? 'bg-white text-[#ea8025] shadow-sm'
                        : 'text-stone-500 hover:text-[#ea8025]'
                    }`}
                  >
                    Tạo tài khoản
                  </button>
                </div>

                {activeTab === 'login' ? (
                  /* Form Đăng Nhập */
                  <form onSubmit={handleEmailLogin} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-[#451a03] block mb-1">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 text-amber-600/60" size={16} />
                        <input
                          type="email"
                          required
                          placeholder="maithanhda70@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full border border-[#fde2cb] bg-[#fffaf5] rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea8025] focus:bg-white text-[#451a03] transition-all placeholder:text-amber-800/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#451a03] block mb-1">Mật khẩu *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 text-amber-600/60" size={16} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full border border-[#fde2cb] bg-[#fffaf5] rounded-2xl pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea8025] focus:bg-white text-[#451a03] transition-all placeholder:text-amber-800/40"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-2.5 text-amber-600/60 hover:text-[#ea8025] transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#ea8025] hover:bg-[#d46f19] text-white font-bold text-xs py-3 rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 mt-1 uppercase tracking-wider"
                    >
                      {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP NGAY'}
                    </button>
                  </form>
                ) : (
                  /* Form Đăng Ký */
                  <form onSubmit={handleEmailRegister} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-[#451a03] block mb-1">Họ và tên *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 text-amber-600/60" size={16} />
                        <input
                          type="text"
                          required
                          placeholder="Vd: Nguyễn Văn A"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full border border-[#fde2cb] bg-[#fffaf5] rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea8025] focus:bg-white text-[#451a03] transition-all placeholder:text-amber-800/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#451a03] block mb-1">Email đăng ký *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 text-amber-600/60" size={16} />
                        <input
                          type="email"
                          required
                          placeholder="khachhang@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full border border-[#fde2cb] bg-[#fffaf5] rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea8025] focus:bg-white text-[#451a03] transition-all placeholder:text-amber-800/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#451a03] block mb-1">Tạo mật khẩu *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 text-amber-600/60" size={16} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="Tối thiểu 6 ký tự"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full border border-[#fde2cb] bg-[#fffaf5] rounded-2xl pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ea8025] focus:bg-white text-[#451a03] transition-all placeholder:text-amber-800/40"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-2.5 text-amber-600/60 hover:text-[#ea8025] transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#ea8025] hover:bg-[#d46f19] text-white font-bold text-xs py-3 rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 mt-1 uppercase tracking-wider"
                    >
                      {loading ? 'Đang khởi tạo...' : 'TẠO TÀI KHOẢN NGAY'}
                    </button>
                  </form>
                )}

                {/* Response Feedback */}
                {message && (
                  <div className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
                    isError 
                      ? 'bg-rose-50 border-rose-200 text-rose-700' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    {isError ? <AlertCircle size={15} className="shrink-0" /> : <CheckCircle2 size={15} className="shrink-0" />}
                    <span>{message}</span>
                  </div>
                )}

                {/* Divider */}
                <div className="relative pt-0.5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#fde2cb]"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-[10px] text-amber-800/60 font-bold uppercase">hoặc qua Google</span>
                  </div>
                </div>

                {/* Google Login */}
                <div className="flex justify-center pt-0.5">
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
