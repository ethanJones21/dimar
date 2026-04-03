"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import FavoriteButton from "@/components/FavoriteButton";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  const mainImage =
    product.images?.[0] || "https://placehold.co/400x400?text=Sin+imagen";
  const hasDiscount =
    product.compare_price && product.compare_price > product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="card group hover:shadow-md transition-shadow flex flex-row sm:flex-col w-full"
    >
      <div className="relative w-32 shrink-0 sm:w-auto aspect-square overflow-hidden bg-surface-subtle rounded-l-[inherit] sm:rounded-l-none sm:rounded-t-[inherit]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage}
          alt={product.name}
          className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/400x400?text=Sin+imagen";
          }}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              -{Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)}%
            </span>
          )}
          {product.sale_format === "pack" && (
            <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {product.pack_size ? `Pack x${product.pack_size}` : "Pack"}
            </span>
          )}
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-surface-base text-content-base px-3 py-1 rounded-full text-sm font-medium">
              Agotado
            </span>
          </div>
        )}
        <FavoriteButton productId={product.id} />
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0">
        <p className="text-xs text-content-muted mb-1">{product.category?.name}</p>
        <h3 className="font-medium text-content-base line-clamp-2 h-[3em] mb-2">
          {product.name}
        </h3>
        <div className="mb-3">
          <span className="font-bold text-primary text-lg">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-content-subtle text-sm line-through ml-2">
              {formatPrice(product.compare_price!)}
            </span>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="mt-auto flex items-center justify-center gap-2 w-full py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} />
          Agregar
        </button>
      </div>
    </Link>
  );
}
