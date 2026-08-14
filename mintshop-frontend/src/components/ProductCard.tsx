import React from 'react';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

interface ProductCardProps {
  product: any;
  onAddClick: (product: any) => void;
}

export function ProductCard({ product, onAddClick }: ProductCardProps) {
  return (
    <div className="flex bg-white rounded-2xl border border-slate-100 shadow-sm p-4 gap-4 items-center mb-4 hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative w-24 h-24 shrink-0 bg-[#fde9d6] rounded-full flex items-center justify-center overflow-hidden">
        {/* Vòng tròn nền (mô phỏng layout trên ảnh) */}
        <div className="absolute w-20 h-20 rounded-full bg-white/20"></div>
        {/* Placeholder for real image */}
        <div className="z-10 w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-xs text-slate-500 overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            "Img"
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between py-1 min-h-[96px]">
        <div>
          <h3 className="font-semibold text-slate-900 leading-tight line-clamp-2">
            {product.name}
          </h3>
          <p className="text-slate-600 font-medium mt-2">
            {formatCurrency(product.basePrice)}
          </p>
        </div>
        
        {/* Add Button */}
        <div className="flex justify-end mt-auto">
          <button
            onClick={() => onAddClick(product)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 active:scale-95 transition-all"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
