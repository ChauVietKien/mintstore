import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Minus, Plus, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';

interface AddToCartDrawerProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToCartDrawer({ product, isOpen, onClose }: AddToCartDrawerProps) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes?.[0] || { name: 'Vừa', extraPrice: 0 }
  );

  const addItem = useCartStore((state) => state.addItem);

  if (!product) return null;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      basePrice: product.basePrice,
      size: selectedSize.name,
      sizeExtraPrice: selectedSize.extraPrice,
      sugarLevel: "100%",
      iceLevel: "100%",
      toppings: [],
      note: note,
      quantity: quantity,
    });
    onClose();
  };

  const totalPrice = (product.basePrice + selectedSize.extraPrice) * quantity;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="pb-6 max-h-[65vh] flex flex-col bg-white">
        <DrawerHeader className="relative flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
          <DrawerTitle className="text-center w-full font-bold text-slate-900 text-base">Thêm vào giỏ</DrawerTitle>
          <button onClick={onClose} className="absolute right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </DrawerHeader>

        <div className="p-4 flex flex-col items-center flex-1 overflow-y-auto">
          {/* Image */}
          <div className="w-28 h-28 bg-[#fde9d6] rounded-full flex items-center justify-center mb-3 overflow-hidden shrink-0 shadow-inner">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-[85%] h-[85%] object-cover rounded-full" />
            ) : (
              <div className="w-full h-full bg-slate-100" />
            )}
          </div>

          {/* Product Info */}
          <h3 className="text-lg font-bold text-center text-slate-900 mb-1">{product.name}</h3>
          <p className="text-[#d45836] font-bold text-base mb-5">{formatCurrency(product.basePrice)}</p>

          {/* Sizes Options */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="w-full mb-5 shrink-0">
              <p className="font-semibold text-slate-800 text-sm mb-2.5">Chọn Size</p>
              <div className="flex gap-3">
                {product.sizes.map((size: any) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-sm transition-all ${
                      selectedSize.name === size.name
                        ? 'border-[#d45836] bg-[#fdf2ee] text-[#d45836] font-bold shadow-sm'
                        : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {size.name}
                    {size.extraPrice > 0 && <span className="block text-xs text-slate-500 font-normal">+{formatCurrency(size.extraPrice)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Note Section */}
          <div className="w-full mb-5 shrink-0">
             <p className="font-semibold text-slate-800 text-sm mb-2">Ghi chú cho quán</p>
             <textarea 
               value={note}
               onChange={(e) => setNote(e.target.value)}
               placeholder="Vd: Ít đá, nhiều đường..."
               className="w-full h-16 border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d45836] focus:bg-white transition-all"
             />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-5 mb-2 shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
            >
              <Minus size={16} />
            </button>
            <span className="text-base font-bold w-6 text-center text-slate-900">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 rounded-full bg-[#fdf2ee] text-[#d45836] border border-[#fbdad0] flex items-center justify-center hover:bg-[#fbdad0] active:scale-95 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <DrawerFooter className="border-t border-slate-100 pt-3 shrink-0 px-4">
          <Button 
            onClick={handleAddToCart}
            className="w-full rounded-full h-13 text-[15px] font-bold bg-[#d45836] text-white hover:bg-[#b04529] transition-all shadow-md shadow-[#d45836]/20"
          >
            <Plus className="mr-1.5" size={18} /> THÊM VÀO GIỎ - {formatCurrency(totalPrice)}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
