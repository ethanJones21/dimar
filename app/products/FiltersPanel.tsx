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

export default function FiltersPanel({ brands, categories, currentCategory }: Props) {
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
    ["min_price", "max_price", "brand", "discount", "sale_format"].forEach((k) => params.delete(k));
    setMinPrice("");
    setMaxPrice("");
    router.push(`/products?${params.toString()}`);
  };

  const toggle = (key: string, value: string, current: string) =>
    updateParam(key, current === value ? "" : value);

  /* ── Shared section header ── */
  const SectionHeader = ({
    label,
    open,
    onToggle,
  }: {
    label: string;
    open: boolean;
    onToggle: () => void;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-0 py-3 text-[10px] font-mono font-bold tracking-widest uppercase text-[#0A0A0A] dark:text-[#FAFAFA] hover:text-primary transition-colors cursor-pointer border-b-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)]"
    >
      {label}
      {open ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
    </button>
  );

  const filterContent = (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] mb-4">
        <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#0A0A0A] dark:text-[#FAFAFA]">
          FILTROS {activeCount > 0 && <span className="text-primary">({activeCount})</span>}
        </span>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors cursor-pointer"
          >
            <X size={11} strokeWidth={2.5} /> LIMPIAR
          </button>
        )}
      </div>

      {/* ── Precio ── */}
      <div>
        <SectionHeader label="PRECIO" open={priceOpen} onToggle={() => setPriceOpen((o) => !o)} />
        {priceOpen && (
          <div className="py-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="MÍN"
                value={minPrice}
                min={0}
                onChange={(e) => setMinPrice(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyPrice()}
                className="input w-full text-xs"
              />
              <input
                type="number"
                placeholder="MÁX"
                value={maxPrice}
                min={0}
                onChange={(e) => setMaxPrice(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyPrice()}
                className="input w-full text-xs"
              />
            </div>
            <button type="button" onClick={applyPrice} className="btn-primary w-full py-2 text-[10px]">
              APLICAR
            </button>
            {(currentMinPrice || currentMaxPrice) && (
              <p className="text-[10px] font-mono text-[#888888] text-center">
                {currentMinPrice ? formatPrice(Number(currentMinPrice)) : "–"}{" → "}
                {currentMaxPrice ? formatPrice(Number(currentMaxPrice)) : "∞"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Marca ── */}
      {brands.length > 0 && (
        <div>
          <SectionHeader label="MARCA" open={brandOpen} onToggle={() => setBrandOpen((o) => !o)} />
          {brandOpen && (
            <div className="py-3 space-y-1">
              {brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => toggle("brand", brand, currentBrand)}
                  className={`w-full text-left px-3 py-2 text-[10px] font-mono font-bold tracking-widest uppercase transition-colors cursor-pointer border-2 ${
                    currentBrand === brand
                      ? "bg-primary text-white border-primary"
                      : "bg-transparent text-[#0A0A0A] dark:text-[#FAFAFA] border-transparent hover:border-[#0A0A0A] dark:hover:border-[rgba(255,255,255,0.5)]"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Formato ── */}
      <div>
        <SectionHeader label="FORMATO" open={formatOpen} onToggle={() => setFormatOpen((o) => !o)} />
        {formatOpen && (
          <div className="py-3 flex gap-2">
            {(["unit", "pack"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => toggle("sale_format", fmt, currentFormat)}
                className={`flex-1 py-2 text-[10px] font-mono font-bold tracking-widest uppercase transition-all duration-150 border-2 cursor-pointer ${
                  currentFormat === fmt
                    ? "bg-primary text-white border-primary"
                    : "bg-transparent text-[#0A0A0A] dark:text-[#FAFAFA] border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_#0A0A0A] dark:hover:shadow-[3px_3px_0px_rgba(255,255,255,0.4)]"
                }`}
              >
                {fmt === "unit" ? "UNIDAD" : "PACK"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Descuentos ── */}
      <div>
        <SectionHeader label="DESCUENTOS" open={discountOpen} onToggle={() => setDiscountOpen((o) => !o)} />
        {discountOpen && (
          <div className="py-3 space-y-1">
            {DISCOUNT_OPTIONS.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => toggle("discount", String(pct), currentDiscount)}
                className={`w-full text-left px-3 py-2 text-[10px] font-mono font-bold tracking-widest uppercase transition-colors cursor-pointer border-2 ${
                  currentDiscount === String(pct)
                    ? "bg-primary text-white border-primary"
                    : "bg-transparent text-[#0A0A0A] dark:text-[#FAFAFA] border-transparent hover:border-[#0A0A0A] dark:hover:border-[rgba(255,255,255,0.5)]"
                }`}
              >
                DESDE {pct}% OFF
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
      <aside className="hidden md:block w-52 flex-shrink-0 sticky top-24 self-start">
        {filterContent}
      </aside>

      {/* ── Mobile toggle ── */}
      <div className="md:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="flex items-center gap-3 px-5 py-3 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] text-[10px] font-mono font-bold tracking-widest uppercase text-[#0A0A0A] dark:text-[#FAFAFA] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0px_#0A0A0A] dark:hover:shadow-[3px_3px_0px_rgba(255,255,255,0.4)] transition-all duration-150 cursor-pointer"
        >
          <SlidersHorizontal size={14} strokeWidth={2.5} />
          FILTROS
          {activeCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-mono font-bold w-5 h-5 flex items-center justify-center border border-[#0A0A0A]">
              {activeCount}
            </span>
          )}
        </button>

        {mobileOpen && (
          <div className="mt-3 p-5 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] bg-white dark:bg-[#111111]">
            {filterContent}
          </div>
        )}
      </div>
    </>
  );
}
