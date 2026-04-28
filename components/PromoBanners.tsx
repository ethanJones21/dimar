"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Banner } from "@/types";
import { bannerUrl } from "@/lib/media";

export default function PromoBanners({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 pb-12">
      <div className="grid md:grid-cols-2 gap-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`relative bg-gradient-to-br ${banner.bg_color} rounded-2xl overflow-hidden text-white min-h-[180px] flex items-end`}
          >
            {bannerUrl(banner.image_url) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bannerUrl(banner.image_url)}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover opacity-25"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div className="relative p-6 w-full">
              {banner.badge && (
                <span className="inline-block bg-white/25 text-white text-xs font-bold px-3 py-0.5 rounded-full mb-2">
                  {banner.badge}
                </span>
              )}
              <h3 className="text-xl font-bold mb-1">{banner.title}</h3>
              {banner.subtitle && (
                <p className="text-sm text-white/80 mb-3 line-clamp-2">{banner.subtitle}</p>
              )}
              {banner.cta_text && banner.cta_url && (
                <Link
                  href={banner.cta_url}
                  className="inline-flex items-center gap-1 bg-white text-slate-800 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-white/90 transition-colors"
                >
                  {banner.cta_text} <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
