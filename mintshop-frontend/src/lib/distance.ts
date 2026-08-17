// Tọa độ cửa hàng Mint Shop chính (Đọc động từ file .env)
export const MINT_SHOP_LOCATION = {
  lat: process.env.NEXT_PUBLIC_SHOP_LAT ? parseFloat(process.env.NEXT_PUBLIC_SHOP_LAT) : 16.45234,
  lng: process.env.NEXT_PUBLIC_SHOP_LNG ? parseFloat(process.env.NEXT_PUBLIC_SHOP_LNG) : 107.5296657,
  name: 'Mint Shop (Hương Hồ)',
};

/**
 * Tính khoảng cách theo công thức Haversine giữa 2 tọa độ (đơn vị: KM)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number = MINT_SHOP_LOCATION.lat,
  lon2: number = MINT_SHOP_LOCATION.lng
): number {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return 0;
  }
  const R = 6371; // Bán kính Trái Đất (KM)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Làm tròn 1 chữ số thập phân (VD: 2.4 km)
}

/**
 * Tính khoảng cách thực tế theo ĐƯỜNG ĐI GIAO THÔNG (OSRM Driving Routing API - Miễn phí 100%)
 */
export async function calculateDrivingDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number = MINT_SHOP_LOCATION.lat,
  lon2: number = MINT_SHOP_LOCATION.lng
): Promise<number> {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`
    );
    const data = await res.json();
    if (data && data.routes && data.routes.length > 0) {
      const distanceMeters = data.routes[0].distance;
      const distanceKm = distanceMeters / 1000;
      return Math.round(distanceKm * 10) / 10;
    }
  } catch (err) {
    console.warn("Lỗi tra tuyến đường OSRM, fallback sang đường chim bay:", err);
  }
  return calculateDistanceKm(lat1, lon1, lat2, lon2);
}

/**
 * Tính phí giao hàng dựa trên khoảng cách KM thực tế:
 * - Đơn từ 150.000đ: MIỄN PHÍ giao hàng.
 * - Khoảng cách <= 2 KM: MIỄN PHÍ giao hàng.
 * - Khoảng cách > 2 KM: 15.000đ phí cơ bản + 5.000đ cho mỗi KM vượt.
 */
export function calculateShippingFeeByDistance(
  distanceKm: number,
  subtotal: number
): { shippingFee: number; isFreeShipping: boolean } {
  if (subtotal >= 150000 || subtotal === 0) {
    return { shippingFee: 0, isFreeShipping: true };
  }

  if (distanceKm <= 2) {
    return { shippingFee: 0, isFreeShipping: true };
  }

  const extraKm = Math.ceil(distanceKm - 2);
  const fee = 15000 + extraKm * 5000;
  return { shippingFee: fee, isFreeShipping: false };
}
