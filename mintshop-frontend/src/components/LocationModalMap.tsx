"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X, Search, Navigation, MapPin, Home, Building2, School, Check, Loader2 } from 'lucide-react';
import { calculateDistanceKm, MINT_SHOP_LOCATION } from '@/lib/distance';

interface LocationModalMapProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onConfirm: (data: {
    address: string;
    latitude: number;
    longitude: number;
    distanceKm: number;
    addressType: 'HOME' | 'OFFICE' | 'SCHOOL' | 'OTHER';
  }) => void;
}

export default function LocationModalMap({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  initialAddress,
  onConfirm,
}: LocationModalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const searchTimeoutRef = useRef<any>(null);

  const validInitialLat = typeof initialLat === 'number' && !isNaN(initialLat) ? initialLat : MINT_SHOP_LOCATION.lat;
  const validInitialLng = typeof initialLng === 'number' && !isNaN(initialLng) ? initialLng : MINT_SHOP_LOCATION.lng;

  const [currentLat, setCurrentLat] = useState<number>(validInitialLat);
  const [currentLng, setCurrentLng] = useState<number>(validInitialLng);
  const [addressText, setAddressText] = useState<string>(initialAddress || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [addressType, setAddressType] = useState<'HOME' | 'OFFICE' | 'SCHOOL' | 'OTHER'>('HOME');
  const [isPinBouncing, setIsPinBouncing] = useState<boolean>(false);

  const safeLat = typeof currentLat === 'number' && !isNaN(currentLat) ? currentLat : MINT_SHOP_LOCATION.lat;
  const safeLng = typeof currentLng === 'number' && !isNaN(currentLng) ? currentLng : MINT_SHOP_LOCATION.lng;

  const distanceKm = calculateDistanceKm(safeLat, safeLng);

  // Khởi tạo bản đồ Leaflet chuẩn Google Maps Tile khi Modal mở
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      const targetLat = typeof currentLat === 'number' && !isNaN(currentLat) ? currentLat : MINT_SHOP_LOCATION.lat;
      const targetLng = typeof currentLng === 'number' && !isNaN(currentLng) ? currentLng : MINT_SHOP_LOCATION.lng;

      if (!mapInstanceRef.current) {
        // Khởi tạo bản đồ centered tại vị trí hiện tại
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([targetLat, targetLng], 17);

        // Sử dụng Tile Google Maps sắc nét mộc mượt 100%
        L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }).addTo(map);

        // Bắt sự kiện khi bắt đầu di chuyển bản đồ (Nhún ghim)
        map.on('movestart', () => {
          setIsPinBouncing(true);
        });

        // Bắt sự kiện khi dừng di chuyển bản đồ (Tự động nhận diện tâm bản đồ)
        map.on('moveend', async () => {
          setIsPinBouncing(false);
          const center = map.getCenter();
          const lat = center.lat;
          const lng = center.lng;

          setCurrentLat(lat);
          setCurrentLng(lng);

          // Reverse Geocode lấy địa chỉ từ tâm bản đồ
          setIsGeocoding(true);
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
            );
            const data = await res.json();
            if (data && data.display_name) {
              setAddressText(data.display_name);
            }
          } catch (err) {
            console.warn('Lỗi reverse geocode:', err);
          } finally {
            setIsGeocoding(false);
          }
        });

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setView([targetLat, targetLng], 17);
        mapInstanceRef.current.invalidateSize();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Tìm kiếm địa chỉ bằng gõ chữ (Search Autocomplete)
  const handleSearchAddress = async (query: string) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 3) return;

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=1&accept-language=vi`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setCurrentLat(lat);
          setCurrentLng(lng);
          setAddressText(data[0].display_name);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
          }
        }
      } catch (err) {
        console.warn('Lỗi tra cứu tìm kiếm:', err);
      } finally {
        setIsSearching(false);
      }
    }, 600);
  };

  // Định vị vị trí GPS hiện tại của thiết bị
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentLat(lat);
        setCurrentLng(lng);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1 });
        }
      },
      () => setIsGeocoding(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div className="bg-white w-full h-full md:h-[90vh] md:max-w-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header Modal */}
        <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between z-20">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <MapPin className="text-[#d45836]" size={20} /> Chọn Vị Trí Giao Nước
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Floating Search Input */}
        <div className="absolute top-16 left-4 right-4 z-20 max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 p-2 flex items-center gap-2">
            <Search className="text-slate-400 ml-2 shrink-0" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchAddress(e.target.value)}
              placeholder="Gõ tên đường, quận/huyện để tìm nhanh..."
              className="flex-1 text-xs text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 font-medium py-1"
            />
            {isSearching && <Loader2 size={16} className="animate-spin text-[#d45836] mr-2" />}
          </div>
        </div>

        {/* Container Bản đồ */}
        <div className="flex-1 relative w-full h-full overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Con ghim cố định TÂM màn hình (Grab / Uber Center Crosshair Pin Style) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20 pointer-events-none flex flex-col items-center">
            <div
              className={`transition-transform duration-200 ${
                isPinBouncing ? '-translate-y-3 scale-110' : 'translate-y-0'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#d45836] text-white flex items-center justify-center shadow-2xl border-2 border-white">
                <MapPin size={22} className="fill-white text-[#d45836]" />
              </div>
              <div className="w-2 h-2 bg-slate-900/40 rounded-full blur-[1px] mx-auto mt-1" />
            </div>
          </div>

          {/* Floating Action Button: GPS Vị trí của tôi */}
          <button
            type="button"
            onClick={handleLocateMe}
            className="absolute bottom-4 right-4 z-20 bg-white text-slate-800 p-3 rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-1 text-xs font-bold"
            title="Vị trí hiện tại của tôi"
          >
            <Navigation size={18} className="text-[#d45836]" />
          </button>
        </div>

        {/* Bottom Sheet thông tin & Nút xác nhận */}
        <div className="bg-white border-t border-slate-100 p-4 space-y-3.5 z-20 shadow-2xl">
          {/* Nhãn loại địa chỉ */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs text-slate-500 font-semibold shrink-0">Nhãn địa chỉ:</span>
            <button
              type="button"
              onClick={() => setAddressType('HOME')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border shrink-0 ${
                addressType === 'HOME'
                  ? 'bg-[#d45836] text-white border-[#d45836]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Home size={13} /> Nhà riêng
            </button>
            <button
              type="button"
              onClick={() => setAddressType('OFFICE')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border shrink-0 ${
                addressType === 'OFFICE'
                  ? 'bg-[#d45836] text-white border-[#d45836]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Building2 size={13} /> Văn phòng
            </button>
            <button
              type="button"
              onClick={() => setAddressType('SCHOOL')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border shrink-0 ${
                addressType === 'SCHOOL'
                  ? 'bg-[#d45836] text-white border-[#d45836]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <School size={13} /> Trường học
            </button>
          </div>

          {/* Địa chỉ & Khoảng cách KM */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900 truncate pr-2">
                {isGeocoding ? 'Đang nhận diện địa chỉ...' : addressText || 'Vị trí đã ghim'}
              </span>
              <span className="bg-[#fdf2ee] text-[#d45836] font-extrabold px-2.5 py-0.5 rounded-full border border-[#fde2cb] text-[11px] shrink-0">
                ⚡ Cách quán {distanceKm} KM
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{addressText}</p>
          </div>

          {/* Button Xác Nhận */}
          <button
            type="button"
            onClick={() => {
              onConfirm({
                address: addressText,
                latitude: currentLat,
                longitude: currentLng,
                distanceKm,
                addressType,
              });
              onClose();
            }}
            className="w-full bg-[#d45836] hover:bg-[#b04529] text-white font-bold py-3.5 rounded-full text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <Check size={18} /> XÁC NHẬN VỊ TRÍ GIAO NƯỚC NÀY
          </button>
        </div>
      </div>
    </div>
  );
}
