import prisma from '../utils/prisma.js';
import { OrderStatus, PaymentMethod } from '@prisma/client';

// Tọa độ cửa hàng Mint Shop chính (Đọc động từ file .env Backend)
const MINT_SHOP_LOCATION = {
  lat: process.env.SHOP_LAT ? parseFloat(process.env.SHOP_LAT) : 16.45234,
  lng: process.env.SHOP_LNG ? parseFloat(process.env.SHOP_LNG) : 107.5296657,
};

function calculateDistanceKmServer(lat1: number, lon1: number): number {
  if (isNaN(lat1) || isNaN(lon1)) return 0;
  const R = 6371;
  const dLat = ((MINT_SHOP_LOCATION.lat - lat1) * Math.PI) / 180;
  const dLon = ((MINT_SHOP_LOCATION.lng - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((MINT_SHOP_LOCATION.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function createOrderInDb(payload: any, userId?: string | null) {
  const { customerName, customerPhone, shippingAddress, latitude, longitude, note, items, paymentMethod } = payload;

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { phone: customerPhone, address: shippingAddress },
    });
  }

  const firstProduct = await prisma.product.findFirst();
  const fallbackProductId = firstProduct?.id || '';

  // 1. Tải danh sách sản phẩm từ DB để đối soát giá chính xác (Chống hacker sửa giá trên Client)
  const itemProductIds = (items || []).map((i: any) => i.productId).filter(Boolean);
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: itemProductIds } },
  });
  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  // 2. Tính toán lại Subtotal trên Server
  let calculatedSubtotal = 0;
  const orderItemsData = (items || []).map((item: any) => {
    const dbProd = productMap.get(item.productId);
    
    // Nếu sản phẩm không còn tồn tại trong DB -> Báo lỗi rõ ràng từ chối tạo đơn
    if (item.productId && !dbProd) {
      throw new Error(`Sản phẩm "${item.name || 'này'}" hiện không còn bán trên hệ thống. Vui lòng chọn món khác!`);
    }

    const verifiedPrice = dbProd ? dbProd.basePrice : (item.price || item.unitPrice || 0);
    const quantity = item.quantity || 1;
    calculatedSubtotal += verifiedPrice * quantity;

    return {
      productId: item.productId || fallbackProductId,
      productName: dbProd ? dbProd.name : (item.name || 'Món nước'),
      size: item.size || 'Vừa',
      quantity,
      price: verifiedPrice,
      toppings: item.note || '',
    };
  });

  // 3. Tính toán lại Phí Ship trên Server (Chống hacker sửa phí ship)
  let calculatedShippingFee = 0;
  const numLat = latitude ? Number(latitude) : null;
  const numLng = longitude ? Number(longitude) : null;

  if (calculatedSubtotal < 150000 && calculatedSubtotal > 0) {
    if (numLat && numLng && !isNaN(numLat) && !isNaN(numLng)) {
      const distanceKm = calculateDistanceKmServer(numLat, numLng);
      if (distanceKm <= 2) {
        calculatedShippingFee = 0;
      } else {
        const extraKm = Math.ceil(distanceKm - 2);
        calculatedShippingFee = 15000 + extraKm * 5000;
      }
    } else {
      calculatedShippingFee = 15000; // Phí giao hàng tiêu chuẩn
    }
  }

  const calculatedTotalAmount = calculatedSubtotal + calculatedShippingFee;
  const orderNumber = `MINT-${Math.floor(1000 + Math.random() * 9000)}`;

  return await prisma.order.create({
    data: {
      orderNumber,
      userId,
      customerName,
      customerPhone,
      shippingAddress,
      latitude: numLat,
      longitude: numLng,
      note: note || '',
      totalAmount: calculatedTotalAmount,
      status: OrderStatus.PENDING,
      paymentMethod: (paymentMethod as PaymentMethod) || PaymentMethod.COD,
      items: {
        create: orderItemsData,
      },
    },
    include: { items: true },
  });
}

export async function getOrdersByUserIdFromDb(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllAdminOrdersFromDb() {
  return await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateOrderStatusInDb(id: string, status: OrderStatus) {
  return await prisma.order.update({
    where: { id },
    data: { status },
  });
}
