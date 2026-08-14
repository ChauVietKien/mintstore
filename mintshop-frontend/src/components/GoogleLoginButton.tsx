import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "102552181823-b2sm2hnide622rig9lscr3rceci1i6ac.apps.googleusercontent.com";

export function GoogleLoginButton() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, loginWithGoogleToken, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    setMessage('Đang xác thực với Google Server...');
    
    const res = await loginWithGoogleToken(credentialResponse.credential);
    setLoading(false);
    setMessage(res.message);

    // Chuẩn quy trình: Nếu tài khoản Đăng nhập bằng Google mang quyền ADMIN, tự động vào ngay trang Admin!
    if (res.role === 'ADMIN') {
      router.push('/admin');
    }
  };

  const handleError = () => {
    console.error('Đăng nhập Google thất bại');
    setMessage('Đăng nhập Google thất bại.');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="w-full flex flex-col items-center gap-3">
        {isAuthenticated ? (
          <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
              <ShieldCheck className="text-emerald-600" size={20} />
              <span>Xin chào, {user?.name || user?.email}</span>
            </div>
            
            <p className="text-xs text-emerald-700">
              Quyền hạn: <span className="font-bold uppercase bg-emerald-200 px-2 py-0.5 rounded-full">{user?.role}</span>
            </p>

            <div className="flex gap-2 w-full mt-1">
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="flex-1 bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-emerald-800 transition-colors shadow-sm"
                >
                  <LayoutDashboard size={16} /> Trang Admin Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1 hover:bg-slate-300 transition-colors"
              >
                <LogOut size={15} /> Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-3">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              shape="circle"
              theme="outline"
              text="signin_with"
            />

            {loading && <p className="text-xs text-slate-500 animate-pulse">Đang xác thực với Google & Backend...</p>}
            {message && <p className="text-xs text-emerald-600 font-medium">{message}</p>}
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
