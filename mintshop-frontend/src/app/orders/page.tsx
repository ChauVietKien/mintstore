import { OrdersPage } from '@/views/orders/OrdersPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đơn Hàng Của Tôi - Mint Shop',
  description: 'Quản lý và theo dõi đơn hàng của bạn.',
};

export default function Orders() {
  return <OrdersPage />;
}
