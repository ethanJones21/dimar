"use client";

import { useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const FALLBACK = "https://placehold.co/600x600?text=Sin+imagen";
const LENS = 130; // tamaño del cuadro lente en px

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

      {/* Imagen principal */}
      <div
        ref={containerRef}
        className="relative aspect-square rounded-2xl overflow-hidden bg-surface-subtle mb-3 cursor-crosshair select-none"
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

        {/* Lente */}
        <div
          ref={lensRef}
          className="absolute border-2 border-primary/50 bg-white/20 pointer-events-none"
          style={{ width: LENS, height: LENS, display: "none" }}
        />
      </div>

      {/* Panel de zoom — aparece a la derecha sobre la columna de info */}
      <div
        ref={zoomRef}
        className="absolute top-0 z-20 aspect-square rounded-2xl border border-line shadow-2xl bg-surface-subtle bg-no-repeat"
        style={{
          left: "calc(100% + 2.5rem)",
          width: "100%",
          backgroundImage: `url(${imgs[selected]})`,
          display: "none",
        }}
      />

      {/* Miniaturas */}
      {imgs.length > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="p-1.5 rounded-lg border border-line hover:border-primary hover:text-primary transition-colors flex-shrink-0"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {imgs.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                  selected === i ? "border-primary" : "border-line hover:border-primary-light"
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
            className="p-1.5 rounded-lg border border-line hover:border-primary hover:text-primary transition-colors flex-shrink-0"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X size={20} />
          </button>

          {imgs.length > 1 && (
            <>
              <button
                className="absolute left-4 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="absolute right-4 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgs[selected]}
            alt={name}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
          />
        </div>
      )}
    </div>
  );
}
