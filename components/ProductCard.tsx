"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import FavoriteButton from "@/components/FavoriteButton";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  const mainImage = product.images?.[0] || "https://placehold.co/400x400?text=Sin+imagen";
  const hasDiscount = product.compare_price && product.compare_price > product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  return (
    <Link href={`/products/${product.id}`} className="card group hover:shadow-md transition-shadow flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Sin+imagen"; }}
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            -{Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-slate-700 px-3 py-1 rounded-full text-sm font-medium">Agotado</span>
          </div>
        )}
        <FavoriteButton productId={product.id} />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-slate-500 mb-1">{product.category?.name}</p>
        <h3 className="font-medium text-slate-800 line-clamp-2 mb-2">{product.name}</h3>
        <div className="mb-3">
          <span className="font-bold text-blue-600 text-lg">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-slate-400 text-sm line-through ml-2">
              {formatPrice(product.compare_price!)}
            </span>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="mt-auto flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} />
          Agregar
        </button>
      </div>
    </Link>
  );
}
