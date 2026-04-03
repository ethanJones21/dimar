"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Banner } from "@/types";

const FALLBACK_BANNERS: Banner[] = [
  {
    id: "fallback-1",
    title: "Bienvenido a Dimar Store",
    subtitle: "Descubre los mejores productos con precios increíbles.",
    badge: null,
    cta_text: "Ver Productos",
    cta_url: "/products",
    image_url: "",
    bg_color: "from-primary to-primary-dark",
    type: "hero",
    order_index: 0,
    active: true,
    created_at: "",
  },
];

export default function BannerSlider({ banners }: { banners: Banner[] }) {
  const slides = banners.length > 0 ? banners : FALLBACK_BANNERS;
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    [slides.length],
  );
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, slides.length]);

  const slide = slides[current];

  return (
    <div
      className={`relative bg-gradient-to-br ${slide.bg_color} text-white overflow-hidden h-[520px] md:h-[620px]`}
    >
      {/* Background image */}
      {slide.image_url && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={slide.image_url}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col items-center justify-center text-center gap-4">
        {slide.badge && (
          <span className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold px-4 py-1 rounded-full">
            {slide.badge}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight max-w-3xl text-balance">
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="text-base md:text-lg text-white/80 max-w-xl text-balance">
            {slide.subtitle}
          </p>
        )}
        {slide.cta_text && slide.cta_url && (
          <Link
            href={slide.cta_url}
            className="mt-2 inline-flex items-center gap-2 bg-white text-slate-800 font-semibold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors shadow-lg"
          >
            {slide.cta_text}
          </Link>
        )}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "w-6 bg-white" : "w-2 bg-white/40"
                }`}
                aria-label={`Ir a slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
