import React from "react";
import { ArrowRight, ArrowUpRight, Truck, Shield, RefreshCw, Headphones, Heart, Zap, MapPin, Play } from "lucide-react";
import { RevealAnimation } from "./components/RevealAnimation";

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden flex items-center justify-center">
        <video
          src="https://videos.pexels.com/video-files/5264401/5264401-hd_1920_1080_25fps.mp4"
          poster="https://images.pexels.com/videos/5264401/pexels-photo-5264401.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/55" />
        <div className="relative z-10 mx-6 max-w-[680px] text-center backdrop-blur-md bg-white/15 border border-white/25 rounded-2xl px-10 py-12 md:px-14 md:py-16 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <p className="text-white/80 text-[11px] font-semibold tracking-[0.32em] uppercase mb-6">
            Tienda Dimar — Lima, Perú
          </p>
          <h1 className="font-serif text-white font-bold leading-[1.02] tracking-[-0.02em] text-fluid-hero">
            Descubre tu estilo. Dimar.
          </h1>
          <p className="text-white/85 text-[16px] md:text-[17px] mt-6 max-w-[460px] mx-auto leading-relaxed">
            Curaduría de productos de calidad con envío rápido a todo el Perú.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-5">
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-[#7BAFD4] hover:bg-[#6aa0c9] text-white text-[14px] font-semibold rounded-full px-8 py-3.5 shadow-[0_8px_24px_rgba(123,175,212,0.45)] transition-colors"
            >
              Explorar catálogo
              <ArrowRight size={16} />
            </a>
            <a href="#" className="text-white text-[14px] font-medium ulink">
              Ver novedades
            </a>
          </div>
        </div>
      </section>

      {/* ── Features bar ─────────────────────────────────────── */}
      <div className="relative z-20 max-w-[1000px] mx-auto px-6 -mt-12">
        <div className="reveal bg-white rounded-full border border-[#E5E4E2] shadow-[0_18px_50px_rgba(0,0,0,0.10)] px-4 md:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-y-6 divide-[#E5E4E2] md:divide-x">
          <div className="flex items-center gap-3.5 px-4 md:px-6 text-[26px] text-[#36454F]">
            <Truck size={26} />
            <div className="leading-tight">
              <p className="font-sans text-[13px] font-semibold">Envío gratis</p>
              <p className="text-[12px] text-[#7c858b]">En pedidos +S/150</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 px-4 md:px-6 text-[26px] text-[#36454F]">
            <Shield size={26} />
            <div className="leading-tight">
              <p className="font-sans text-[13px] font-semibold">Compra segura</p>
              <p className="text-[12px] text-[#7c858b]">Datos protegidos</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 px-4 md:px-6 text-[26px] text-[#36454F]">
            <RefreshCw size={26} />
            <div className="leading-tight">
              <p className="font-sans text-[13px] font-semibold">30 días</p>
              <p className="text-[12px] text-[#7c858b]">Cambios y devoluciones</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 px-4 md:px-6 text-[26px] text-[#36454F]">
            <Headphones size={26} />
            <div className="leading-tight">
              <p className="font-sans text-[13px] font-semibold">Soporte 24/7</p>
              <p className="text-[12px] text-[#7c858b]">Siempre disponible</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Categorías ───────────────────────────────────────── */}
      <section className="pt-24 pb-20">
        <div className="max-w-[1240px] mx-auto px-8 mb-10 reveal">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#7BAFD4] mb-3">
            Navegar por
          </p>
          <div className="flex items-end justify-between">
            <h2 className="font-serif font-bold text-[#36454F] tracking-[-0.02em] text-fluid-title">
              Categorías
            </h2>
            <a
              href="#"
              className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#36454F] ulink"
            >
              Ver todo
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
        <div
          className="reveal mt-10 flex gap-5 overflow-x-auto hide-scrollbar px-8 snap-x snap-mandatory pb-2 max-w-[1240px] mx-auto"
          style={{ scrollPaddingLeft: "2rem" }}
        >
          <a href="#" className="group relative shrink-0 w-56 h-72 rounded-xl overflow-hidden snap-start">
            <img
              src="https://images.unsplash.com/photo-1599865240613-69a7655f94b3?crop=entropy&cs=srgb&fm=jpg&q=85&w=600"
              alt="Electrónica"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <p className="absolute bottom-5 left-0 right-0 text-center text-white font-serif text-[20px] font-semibold">
              Electrónica
            </p>
          </a>
          <a href="#" className="group relative shrink-0 w-56 h-72 rounded-xl overflow-hidden snap-start">
            <img
              src="https://images.pexels.com/photos/30408335/pexels-photo-30408335.jpeg?auto=compress&cs=tinysrgb&w=600&q=80"
              alt="Ropa"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <p className="absolute bottom-5 left-0 right-0 text-center text-white font-serif text-[20px] font-semibold">
              Ropa
            </p>
          </a>
          <a href="#" className="group relative shrink-0 w-56 h-72 rounded-xl overflow-hidden snap-start">
            <img
              src="https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?crop=entropy&cs=srgb&fm=jpg&q=85&w=600"
              alt="Hogar"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <p className="absolute bottom-5 left-0 right-0 text-center text-white font-serif text-[20px] font-semibold">
              Hogar
            </p>
          </a>
          <a href="#" className="group relative shrink-0 w-56 h-72 rounded-xl overflow-hidden snap-start">
            <img
              src="https://images.unsplash.com/photo-1631984564919-1f6b2313a71c?crop=entropy&cs=srgb&fm=jpg&q=85&w=600"
              alt="Deportes"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <p className="absolute bottom-5 left-0 right-0 text-center text-white font-serif text-[20px] font-semibold">
              Deportes
            </p>
          </a>
          <a href="#" className="group relative shrink-0 w-56 h-72 rounded-xl overflow-hidden snap-start">
            <img
              src="https://images.unsplash.com/photo-1544489603-348771b16566?crop=entropy&cs=srgb&fm=jpg&q=85&w=600"
              alt="Libros"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <p className="absolute bottom-5 left-0 right-0 text-center text-white font-serif text-[20px] font-semibold">
              Libros
            </p>
          </a>
          <a href="#" className="group relative shrink-0 w-56 h-72 rounded-xl overflow-hidden snap-start">
            <img
              src="https://images.pexels.com/photos/8015871/pexels-photo-8015871.jpeg?auto=compress&cs=tinysrgb&w=600&q=80"
              alt="Belleza"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <p className="absolute bottom-5 left-0 right-0 text-center text-white font-serif text-[20px] font-semibold">
              Belleza
            </p>
          </a>
        </div>
      </section>

      {/* ── Misión ───────────────────────────────────────────── */}
      <section className="py-28 border-t border-[#E5E4E2]">
        <div className="max-w-[1240px] mx-auto px-8 grid md:grid-cols-[1.55fr_1fr] gap-16 items-start reveal">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#7BAFD4] mb-8">
              Nuestra misión
            </p>
            <blockquote className="font-serif italic font-medium text-[#36454F] leading-[1.12] tracking-[-0.01em] relative text-fluid-quote">
              <span
                className="absolute -left-7 -top-6 text-[#E5E4E2] not-italic font-bold"
                style={{ fontSize: "7rem", lineHeight: "1" }}
                aria-hidden="true"
              >
                "
              </span>
              Calidad sin compromiso. Desde la selección hasta tu puerta.
            </blockquote>
          </div>
          <div className="md:pt-20">
            <p className="text-[16px] leading-[1.8] text-[#5b656b]">
              En Dimar creemos que acceder a buenos productos no debería ser
              complicado. Cubrimos desde la selección hasta la entrega en tu
              puerta.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 mt-7 text-[14px] font-semibold text-[#36454F] ulink"
            >
              Conoce más
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Destacados ───────────────────────────────────────── */}
      <section className="py-24 bg-white border-y border-[#E5E4E2]">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="flex items-end justify-between reveal">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#7BAFD4] mb-3">
                Selección especial
              </p>
              <h2 className="font-serif font-bold text-[#36454F] tracking-[-0.02em] text-fluid-title">
                Destacados
              </h2>
            </div>
            <a
              href="#"
              className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#36454F] ulink"
            >
              Ver todos
              <ArrowRight size={15} />
            </a>
          </div>

          <div className="mt-12 columns-1 sm:columns-2 lg:columns-3 gap-7 [column-fill:balance]">
            <article className="reveal group mb-7 break-inside-avoid bg-white rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 p-3">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1631984564919-1f6b2313a71c?crop=entropy&cs=srgb&fm=jpg&q=85&w=600"
                  alt="Zapatillas Urban Pro"
                  className="w-full h-[300px] object-cover"
                />
                <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-[#36454F] hover:text-[#7BAFD4] text-[18px]">
                  <Heart size={18} />
                </button>
                <span className="absolute top-3 left-3 bg-[#7BAFD4] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  -20%
                </span>
              </div>
              <div className="px-2 pt-4 pb-2">
                <p className="text-[15px] font-medium text-[#36454F]">Zapatillas Urban Pro</p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-[16px] font-semibold text-[#36454F]">S/ 199.90</span>
                  <span className="text-[13px] text-[#9aa3a9] line-through">S/ 249.90</span>
                </div>
              </div>
            </article>

            <article className="reveal group mb-7 break-inside-avoid bg-white rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 p-3">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src="https://images.pexels.com/photos/8015871/pexels-photo-8015871.jpeg?auto=compress&cs=tinysrgb&w=600&q=80"
                  alt="Sérum Facial Glow"
                  className="w-full h-[420px] object-cover"
                />
                <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-[#36454F] hover:text-[#7BAFD4] text-[18px]">
                  <Heart size={18} />
                </button>
              </div>
              <div className="px-2 pt-4 pb-2">
                <p className="text-[15px] font-medium text-[#36454F]">Sérum Facial Glow</p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-[16px] font-semibold text-[#36454F]">S/ 89.90</span>
                </div>
              </div>
            </article>

            <article className="reveal group mb-7 break-inside-avoid bg-white rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 p-3">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1599865240613-69a7655f94b3?crop=entropy&cs=srgb&fm=jpg&q=85&w=600"
                  alt="Audífonos Inalámbricos"
                  className="w-full h-[340px] object-cover"
                />
                <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-[#36454F] hover:text-[#7BAFD4] text-[18px]">
                  <Heart size={18} />
                </button>
              </div>
              <div className="px-2 pt-4 pb-2">
                <p className="text-[15px] font-medium text-[#36454F]">Audífonos Inalámbricos</p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-[16px] font-semibold text-[#36454F]">S/ 329.00</span>
                </div>
              </div>
            </article>

            <article className="reveal group mb-7 break-inside-avoid bg-white rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 p-3">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src="https://images.pexels.com/photos/7256082/pexels-photo-7256082.jpeg?auto=compress&cs=tinysrgb&w=600&q=80"
                  alt="Set de Skincare"
                  className="w-full h-[300px] object-cover"
                />
                <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-[#36454F] hover:text-[#7BAFD4] text-[18px]">
                  <Heart size={18} />
                </button>
                <span className="absolute top-3 left-3 bg-[#7BAFD4] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  -15%
                </span>
              </div>
              <div className="px-2 pt-4 pb-2">
                <p className="text-[15px] font-medium text-[#36454F]">Set de Skincare</p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-[16px] font-semibold text-[#36454F]">S/ 149.90</span>
                  <span className="text-[13px] text-[#9aa3a9] line-through">S/ 175.90</span>
                </div>
              </div>
            </article>

            <article className="reveal group mb-7 break-inside-avoid bg-white rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 p-3">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1544489603-348771b16566?crop=entropy&cs=srgb&fm=jpg&q=85&w=600"
                  alt="Cámara Compacta"
                  className="w-full h-[400px] object-cover"
                />
                <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-[#36454F] hover:text-[#7BAFD4] text-[18px]">
                  <Heart size={18} />
                </button>
              </div>
              <div className="px-2 pt-4 pb-2">
                <p className="text-[15px] font-medium text-[#36454F]">Cámara Compacta</p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-[16px] font-semibold text-[#36454F]">S/ 1,290.00</span>
                </div>
              </div>
            </article>

            <article className="reveal group mb-7 break-inside-avoid bg-white rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 p-3">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src="https://images.pexels.com/photos/8049849/pexels-photo-8049849.jpeg?auto=compress&cs=tinysrgb&w=600&q=80"
                  alt="Difusor Aromático"
                  className="w-full h-[320px] object-cover"
                />
                <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-[#36454F] hover:text-[#7BAFD4] text-[18px]">
                  <Heart size={18} />
                </button>
              </div>
              <div className="px-2 pt-4 pb-2">
                <p className="text-[15px] font-medium text-[#36454F]">Difusor Aromático</p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-[16px] font-semibold text-[#36454F]">S/ 119.90</span>
                </div>
              </div>
            </article>

            <article className="reveal group mb-7 break-inside-avoid bg-white rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 p-3">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1758560936904-4eb0049284aa?crop=entropy&cs=srgb&fm=jpg&q=85&w=600"
                  alt="Lámpara Minimal"
                  className="w-full h-[280px] object-cover"
                />
                <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-[#36454F] hover:text-[#7BAFD4] text-[18px]">
                  <Heart size={18} />
                </button>
              </div>
              <div className="px-2 pt-4 pb-2">
                <p className="text-[15px] font-medium text-[#36454F]">Lámpara Minimal</p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-[16px] font-semibold text-[#36454F]">S/ 159.00</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── Promo ────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-[1240px] mx-auto px-8 reveal grid lg:grid-cols-[3fr_1fr] gap-5 lg:h-[520px]">
          <div className="relative rounded-2xl overflow-hidden min-h-[360px]">
            <img
              src="https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000"
              alt="30 días para cambios"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
            <div className="absolute bottom-0 left-0 p-10 max-w-md">
              <p className="text-white/75 text-[11px] font-semibold tracking-[0.28em] uppercase mb-3">
                Garantía total
              </p>
              <h3 className="font-serif text-white font-bold leading-[1.05] tracking-[-0.01em] text-fluid-card">
                30 días para cambios
              </h3>
              <p className="text-white/80 text-[14px] mt-3 leading-relaxed">
                Si no estás satisfecho, te devolvemos tu dinero sin preguntas.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 mt-6 bg-white text-[#36454F] text-[13px] font-semibold rounded-full px-6 py-3 hover:bg-[#7BAFD4] hover:text-white transition-colors"
              >
                Ver productos
                <ArrowRight size={15} />
              </a>
            </div>
          </div>
          <div className="grid grid-rows-2 gap-5">
            <div className="rounded-2xl bg-[#36454F] text-white p-8 flex flex-col justify-between">
              <Zap size={30} className="text-[#7BAFD4]" />
              <div>
                <p className="font-serif font-bold leading-[1.05] text-fluid-label">
                  Envío Express en 24h
                </p>
                <p className="text-white/65 text-[13px] mt-2">Pedidos antes de las 3 p.m.</p>
              </div>
            </div>
            <div className="rounded-2xl bg-[#7BAFD4] text-white p-8 flex flex-col justify-between overflow-hidden relative">
              <MapPin size={30} className="text-white/90" />
              <p className="font-sans font-semibold text-[18px] leading-snug relative z-10">
                Cobertura en Lima Metropolitana
              </p>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border-2 border-white/20" />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full border-2 border-white/20" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Video ────────────────────────────────────────────── */}
      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-[#FAFAF9]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#36454F]" />
        <div className="relative max-w-[1000px] mx-auto px-8 py-20">
          <div className="reveal text-center mb-10">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#7BAFD4] mb-3">
              Experiencia Dimar
            </p>
            <h2 className="font-serif font-bold text-[#36454F] tracking-[-0.02em] text-fluid-section">
              Compra inteligente, vive mejor.
            </h2>
          </div>
          <div
            id="video-wrap"
            className="reveal relative rounded-2xl overflow-hidden cursor-pointer group aspect-video bg-black shadow-[0_30px_80px_rgba(0,0,0,0.3)]"
          >
            <video
              id="dimar-vid"
              src="https://videos.pexels.com/video-files/4565886/4565886-hd_1280_720_24fps.mp4"
              poster="https://images.pexels.com/videos/4565886/pexels-photo-4565886.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200"
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            <button
              id="play-btn"
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="w-20 h-20 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-[30px]">
                <Play size={30} />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Únete ────────────────────────────────────────────── */}
      <section className="bg-[#FAFAF9] py-28">
        <div className="max-w-[1240px] mx-auto px-8 min-h-[420px] flex flex-col reveal">
          <h2 className="font-serif font-bold text-[#36454F] tracking-[-0.03em] leading-none text-fluid-jumbo">
            Únete
          </h2>
          <div className="mt-auto self-end w-full max-w-md text-right">
            <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#7BAFD4] mb-4">
              No te pierdas nada
            </p>
            <div className="flex items-end gap-4 border-b-2 border-[#36454F] pb-2">
              <input
                type="email"
                placeholder="tu@correo.com"
                className="flex-1 bg-transparent outline-none text-[18px] text-[#36454F] placeholder:text-[#9aa3a9] text-left"
              />
              <button className="text-[14px] font-semibold text-[#36454F] whitespace-nowrap ulink">
                Suscribirse
              </button>
            </div>
          </div>
        </div>
      </section>

      <RevealAnimation />
    </>
  );
}
