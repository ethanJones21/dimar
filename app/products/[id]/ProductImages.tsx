"use client";

import { useState } from "react";

const FALLBACK = "https://placehold.co/600x600?text=Sin+imagen";

export default function ProductImages({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0);
  const imgs = images?.length > 0 ? images : [FALLBACK];

  return (
    <div>
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgs[selected]}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
        />
      </div>
      {imgs.length > 1 && (
        <div className="flex gap-2">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                selected === i ? "border-blue-600" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
