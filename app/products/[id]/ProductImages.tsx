"use client";

import { useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const FALLBACK = "https://placehold.co/600x600?text=Sin+imagen";
const LENS = 130;

export default function ProductImages({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  const imgs = images?.length > 0 ? images : [FALLBACK];
  const prev = () => setSelected((s) => (s === 0 ? imgs.length - 1 : s - 1));
  const next = () => setSelected((s) => (s === imgs.length - 1 ? 0 : s + 1));

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - LENS / 2, rect.width - LENS));
    const y = Math.max(0, Math.min(e.clientY - rect.top - LENS / 2, rect.height - LENS));

    if (lensRef.current) {
      lensRef.current.style.left = `${x}px`;
      lensRef.current.style.top = `${y}px`;
    }

    if (zoomRef.current) {
      const bgSize = (rect.width / LENS) * 100;
      const bgX = rect.width > LENS ? (x / (rect.width - LENS)) * 100 : 0;
      const bgY = rect.height > LENS ? (y / (rect.height - LENS)) * 100 : 0;
      zoomRef.current.style.backgroundSize = `${bgSize}%`;
      zoomRef.current.style.backgroundPosition = `${bgX}% ${bgY}%`;
    }
  };

  return (
    <div className="relative">
      {/* Main image */}
      <div
        ref={containerRef}
        className="relative aspect-square overflow-hidden bg-[#F0F0F0] dark:bg-[#1A1A1A] mb-3 cursor-crosshair select-none border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)]"
        onMouseEnter={() => {
          lensRef.current && (lensRef.current.style.display = "block");
          zoomRef.current && (zoomRef.current.style.display = "block");
        }}
        onMouseLeave={() => {
          lensRef.current && (lensRef.current.style.display = "none");
          zoomRef.current && (zoomRef.current.style.display = "none");
        }}
        onMouseMove={onMouseMove}
        onClick={() => setLightbox(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgs[selected]}
          alt={name}
          className="w-full h-full object-cover pointer-events-none"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
        />

        {/* Lens */}
        <div
          ref={lensRef}
          className="absolute border-2 border-primary bg-white/10 pointer-events-none"
          style={{ width: LENS, height: LENS, display: "none" }}
        />
      </div>

      {/* Zoom panel */}
      <div
        ref={zoomRef}
        className="absolute top-0 z-20 aspect-square border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] bg-[#F0F0F0] dark:bg-[#1A1A1A] bg-no-repeat"
        style={{
          left: "calc(100% + 2.5rem)",
          width: "100%",
          backgroundImage: `url(${imgs[selected]})`,
          display: "none",
        }}
      />

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="w-9 h-9 flex items-center justify-center border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Anterior imagen"
          >
            <ChevronLeft size={15} strokeWidth={2.5} />
          </button>

          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {imgs.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-all duration-150 cursor-pointer ${
                  selected === i
                    ? "border-primary shadow-[3px_3px_0px_#2563EB]"
                    : "border-[#0A0A0A] dark:border-[rgba(255,255,255,0.4)] hover:border-primary"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${name} ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
                />
              </button>
            ))}
          </div>

          <button
            onClick={next}
            className="w-9 h-9 flex items-center justify-center border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Siguiente imagen"
          >
            <ChevronRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-[#0A0A0A] transition-colors cursor-pointer"
            onClick={() => setLightbox(false)}
            aria-label="Cerrar"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          {imgs.length > 1 && (
            <>
              <button
                className="absolute left-4 w-10 h-10 flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-[#0A0A0A] transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Anterior"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              <button
                className="absolute right-4 w-10 h-10 flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-[#0A0A0A] transition-colors cursor-pointer"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Siguiente"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgs[selected]}
            alt={name}
            className="max-w-full max-h-[90vh] object-contain cursor-default"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
          />
        </div>
      )}
    </div>
  );
}
