"use client";

import { useRef } from "react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Flame } from "lucide-react";
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

  const noMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useGSAP(
    () => {
      if (items.length > 0 || !emptyRef.current || noMotion()) return;
      const children = Array.from(emptyRef.current.children);
      gsap.fromTo(children, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" });
    },
    { dependencies: [items.length] },
  );

  useGSAP(
    () => {
      if (items.length === 0 || noMotion()) return;
      const tl = gsap.timeline();
      if (titleRef.current)
        tl.fromTo(titleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
      if (itemsRef.current) {
        const cards = Array.from(itemsRef.current.children);
        tl.fromTo(cards, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power2.out" }, "-=0.2");
      }
      if (summaryRef.current)
        tl.fromTo(summaryRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, "-=0.3");
    },
    { dependencies: [] },
  );

  useGSAP(
    () => {
      if (!bannerRef.current || noMotion()) return;
      gsap.fromTo(bannerRef.current, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: bannerRef.current, start: "top 88%" },
      });
    },
    { dependencies: [] },
  );

  if (items.length === 0) {
    return (
      <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] min-h-screen flex items-center justify-center px-4">
        <div ref={emptyRef} className="text-center max-w-sm w-full">
          <div className="w-20 h-20 border-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] flex items-center justify-center mx-auto mb-8">
            <ShoppingBag size={36} className="text-[#888888]" strokeWidth={1.5} />
          </div>
          <h1
            className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA] mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1 }}
          >
            CARRITO<br />VACÍO
          </h1>
          <p className="text-xs font-mono text-[#888888] mb-8 uppercase tracking-widest">
            Agrega productos para comenzar a comprar
          </p>
          <Link href="/products" className="btn-primary py-4 px-10">
            VER PRODUCTOS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] min-h-screen">
      {/* ── Page header ── */}
      <div className="border-b-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1
            ref={titleRef}
            className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
            style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}
          >
            CARRITO
          </h1>
          <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mt-2">
            {items.reduce((s, i) => s + i.quantity, 0)} PRODUCTO{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "S" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Items */}
          <div ref={itemsRef} className="lg:col-span-2 space-y-0 border-t-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)]">
            {items.map(({ product, quantity }) => {
              const img = product.images?.[0] || "https://placehold.co/100x100";
              return (
                <div key={product.id} className="flex gap-4 p-5 border-b-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)]">
                  {/* Image */}
                  <div className="w-20 h-20 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.4)] overflow-hidden flex-shrink-0 bg-[#F0F0F0] dark:bg-[#1A1A1A]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Sin+imagen"; }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-display font-semibold text-sm text-[#0A0A0A] dark:text-[#FAFAFA] hover:text-primary line-clamp-2 leading-snug cursor-pointer"
                    >
                      {product.name}
                    </Link>
                    <p className="font-mono font-bold text-base text-primary mt-1">
                      {formatPrice(product.price)}
                    </p>

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {/* Quantity */}
                      <div className="flex items-center border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)]">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA] transition-colors cursor-pointer border-r border-[#0A0A0A] dark:border-[rgba(255,255,255,0.3)]"
                          aria-label="Reducir cantidad"
                        >
                          <Minus size={13} strokeWidth={2.5} />
                        </button>
                        <span className="px-3 text-xs font-mono font-bold text-[#0A0A0A] dark:text-[#FAFAFA] min-w-[2.5rem] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, Math.min(product.stock, quantity + 1))}
                          className="w-9 h-9 flex items-center justify-center hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA] transition-colors cursor-pointer border-l border-[#0A0A0A] dark:border-[rgba(255,255,255,0.3)]"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={13} strokeWidth={2.5} />
                        </button>
                      </div>

                      <span className="font-mono text-[10px] text-[#888888]">=</span>
                      <span className="font-mono font-bold text-sm text-[#0A0A0A] dark:text-[#FAFAFA]">
                        {formatPrice(product.price * quantity)}
                      </span>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="ml-auto p-2 text-red-500 hover:bg-red-600 hover:text-white border border-transparent hover:border-red-600 transition-colors cursor-pointer"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div ref={summaryRef}>
            <div className="border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] p-6 sticky top-24 bg-white dark:bg-[#111111] shadow-[5px_5px_0px_#0A0A0A] dark:shadow-[5px_5px_0px_rgba(255,255,255,0.3)]">
              <h2 className="font-display font-bold text-[10px] uppercase tracking-widest text-[#888888] mb-5 pb-3 border-b-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.3)]">
                RESUMEN DEL PEDIDO
              </h2>

              <div className="space-y-2 mb-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-xs font-mono">
                    <span className="text-[#888888] truncate max-w-[160px]">
                      {product.name} ×{quantity}
                    </span>
                    <span className="font-bold text-[#0A0A0A] dark:text-[#FAFAFA] flex-shrink-0 ml-2">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.3)] pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#888888]">TOTAL</span>
                  <span
                    className="font-mono font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
                    style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                  >
                    {formatPrice(total())}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full py-4 gap-3 mb-3">
                PROCEDER AL PAGO <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
              <Link href="/products" className="btn-secondary w-full py-3 text-center block">
                SEGUIR COMPRANDO
              </Link>
            </div>
          </div>
        </div>

        {/* ── Promo banner ── */}
        <div
          ref={bannerRef}
          className="mt-12 bg-[#0A0A0A] border-2 border-[#0A0A0A] p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-full border-l border-[rgba(255,255,255,0.05)] pointer-events-none" />
          <div>
            <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-2">
              HOY SOLAMENTE
            </p>
            <h3
              className="font-display font-bold text-white flex items-center gap-3"
              style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", letterSpacing: "-0.02em" }}
            >
              <Flame size={22} className="text-orange-400 flex-shrink-0" strokeWidth={2} />
              ¡DESCUENTOS DE HASTA 70% OFF!
            </h3>
            <p className="text-xs font-mono text-[#666666] mt-2 max-w-md">
              Mientras finalizas tu compra, no te pierdas nuestras mejores promociones del día.
            </p>
          </div>
          <Link
            href="/products?discount=10"
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-mono font-bold text-xs uppercase tracking-widest border-2 border-primary hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_rgba(255,255,255,0.3)] transition-all duration-150 cursor-pointer"
          >
            VER OFERTAS <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>

        <CartSuggestions />
      </div>
    </div>
  );
}
