import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    // Gọi API sang Backend Render để giữ server luôn trong trạng thái thức (Keep Alive)
    const response = await fetch(`${backendUrl}/products`, {
      cache: 'no-store',
    });
    
    const data = await response.json();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Vercel Cron Job đã chạy thành công & Giữ Render Backend luôn thức!',
      productCount: data?.data?.length || 0,
    });
  } catch (error: any) {
    console.error('Lỗi khi chạy Vercel Cron Job:', error.message);
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message,
    }, { status: 500 });
  }
}
