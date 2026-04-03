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
      left:
        dir === "left"
          ? -scrollRef.current.offsetWidth
          : scrollRef.current.offsetWidth,
      behavior: "smooth",
    });
  };

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-content-base">{title}</h2>
          {showButtons && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="bg-surface-base border border-line rounded-full p-1.5 hover:border-primary hover:text-primary transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="bg-surface-base border border-line rounded-full p-1.5 hover:border-primary hover:text-primary transition-colors"
              >
                <ChevronRight size={18} />
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
