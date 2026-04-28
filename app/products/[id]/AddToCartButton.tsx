"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { Product } from "@/types";
import { toast } from "@/components/ui/Toaster";

export default function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useCartStore((s) => s.openCartDrawer);

  const handleAdd = () => {
    addItem(product, quantity);
    openCartDrawer();
    toast(`"${product.name}" agregado al carrito`, "success");
  };

  if (product.stock === 0) {
    return (
      <div className="border-2 border-red-500 px-6 py-4 text-center">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-500">
          PRODUCTO AGOTADO
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Quantity stepper */}
      <div className="flex items-center border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] flex-shrink-0">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-11 h-11 flex items-center justify-center text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-colors cursor-pointer border-r-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)]"
          aria-label="Reducir cantidad"
        >
          <Minus size={15} strokeWidth={2.5} />
        </button>
        <span className="px-4 py-2 font-mono font-bold text-sm text-[#0A0A0A] dark:text-[#FAFAFA] min-w-[3rem] text-center">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          className="w-11 h-11 flex items-center justify-center text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-colors cursor-pointer border-l-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)]"
          aria-label="Aumentar cantidad"
        >
          <Plus size={15} strokeWidth={2.5} />
        </button>
      </div>

      {/* Add to cart CTA */}
      <button
        onClick={handleAdd}
        className="btn-primary flex-1 py-3 gap-3"
      >
        <ShoppingCart size={16} strokeWidth={2.5} />
        AGREGAR AL CARRITO
      </button>
    </div>
  );
}
