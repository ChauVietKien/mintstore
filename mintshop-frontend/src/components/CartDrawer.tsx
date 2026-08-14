import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItemsCount } = useCartStore();
  const router = useRouter();

  const handleGoToCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="pb-6 max-h-[65vh] flex flex-col bg-white">
        <DrawerHeader className="border-b border-slate-100 pb-3 shrink-0">
          <DrawerTitle className="text-left font-bold text-lg text-slate-900">Giỏ hàng của bạn</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
              <p className="text-sm">Giỏ hàng đang trống.</p>
              <Button variant="link" onClick={onClose} className="mt-1 text-[#d45836] font-semibold">
                Tiếp tục chọn món
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3.5 items-start bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {/* Item Image */}
                  <div className="w-14 h-14 rounded-full bg-[#fde9d6] flex-shrink-0 overflow-hidden shadow-inner">
                     {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">{item.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.size} {item.note && `• ${item.note}`}
                    </p>
                    <p className="font-bold text-[#d45836] text-sm mt-1.5">{formatCurrency(item.unitPrice)}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2.5 self-center">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95"
                    >
                      {item.quantity === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} />}
                    </button>
                    <span className="font-bold text-sm text-slate-900 w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-[#fdf2ee] text-[#d45836] border border-[#fbdad0] flex items-center justify-center hover:bg-[#fbdad0] active:scale-95"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <DrawerFooter className="border-t border-slate-100 pt-3 shrink-0 px-4">
            <div className="flex justify-between items-center mb-3 text-base font-bold">
              <span className="text-slate-700">Tổng cộng</span>
              <span className="text-[#d45836] text-lg">{formatCurrency(getTotalPrice())}</span>
            </div>
            <Button 
              onClick={handleGoToCheckout}
              className="w-full rounded-full h-13 text-[15px] font-bold bg-[#d45836] text-white hover:bg-[#b04529] transition-all shadow-md shadow-[#d45836]/20"
            >
              Thanh toán ({getTotalItemsCount()})
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
