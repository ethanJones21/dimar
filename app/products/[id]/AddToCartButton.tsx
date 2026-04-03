"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { Product } from "@/types";
import { toast } from "@/components/ui/Toaster";

export default function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem(product, quantity);
    toast(`"${product.name}" agregado al carrito`, "success");
  };

  if (product.stock === 0) {
    return (
      <div className="text-center py-4 bg-red-50 rounded-xl text-red-500 font-medium">
        Producto agotado
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border rounded-lg flex-shrink-0">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="p-2 hover:bg-surface-hover transition-colors"
        >
          <Minus size={16} />
        </button>
        <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
        <button
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          className="p-2 hover:bg-surface-hover transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
      <button onClick={handleAdd} className="btn-primary flex-1 flex items-center justify-center gap-2">
        <ShoppingCart size={18} />
        Agregar al carrito
      </button>
    </div>
  );
}
