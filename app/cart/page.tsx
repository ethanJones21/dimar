"use client";

import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import CartSuggestions from "./CartSuggestions";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-700 mb-2">Tu carrito está vacío</h1>
        <p className="text-slate-500 mb-8">Agrega productos para comenzar a comprar</p>
        <Link href="/products" className="btn-primary">
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Carrito de Compras</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => {
            const img = product.images?.[0] || "https://placehold.co/100x100";
            return (
              <div key={product.id} className="card p-4 flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={product.name} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Sin+imagen"; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${product.id}`} className="font-medium text-slate-800 hover:text-blue-600 line-clamp-2">
                    {product.name}
                  </Link>
                  <p className="text-blue-600 font-bold mt-1">{formatPrice(product.price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1.5 hover:bg-slate-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-medium">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, Math.min(product.stock, quantity + 1))}
                        className="p-1.5 hover:bg-slate-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm text-slate-500">=</span>
                    <span className="font-semibold text-slate-700">{formatPrice(product.price * quantity)}</span>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="ml-auto p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit sticky top-20">
          <h2 className="font-bold text-lg text-slate-800 mb-4">Resumen del Pedido</h2>
          <div className="space-y-3 mb-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-slate-600 truncate max-w-[170px]">{product.name} x{quantity}</span>
                <span className="font-medium">{formatPrice(product.price * quantity)}</span>
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span className="text-blue-600">{formatPrice(total())}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full text-center block">
            Proceder al Pago
          </Link>
          <Link href="/products" className="btn-secondary w-full text-center block mt-3">
            Seguir Comprando
          </Link>
        </div>
      </div>

      <CartSuggestions />
    </div>
  );
}
