"use client";

import { useRef } from "react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CartSuggestions from "./CartSuggestions";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const emptyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Empty state entrance
  useGSAP(
    () => {
      if (items.length > 0 || !emptyRef.current) return;
      const children = Array.from(emptyRef.current.children);
      gsap.fromTo(
        children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      );
    },
    { dependencies: [items.length] },
  );

  // Cart entrance
  useGSAP(
    () => {
      if (items.length === 0) return;

      const tl = gsap.timeline();

      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        );
      }

      if (itemsRef.current) {
        const cards = Array.from(itemsRef.current.children);
        tl.fromTo(
          cards,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power2.out" },
          "-=0.2",
        );
      }

      if (summaryRef.current) {
        tl.fromTo(
          summaryRef.current,
          { opacity: 0, x: 16 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
          "-=0.3",
        );
      }
    },
    { dependencies: [] },
  );

  // Banner scroll reveal
  useGSAP(
    () => {
      if (!bannerRef.current) return;
      gsap.fromTo(
        bannerRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: bannerRef.current,
            start: "top 88%",
          },
        },
      );
    },
    { dependencies: [] },
  );

  if (items.length === 0) {
    return (
      <div
        ref={emptyRef}
        className="max-w-2xl mx-auto px-4 py-20 text-center"
      >
        <ShoppingBag size={64} className="mx-auto text-content-subtle mb-4" />
        <h1 className="text-2xl font-bold text-content-base mb-2">
          Tu carrito está vacío
        </h1>
        <p className="text-content-muted mb-8">
          Agrega productos para comenzar a comprar
        </p>
        <Link href="/products" className="btn-primary">
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1
        ref={titleRef}
        className="text-3xl font-bold text-content-base mb-8"
      >
        Carrito de Compras
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div ref={itemsRef} className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => {
            const img = product.images?.[0] || "https://placehold.co/100x100";
            return (
              <div key={product.id} className="card p-4 flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-subtle flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/100x100?text=Sin+imagen";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${product.id}`}
                    className="font-medium text-content-base hover:text-primary line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <p className="text-primary font-bold mt-1">
                    {formatPrice(product.price)}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-line rounded-lg">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1.5 hover:bg-surface-hover transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            product.id,
                            Math.min(product.stock, quantity + 1),
                          )
                        }
                        className="p-1.5 hover:bg-surface-hover transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm text-content-subtle">=</span>
                    <span className="font-semibold text-content-base">
                      {formatPrice(product.price * quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="ml-auto p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
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
        <div ref={summaryRef} className="card p-6 h-fit sticky top-20">
          <h2 className="font-bold text-lg text-content-base mb-4">
            Resumen del Pedido
          </h2>
          <div className="space-y-3 mb-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-content-muted truncate max-w-[170px]">
                  {product.name} x{quantity}
                </span>
                <span className="font-medium">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>
          <hr className="my-4 border-line" />
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total())}</span>
          </div>
          <Link
            href="/checkout"
            className="btn-primary w-full text-center block"
          >
            Proceder al Pago
          </Link>
          <Link
            href="/products"
            className="btn-secondary w-full text-center block mt-3"
          >
            Seguir Comprando
          </Link>
        </div>
      </div>

      {/* ── Banner ofertas ── */}
      <div
        ref={bannerRef}
        className="mt-12 relative overflow-hidden rounded-2xl px-8 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
        style={{ backgroundColor: "#180F29" }}
      >
        <div className="absolute -right-10 -top-10 w-52 h-52 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute right-20 -bottom-8 w-36 h-36 bg-white/5 rounded-full pointer-events-none" />
        <div>
          <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
            Ofertas exclusivas
          </p>
          <h3 className="text-white text-2xl font-extrabold leading-tight mb-1">
            ¡Descuentos de hasta 70% OFF! 🔥
          </h3>
          <p className="text-slate-400 text-sm max-w-md">
            Mientras finalizas tu compra, no te pierdas nuestras mejores
            promociones del día.
          </p>
        </div>
        <Link
          href="/products?discount=10"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors text-sm shadow"
        >
          Ver ofertas <ArrowRight size={16} />
        </Link>
      </div>

      <CartSuggestions />
    </div>
  );
}
