import React from 'react';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: any;
  onAddClick: (product: any) => void;
}

export function ProductCard({ product, onAddClick }: ProductCardProps) {
  return (
    <div className="flex bg-white rounded-3xl border border-[#f1ece4] shadow-sm p-4 gap-4 items-center mb-3 hover:shadow-md transition-all">
      {/* Product Image Container */}
      <div className="relative w-24 h-24 shrink-0 bg-[#fcf8f2] border border-[#f1ece4] rounded-2xl flex items-center justify-center overflow-hidden shadow-inner">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#fde9d6] flex items-center justify-center text-xs font-bold text-[#ea8025]">
            Mint
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between py-0.5 min-h-[90px]">
        <div>
          <h3 className="font-bold text-[#1c1917] text-base leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p className="text-[#ea8025] font-extrabold text-sm mt-1">
            {formatCurrency(product.basePrice)}
          </p>
        </div>
        
        {/* Plus Action Button */}
        <div className="flex justify-end mt-auto">
          <button
            onClick={() => onAddClick(product)}
            className="w-9 h-9 flex items-center justify-center rounded-2xl bg-[#ea8025] text-white hover:bg-[#d46f19] active:scale-95 transition-all shadow-sm"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
