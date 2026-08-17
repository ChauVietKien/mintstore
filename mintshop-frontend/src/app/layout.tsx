import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mint Shop - Đặt Nước Uống Trực Tuyến",
  description: "Trang web đặt trà sữa, cà phê, nước ép đa dạng",
};

import { Toaster } from 'react-hot-toast';
import { BottomNav } from '@/components/BottomNav';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold' } }} />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
