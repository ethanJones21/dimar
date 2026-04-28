import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Geometric accent lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
      <div className="absolute inset-0 grid grid-cols-3 pointer-events-none opacity-[0.03]">
        <div className="border-r border-white" />
        <div className="border-r border-white" />
      </div>

      {/* Oversized 404 */}
      <div
        className="font-display font-bold text-[#FAFAFA] select-none pointer-events-none mb-0 leading-none"
        style={{
          fontSize: "clamp(8rem, 30vw, 22rem)",
          letterSpacing: "-0.05em",
          lineHeight: 0.85,
          opacity: 0.08,
          position: "absolute",
        }}
        aria-hidden="true"
      >
        404
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg">
        <div className="inline-block border-2 border-primary px-4 py-1 mb-8">
          <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">
            ERROR 404
          </span>
        </div>

        <h1
          className="font-display font-bold text-[#FAFAFA] mb-6"
          style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)", lineHeight: 0.95, letterSpacing: "-0.03em" }}
        >
          PÁGINA<br />NO ENCONTRADA.
        </h1>

        <p className="text-xs font-mono text-[#666666] uppercase tracking-widest mb-10 leading-relaxed">
          Lo que buscas no existe<br />o fue movido a otro lugar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-mono font-bold text-xs uppercase tracking-widest border-2 border-primary hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_rgba(255,255,255,0.3)] transition-all duration-150 cursor-pointer"
          >
            IR AL INICIO <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-3 px-8 py-4 bg-transparent text-[#FAFAFA] font-mono font-bold text-xs uppercase tracking-widest border-2 border-[rgba(255,255,255,0.3)] hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[5px_5px_0px_rgba(255,255,255,0.2)] hover:border-[#FAFAFA] transition-all duration-150 cursor-pointer"
          >
            VER PRODUCTOS
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary" />
    </div>
  );
}
