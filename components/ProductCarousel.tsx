"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { Product } from "@/types";

export default function ProductCarousel({ products }: { products: Product[] }) {
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
    <div className="relative group">
      {showButtons && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 bg-white shadow-md border border-slate-200 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:border-blue-400 hover:text-blue-600"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product) => (
          <div key={product.id} className="flex-none w-[calc(33.333%-0.667rem)]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {showButtons && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 bg-white shadow-md border border-slate-200 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:border-blue-400 hover:text-blue-600"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
