"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import FavoriteButton from "@/components/FavoriteButton";
import { imgUrl, DEFAULT_IMAGE } from "@/lib/media";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useCartStore((s) => s.openCartDrawer);

  const mainImage = imgUrl(product.images?.[0]);
  const hasDiscount =
    product.compare_price && product.compare_price > product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    openCartDrawer();
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-row sm:flex-col w-full bg-white border-2 border-[#0A0A0A] overflow-hidden transition-all duration-150 ease-out hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_#0A0A0A] dark:hover:shadow-[5px_5px_0px_rgba(255,255,255,0.4)] cursor-pointer"
    >
      {/* Image */}
      <div className="relative w-32 shrink-0 sm:w-auto aspect-square overflow-hidden bg-[#F0F0F0] dark:bg-[#1A1A1A]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage}
          alt={product.name}
          className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
          }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {hasDiscount && (
            <span className="bg-primary text-white text-[10px] font-mono font-bold px-2 py-0.5 border border-[#0A0A0A]">
              -
              {Math.round(
                ((product.compare_price! - product.price) /
                  product.compare_price!) *
                  100,
              )}
              %
            </span>
          )}
          {product.sale_format === "pack" && (
            <span className="bg-secondary text-white text-[10px] font-mono font-bold px-2 py-0.5 border border-[#0A0A0A]">
              {product.pack_size ? `PACK×${product.pack_size}` : "PACK"}
            </span>
          )}
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-[#0A0A0A]/60 flex items-center justify-center">
            <span className="bg-white text-[#0A0A0A] px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border border-[#0A0A0A]">
              AGOTADO
            </span>
          </div>
        )}

        <FavoriteButton productId={product.id} />
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0">
        {product.category?.name && (
          <p className="text-[10px] font-mono text-[#888888] mb-1 uppercase tracking-widest">
            {product.category.name}
          </p>
        )}
        <h3 className="font-display font-semibold text-sm text-[#0A0A0A] line-clamp-2 leading-snug mb-3 flex-1">
          {product.name}
        </h3>

        <div className="mb-3">
          <span className="font-mono font-bold text-lg text-primary">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[#888888] text-xs font-mono line-through ml-2">
              {formatPrice(product.compare_price!)}
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-[#0A0A0A] text-[#FAFAFA] text-[10px] font-mono font-bold tracking-widest uppercase border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] hover:bg-primary hover:border-primary hover:text-white dark:hover:bg-primary dark:hover:border-primary dark:hover:text-white transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={13} strokeWidth={2.5} />
          AGREGAR
        </button>
      </div>
    </Link>
  );
}
