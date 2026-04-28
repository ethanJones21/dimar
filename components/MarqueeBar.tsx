"use client";

import { useEffect, useState } from "react";

const DEFAULT_MESSAGES = [
  "ENVÍO GRATIS EN PEDIDOS +S/150",
  "DEVOLUCIONES GRATUITAS EN 30 DÍAS",
  "PAGA CON YAPE · TARJETA",
  "SOPORTE 24/7 DISPONIBLE",
  "DESPACHO EL MISMO DÍA EN PEDIDOS ANTES DE LAS 3PM",
];

interface Props {
  messages?: string[];
  className?: string;
}

export default function MarqueeBar({
  messages = DEFAULT_MESSAGES,
  className = "",
}: Props) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const text = messages.join("   ·   ");

  if (reduced) {
    return (
      <div
        className={`bg-[#0A0A0A] text-[#FAFAFA] py-2 text-center border-b-2 border-[#0A0A0A] ${className}`}
      >
        <span className="text-xs font-mono font-medium tracking-widest uppercase">
          {messages[0]}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#0A0A0A] text-[#FAFAFA] overflow-hidden border-b-2 border-[#0A0A0A] py-2 ${className}`}
    >
      {/* Duplicate text ×4 — first two visible at once, second two seamless when first loops */}
      <div className="marquee-track flex gap-0 whitespace-nowrap">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="flex-shrink-0 text-xs font-mono font-medium tracking-widest uppercase px-8"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
