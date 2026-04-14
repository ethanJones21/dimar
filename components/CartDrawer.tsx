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

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (cartDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartDrawerOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCartDrawer();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeCartDrawer]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCartDrawer}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-[90] transition-opacity duration-300 ${
          cartDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed top-0 right-0 h-full w-96 max-w-[92vw] bg-surface-base z-[100] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          cartDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-line-subtle flex-shrink-0">
          <h2 className="font-bold text-lg text-content-base">
            Carrito
            {items.length > 0 && (
              <span className="ml-2 text-sm font-normal text-content-subtle">
                ({items.reduce((s, i) => s + i.quantity, 0)} productos)
              </span>
            )}
          </h2>
          <button
            onClick={closeCartDrawer}
            aria-label="Cerrar carrito"
            className="p-2 rounded-lg text-content-subtle hover:text-content-base hover:bg-surface-subtle transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo scrolleable */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <ShoppingBag size={52} className="text-content-subtle" />
              <p className="text-content-muted font-medium">
                Tu carrito está vacío
              </p>
              <Link
                href="/products"
                onClick={closeCartDrawer}
                className="btn-primary text-sm"
              >
                Ver Productos
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-line-subtle">
              {items.map(({ product, quantity }) => {
                const img =
                  product.images?.[0] ||
                  "https://placehold.co/80x80?text=Sin+imagen";
                return (
                  <div key={product.id} className="flex gap-3 p-4">
                    {/* Imagen */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-subtle flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/80x80?text=Sin+imagen";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${product.id}`}
                        onClick={closeCartDrawer}
                        className="text-sm font-medium text-content-base hover:text-primary line-clamp-2 leading-snug"
                      >
                        {product.name}
                      </Link>
                      <p className="text-primary font-bold text-sm mt-0.5">
                        {/* {formatPrice(product.price)} */}
                        {formatPrice(product.price * quantity)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {/* Control de cantidad */}
                        <div className="flex items-center border border-line rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity - 1)
                            }
                            className="p-1 hover:bg-surface-hover transition-colors rounded-l-lg"
                            aria-label="Reducir cantidad"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2.5 text-xs font-semibold min-w-[1.75rem] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                product.id,
                                Math.min(product.stock, quantity + 1),
                              )
                            }
                            className="p-1 hover:bg-surface-hover transition-colors rounded-r-lg"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Eliminar */}
                        <button
                          onClick={() => removeItem(product.id)}
                          className="ml-auto p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie: total + botones */}
        {items.length > 0 && (
          <div className="flex-shrink-0 p-5 border-t border-line-subtle space-y-3 bg-surface-base">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-content-base">Total</span>
              <span className="font-bold text-xl text-primary">
                {formatPrice(total)}
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCartDrawer}
              className="btn-primary w-full text-center flex items-center justify-center gap-2"
            >
              Proceder al Pago
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/cart"
              onClick={closeCartDrawer}
              className="btn-secondary w-full text-center block"
            >
              Ver todos
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
