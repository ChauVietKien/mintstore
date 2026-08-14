"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, UserCircle } from 'lucide-react';
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

  const { getAvailableProducts } = useProductStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartItemsCount = useCartStore((state) => state.getTotalItemsCount());
  const products = isMounted ? getAvailableProducts() : [];

  const handleAddClick = (product: any) => {
    setSelectedProduct(product);
    setIsAddDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-emerald-800">Mint Shop</h1>
        <button 
          onClick={() => setIsAuthOpen(true)}
          className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors overflow-hidden relative"
        >
          {isMounted && isAuthenticated && user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : isMounted && isAuthenticated ? (
            <>
              <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></div>
            </>
          ) : (
            <UserCircle size={24} />
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 pt-6">
        {/* Product List */}
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddClick={handleAddClick} 
            />
          ))}
        </div>
      </main>

      {/* Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#d45836] text-white p-4 rounded-full shadow-lg shadow-[#d45836]/40 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
      >
        <ShoppingCart size={24} />
        {isMounted && cartItemsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
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
