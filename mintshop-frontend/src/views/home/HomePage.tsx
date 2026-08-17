"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, User } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { AddToCartDrawer } from '@/components/AddToCartDrawer';
import { CartDrawer } from '@/components/CartDrawer';
import { AuthPopup } from '@/components/AuthPopup';
import { useCartStore } from '@/store/useCartStore';
import { useProductStore } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';

export function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { fetchProducts, getAvailableProducts } = useProductStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
    fetchProducts();
  }, [fetchProducts]);

  const cartItemsCount = useCartStore((state) => state.getTotalItemsCount());
  const products = isMounted ? getAvailableProducts() : [];

  const handleAddClick = (product: any) => {
    setSelectedProduct(product);
    setIsAddDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] pb-24 font-sans text-[#451a03]">
      {/* Top Header - Tinh Giản Sang Trọng */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#ea8025] to-[#d46f19] text-white px-4 py-3.5 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Mint Logo" className="h-12 object-contain" />
        </div>

        <button
          onClick={() => setIsAuthOpen(true)}
          className="w-10 h-10 rounded-2xl bg-white/20 border border-white/40 hover:bg-white/30 transition-all flex items-center justify-center text-white overflow-hidden relative shadow-sm"
        >
          {isMounted && isAuthenticated && user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : isMounted && isAuthenticated ? (
            <>
              <div className="w-full h-full bg-white/30 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full"></div>
            </>
          ) : (
            <User size={20} className="text-white" />
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-4 pt-5">
        {/* Category Header Title */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-extrabold text-base text-[#451a03]">
            Thực Đơn Đồ Uống
          </h2>
          <span className="text-xs font-bold text-[#ea8025]">
            {products.length} sản phẩm
          </span>
        </div>

        {/* Empty State vs Product List */}
        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-[#fde8d7] my-4 space-y-2">
            <p className="text-stone-600 font-bold text-sm">Chưa có sản phẩm nào trong thực đơn.</p>
            <p className="text-xs text-stone-400">Vui lòng đăng nhập tài khoản Admin để tạo các món nước đầu tiên!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddClick={handleAddClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-[#ea8025] text-white p-4 rounded-full shadow-xl shadow-[#ea8025]/30 hover:bg-[#d46f19] active:scale-95 transition-all flex items-center justify-center border-2 border-white"
      >
        <ShoppingCart size={22} />
        {isMounted && cartItemsCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#451a03] text-white text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
            {cartItemsCount}
          </span>
        )}
      </button>

      {/* Auth Popup */}
      <AuthPopup isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Drawers (Bottom Sheets) */}
      <AddToCartDrawer
        product={selectedProduct}
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
