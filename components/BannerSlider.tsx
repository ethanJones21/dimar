"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Banner } from "@/types";
import { bannerUrl } from "@/lib/media";

gsap.registerPlugin(useGSAP);

const FALLBACK_BANNERS: Banner[] = [
  {
    id: "fallback-1",
    title: "Bienvenido a Dimar Store",
    subtitle: "Descubre los mejores productos con precios increíbles.",
    badge: "NUEVA TEMPORADA",
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

const SLIDE_BG = [
  { bg: "#2563EB", accent: "#FAFAFA" },
  { bg: "#7C3AED", accent: "#FAFAFA" },
  { bg: "#EB9626", accent: "#FAFAFA" },
  { bg: "#FAFAFA", accent: "#0A0A0A" },
];

export default function BannerSlider({ banners }: { banners: Banner[] }) {
  const slides = banners.length > 0 ? banners : FALLBACK_BANNERS;
  const [current, setCurrent] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    [slides.length],
  );
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next, slides.length]);

  // Kinetic entrance on each slide change
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!contentRef.current) return;

      const items = Array.from(contentRef.current.children);
      gsap.fromTo(
        items,
        { opacity: 0, y: 40, skewY: 2 },
        {
          opacity: 1,
          y: 0,
          skewY: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
        },
      );
    },
    { scope: contentRef, dependencies: [current] },
  );

  const slide = slides[current];
  const palette = SLIDE_BG[current % SLIDE_BG.length];
  const isDark = palette.bg !== "#FAFAFA";

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: palette.bg,
        minHeight: "clamp(480px, 70vh, 720px)",
        transition: "background-color 0.4s ease",
      }}
    >
      {/* Background image — raw, no overlay softening */}
      {bannerUrl(slide.image_url) && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={bannerUrl(slide.image_url)}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.15, mixBlendMode: "multiply" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      {/* Geometric brutalist accents */}
      <div
        className="absolute top-0 right-0 w-48 h-full border-l-4 opacity-10 pointer-events-none"
        style={{ borderColor: palette.accent }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none"
        style={{ backgroundColor: palette.accent, opacity: 0.3 }}
      />

      {/* Slide number — raw typography */}
      <div
        className="absolute top-6 right-8 font-mono text-xs font-bold tracking-widest pointer-events-none select-none"
        style={{ color: palette.accent, opacity: 0.4 }}
      >
        {String(current + 1).padStart(2, "0")} /{" "}
        {String(slides.length).padStart(2, "0")}
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative max-w-7xl mx-auto px-6 md:px-12 h-full flex flex-col justify-center gap-6"
        style={{
          paddingTop: "clamp(64px, 10vh, 120px)",
          paddingBottom: "clamp(64px, 10vh, 120px)",
        }}
      >
        {slide.badge && (
          <div
            className="inline-flex self-start items-center border-2 px-3 py-1"
            style={{ borderColor: palette.accent, color: palette.accent }}
          >
            <span className="text-xs font-mono font-bold tracking-widest uppercase">
              {slide.badge}
            </span>
          </div>
        )}

        <h1
          ref={headlineRef}
          className="font-bold"
          style={{
            fontSize: "clamp(2.5rem, 8vw, 7rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            color: palette.accent,
            maxWidth: "14ch",
          }}
        >
          {slide.title}
        </h1>

        {slide.subtitle && (
          <p
            className="text-base md:text-lg font-medium max-w-md"
            style={{ color: palette.accent, opacity: 0.75 }}
          >
            {slide.subtitle}
          </p>
        )}

        {slide.cta_text && slide.cta_url && (
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href={slide.cta_url}
              className="inline-flex items-center gap-3 px-8 py-4 font-bold uppercase tracking-widest text-sm border-4 transition-all duration-150 cursor-pointer"
              style={{
                backgroundColor: palette.accent,
                color: palette.bg,
                borderColor: palette.accent,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translate(-3px,-3px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  `5px 5px 0px ${isDark ? palette.accent : "#0A0A0A"}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              {slide.cta_text}
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </div>

      {/* Navigation */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border-2 transition-all duration-150 cursor-pointer hover:opacity-70"
            aria-label="Anterior"
            style={{ borderColor: palette.accent, color: palette.accent }}
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border-2 transition-all duration-150 cursor-pointer hover:opacity-70"
            aria-label="Siguiente"
            style={{ borderColor: palette.accent, color: palette.accent }}
          >
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="transition-all duration-200 cursor-pointer"
                aria-label={`Ir a slide ${i + 1}`}
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  backgroundColor: palette.accent,
                  opacity: i === current ? 1 : 0.35,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
