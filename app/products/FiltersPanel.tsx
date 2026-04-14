"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Props {
  brands: string[];
  categories: { id: string; name: string; slug: string }[];
  currentCategory: string;
}

const DISCOUNT_OPTIONS = [70, 60, 50, 40, 30, 20, 10];

export default function FiltersPanel({
  brands,
  categories,
  currentCategory,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceOpen, setPriceOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [discountOpen, setDiscountOpen] = useState(true);
  const [formatOpen, setFormatOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentMinPrice = searchParams.get("min_price") ?? "";
  const currentMaxPrice = searchParams.get("max_price") ?? "";
  const currentBrand = searchParams.get("brand") ?? "";
  const currentDiscount = searchParams.get("discount") ?? "";
  const currentFormat = searchParams.get("sale_format") ?? "";

  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  // Sync inputs when URL params change (back/forward navigation, clear filters)
  useEffect(() => {
    setMinPrice(currentMinPrice);
    setMaxPrice(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  const activeCount = [
    currentMinPrice || currentMaxPrice,
    currentBrand,
    currentDiscount,
    currentFormat,
  ].filter(Boolean).length;

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/products?${params.toString()}`);
  };

  const applyPrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("min_price", minPrice);
    else params.delete("min_price");
    if (maxPrice) params.set("max_price", maxPrice);
    else params.delete("max_price");
    router.push(`/products?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["min_price", "max_price", "brand", "discount", "sale_format"].forEach(
      (k) => params.delete(k),
    );
    setMinPrice("");
    setMaxPrice("");
    router.push(`/products?${params.toString()}`);
  };

  const toggle = (key: string, value: string, current: string) =>
    updateParam(key, current === value ? "" : value);

  const filterContent = (
    <div className="space-y-3">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-content-base text-sm">Filtros</span>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"
          >
            <X size={12} /> Limpiar
          </button>
        )}
      </div>

      {/* ── Precio ── */}
      <div className="border border-line rounded-xl overflow-hidden bg-white dark:bg-transparent">
        <button
          type="button"
          onClick={() => setPriceOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-content-base hover:bg-surface-hover transition-colors"
        >
          Precio
          {priceOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {priceOpen && (
          <div className="px-4 pb-4 pt-3 border-t border-line-subtle space-y-3 bg-white dark:bg-transparent">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={minPrice}
                min={0}
                onChange={(e) => setMinPrice(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyPrice()}
                className="input w-full text-sm"
              />
              <input
                type="number"
                placeholder="Máx"
                value={maxPrice}
                min={0}
                onChange={(e) => setMaxPrice(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyPrice()}
                className="input w-full text-sm"
              />
            </div>
            <button
              type="button"
              onClick={applyPrice}
              className="btn-primary w-full text-sm py-1.5"
            >
              Aplicar
            </button>
            {(currentMinPrice || currentMaxPrice) && (
              <p className="text-xs text-content-muted text-center">
                {currentMinPrice
                  ? formatPrice(Number(currentMinPrice))
                  : "–"}
                {" → "}
                {currentMaxPrice
                  ? formatPrice(Number(currentMaxPrice))
                  : "∞"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Marca ── */}
      {brands.length > 0 && (
        <div className="border border-line rounded-xl overflow-hidden bg-white dark:bg-transparent">
          <button
            type="button"
            onClick={() => setBrandOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-content-base hover:bg-surface-hover transition-colors"
          >
            Marca
            {brandOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {brandOpen && (
            <div className="px-4 pb-4 pt-3 border-t border-line-subtle space-y-1.5">
              {brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => toggle("brand", brand, currentBrand)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentBrand === brand
                      ? "bg-primary text-white font-medium"
                      : "text-content-base hover:bg-surface-subtle"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Formato de venta ── */}
      <div className="border border-line rounded-xl overflow-hidden bg-white dark:bg-transparent">
        <button
          type="button"
          onClick={() => setFormatOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-content-base hover:bg-surface-hover transition-colors"
        >
          Formato
          {formatOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {formatOpen && (
          <div className="px-4 pb-4 pt-3 border-t border-line-subtle flex gap-2">
            {(["unit", "pack"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => toggle("sale_format", fmt, currentFormat)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  currentFormat === fmt
                    ? "bg-primary text-white border-primary"
                    : "text-content-base border-line hover:bg-surface-subtle"
                }`}
              >
                {fmt === "unit" ? "Unidad" : "Pack"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Ofertas ── */}
      <div className="border border-line rounded-xl overflow-hidden bg-white dark:bg-transparent">
        <button
          type="button"
          onClick={() => setDiscountOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-content-base hover:bg-surface-hover transition-colors"
        >
          Descuentos
          {discountOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {discountOpen && (
          <div className="px-4 pb-4 pt-3 border-t border-line-subtle space-y-1.5">
            {DISCOUNT_OPTIONS.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => toggle("discount", String(pct), currentDiscount)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentDiscount === String(pct)
                    ? "bg-primary text-white font-medium"
                    : "text-content-base hover:bg-surface-subtle"
                }`}
              >
                Desde {pct}% OFF
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:block w-56 flex-shrink-0 sticky top-20 self-start">
        {filterContent}
      </aside>

      {/* ── Mobile toggle ── */}
      <div className="md:hidden mb-2">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="bg-white dark:bg-transparent flex items-center gap-2 px-4 py-2.5 border border-line rounded-xl text-sm text-content-base hover:bg-surface-hover transition-colors"
        >
          <SlidersHorizontal size={16} />
          Filtros
          {activeCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {mobileOpen && (
          <div className="mt-3 p-4 border border-line rounded-xl bg-surface-base shadow-sm">
            {filterContent}
          </div>
        )}
      </div>
    </>
  );
}
