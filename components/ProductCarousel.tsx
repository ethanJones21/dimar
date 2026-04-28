"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { Product } from "@/types";

export default function ProductCarousel({
  products,
  title,
}: {
  products: Product[];
  title?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const showButtons = products.length > 3;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -scrollRef.current.offsetWidth : scrollRef.current.offsetWidth,
      behavior: "smooth",
    });
  };

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
            style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)", letterSpacing: "-0.02em", lineHeight: 1 }}
          >
            {title.toUpperCase()}
          </h2>
          {showButtons && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="w-9 h-9 flex items-center justify-center border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-colors cursor-pointer"
                aria-label="Anterior"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-9 h-9 flex items-center justify-center border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-colors cursor-pointer"
                aria-label="Siguiente"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-none w-[85%] min-[676px]:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.667rem)] lg:w-[calc(25%-0.75rem)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
