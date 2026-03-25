"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { Product } from "@/types";
import { toast } from "@/components/ui/Toaster";
import Link from "next/link";

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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-600">Cantidad:</span>
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 hover:bg-slate-50 transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="p-2 hover:bg-slate-50 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleAdd} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <ShoppingCart size={18} />
          Agregar al carrito
        </button>
        <Link
          href="/cart"
          onClick={handleAdd}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          Comprar ahora
        </Link>
      </div>
    </div>
  );
}
