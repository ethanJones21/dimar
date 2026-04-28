"use client";

import Link from "next/link";
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { useEffect } from "react";

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const cartDrawerOpen = useCartStore((s) => s.cartDrawerOpen);
  const closeCartDrawer = useCartStore((s) => s.closeCartDrawer);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const total = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  );

  useEffect(() => {
    if (cartDrawerOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [cartDrawerOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeCartDrawer(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeCartDrawer]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCartDrawer}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/60 z-[90] transition-opacity duration-300 ${
          cartDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed top-0 right-0 h-full w-96 max-w-[92vw] bg-[#FAFAFA] dark:bg-[#111111] z-[100] border-l-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] flex flex-col transition-transform duration-300 ease-in-out ${
          cartDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.3)] flex-shrink-0">
          <div className="flex items-baseline gap-3">
            <h2 className="font-display font-bold text-base uppercase tracking-widest text-[#0A0A0A] dark:text-[#FAFAFA]">
              CARRITO
            </h2>
            {items.length > 0 && (
              <span className="text-[10px] font-mono text-[#888888]">
                ({items.reduce((s, i) => s + i.quantity, 0)})
              </span>
            )}
          </div>
          <button
            onClick={closeCartDrawer}
            aria-label="Cerrar carrito"
            className="p-1.5 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-colors cursor-pointer"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
              <div className="w-16 h-16 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] flex items-center justify-center">
                <ShoppingBag size={32} className="text-[#888888]" />
              </div>
              <div>
                <p className="font-display font-bold text-sm uppercase tracking-widest text-[#0A0A0A] dark:text-[#FAFAFA] mb-1">
                  CARRITO VACÍO
                </p>
                <p className="text-xs font-mono text-[#888888]">
                  Agrega productos para continuar
                </p>
              </div>
              <Link href="/products" onClick={closeCartDrawer} className="btn-primary text-xs py-2">
                VER PRODUCTOS
              </Link>
            </div>
          ) : (
            <div className="divide-y-2 divide-[#0A0A0A] dark:divide-[rgba(255,255,255,0.2)]">
              {items.map(({ product, quantity }) => {
                const img = product.images?.[0] || "https://placehold.co/80x80?text=Sin+imagen";
                return (
                  <div key={product.id} className="flex gap-3 p-4">
                    {/* Image */}
                    <div className="w-16 h-16 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.4)] overflow-hidden flex-shrink-0 bg-[#F0F0F0] dark:bg-[#1A1A1A]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/80x80?text=Sin+imagen";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${product.id}`}
                        onClick={closeCartDrawer}
                        className="text-xs font-display font-semibold text-[#0A0A0A] dark:text-[#FAFAFA] hover:text-primary line-clamp-2 leading-snug cursor-pointer"
                      >
                        {product.name}
                      </Link>
                      <p className="font-mono font-bold text-sm text-primary mt-0.5">
                        {formatPrice(product.price * quantity)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        {/* Quantity control */}
                        <div className="flex items-center border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)]">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="px-2 py-1 hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-colors cursor-pointer text-[#0A0A0A] dark:text-[#FAFAFA]"
                            aria-label="Reducir cantidad"
                          >
                            <Minus size={11} strokeWidth={2.5} />
                          </button>
                          <span className="px-3 text-xs font-mono font-bold text-[#0A0A0A] dark:text-[#FAFAFA] min-w-[2rem] text-center border-x-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)]">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, Math.min(product.stock, quantity + 1))}
                            className="px-2 py-1 hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-colors cursor-pointer text-[#0A0A0A] dark:text-[#FAFAFA]"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={11} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(product.id)}
                          className="ml-auto p-1.5 text-red-500 hover:bg-red-600 hover:text-white border border-transparent hover:border-red-600 transition-colors cursor-pointer"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 size={13} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex-shrink-0 p-5 border-t-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.3)] space-y-3 bg-[#FAFAFA] dark:bg-[#111111]">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#888888]">
                TOTAL
              </span>
              <span className="font-mono font-bold text-2xl text-[#0A0A0A] dark:text-[#FAFAFA]">
                {formatPrice(total)}
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCartDrawer}
              className="btn-primary w-full text-center py-4 gap-3"
            >
              PROCEDER AL PAGO
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>

            <Link
              href="/cart"
              onClick={closeCartDrawer}
              className="btn-secondary w-full text-center block py-3"
            >
              VER CARRITO
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
