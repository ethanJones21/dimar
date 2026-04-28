"use client";

import Link from "next/link";
import {
  ShoppingCart,
  LogOut,
  Search,
  Mic,
  Camera,
  Menu,
  X,
  Heart,
  Package,
  User,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import ThemeToggle from "@/components/ThemeToggle";
import MarqueeBar from "@/components/MarqueeBar";
import { useCartStore } from "@/lib/store/cart";
import { toast } from "@/components/ui/Toaster";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Category } from "@/types";

export default function Navbar() {
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  const openCartDrawer = useCartStore((s) => s.openCartDrawer);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const supabase = createClient();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`/products${params.toString() ? `?${params}` : ""}`);
  }, 400);

  const { state: voiceState, supported: voiceSupported, start: startVoice, stop: stopVoice } =
    useVoiceSearch(
      (transcript) => {
        setQuery(transcript);
        setSearchOpen(false);
        const params = new URLSearchParams();
        if (transcript.trim()) params.set("q", transcript.trim());
        router.push(`/products?${params}`);
      },
      (type) => {
        if (type === "permission") toast("Permite el acceso al micrófono", "error");
        else if (type === "unsupported") toast("Tu navegador no soporta búsqueda por voz", "error");
        else toast("Error al procesar el audio. Intenta de nuevo.", "error");
      },
    );

  const handleVoiceMic = () => {
    if (!voiceSupported) {
      toast("Tu navegador no soporta búsqueda por voz", "error");
      return;
    }
    if (voiceState === "idle") startVoice();
    else stopVoice();
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (drawerOpen || searchOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => mobileInputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch.cancel();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/products${params.toString() ? `?${params}` : ""}`);
    setSearchOpen(false);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    debouncedSearch(val);
  };

  useEffect(() => {
    supabase.from("categories").select("id,name,slug").order("name").then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  const closeCat = useCallback(() => setCatOpen(false), []);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) closeCat();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [closeCat]);

  const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAnalyzingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/image-search", { method: "POST", body: formData });
      const data = await res.json();
      if (data.keywords) {
        setQuery(data.keywords);
        router.push(`/products?q=${encodeURIComponent(data.keywords)}`);
        setSearchOpen(false);
      } else if (res.status === 429) {
        toast("No encontramos lo que buscabas. Intenta con otra imagen.", "error");
      } else {
        toast("No se pudo analizar la imagen. Intenta de nuevo.", "error");
      }
    } catch {
      toast("No se pudo analizar la imagen. Intenta de nuevo.", "error");
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const closeDrawer = () => setDrawerOpen(false);

  const micButton = (
    <button
      type="button"
      title={voiceState === "listening" ? "Detener" : "Buscar por voz"}
      onClick={handleVoiceMic}
      disabled={voiceState === "processing"}
      className={`p-1 cursor-pointer transition-colors ${
        voiceState === "listening"
          ? "text-red-500 animate-pulse"
          : voiceState === "processing"
            ? "text-primary animate-spin"
            : "text-[#888888] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]"
      }`}
    >
      <Mic size={16} />
    </button>
  );

  /* ─────────── Search bar (desktop) ─────────── */
  const searchBar = (
    <form onSubmit={handleSearch} className="flex items-center w-full">
      <div className="flex w-full items-center border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] bg-white dark:bg-[#1A1A1A] h-11 px-4 gap-3 transition-colors focus-within:border-primary">
        <Search size={16} className="text-[#888888] flex-shrink-0" />
        <input
          value={query}
          onChange={handleQueryChange}
          placeholder="BUSCAR PRODUCTOS..."
          className="flex-1 bg-transparent outline-none text-xs font-mono font-medium tracking-wider text-[#0A0A0A] dark:text-[#FAFAFA] placeholder:text-[#888888] min-w-0 uppercase"
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          {micButton}
          <button
            type="button"
            title="Buscar por imagen"
            disabled={analyzingImage}
            onClick={() => imageInputRef.current?.click()}
            className={`p-1 cursor-pointer transition-colors ${analyzingImage ? "text-primary animate-pulse" : "text-[#888888] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]"}`}
          >
            <Camera size={16} />
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <>
      {/* ── Marquee announcement bar ── */}
      <MarqueeBar />

      {/* ── Main nav ── */}
      <nav className="bg-[#FAFAFA] dark:bg-[#0A0A0A] border-b-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.7)] sticky top-0 z-50">

        {/* ══ Desktop ══ */}
        <div className="hidden md:grid grid-cols-[auto_1fr_auto] items-center h-16 max-w-7xl mx-auto px-4 gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="font-display font-bold text-2xl tracking-[-0.05em] text-[#0A0A0A] dark:text-[#FAFAFA] uppercase leading-none flex-shrink-0 hover:text-primary transition-colors duration-150 cursor-pointer"
          >
            DIMAR
          </Link>

          {/* Center: categories + search */}
          <div className="flex items-center gap-0 w-full max-w-2xl mx-auto">
            <div ref={catRef} className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setCatOpen((o) => !o)}
                className="flex items-center gap-2 px-4 h-11 text-[#0A0A0A] dark:text-[#FAFAFA] font-bold text-xs tracking-widest uppercase transition-colors hover:text-primary cursor-pointer border-r-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)]"
              >
                <Menu size={16} strokeWidth={2.5} />
                CATEGORÍAS
                <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform ${catOpen ? "rotate-180" : ""}`} />
              </button>

              {catOpen && (
                <div className="absolute top-full left-0 mt-0 w-56 bg-[#FAFAFA] dark:bg-[#111111] border-2 border-t-0 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] py-1 z-50">
                  {categories.map((cat) => (
                    <a
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      onClick={closeCat}
                      className="flex items-center px-4 py-2.5 text-xs font-mono font-bold tracking-widest uppercase text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-primary hover:text-white transition-colors cursor-pointer"
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">{searchBar}</div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSearch} />

            {/* Cart */}
            <button
              onClick={openCartDrawer}
              aria-label="Abrir carrito"
              className="relative p-2 text-[#0A0A0A] dark:text-[#FAFAFA] hover:text-primary transition-colors cursor-pointer"
            >
              <ShoppingCart size={22} strokeWidth={2} />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-mono font-bold w-5 h-5 flex items-center justify-center border-2 border-[#0A0A0A]">
                  {itemCount}
                </span>
              )}
            </button>

            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] hover:border-primary transition-colors cursor-pointer"
                  aria-label="Menú de usuario"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="text-xs font-mono font-bold bg-primary text-white">
                      {user.email?.[0].toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-0 w-52 bg-[#FAFAFA] dark:bg-[#111111] border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] py-0 z-50">
                    <div className="px-4 py-3 border-b-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)]">
                      <p className="text-[10px] font-mono text-[#888888] truncate uppercase tracking-widest">
                        {user.email}
                      </p>
                    </div>
                    {[
                      { href: "/profile", label: "MI PERFIL" },
                      { href: "/favorites", label: "MIS FAVORITOS" },
                      { href: "/orders", label: "MIS PEDIDOS" },
                    ].map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center px-4 py-3 text-xs font-mono font-bold tracking-widest uppercase text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        onClick={() => setMenuOpen(false)}
                      >
                        {label}
                      </Link>
                    ))}
                    <hr className="border-t-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)]" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-3 text-xs font-mono font-bold tracking-widest uppercase text-red-600 hover:bg-red-600 hover:text-white w-full text-left transition-colors cursor-pointer"
                    >
                      <LogOut size={14} /> SALIR
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link href="/auth/login" className="btn-secondary text-xs py-2 px-4">
                  INGRESAR
                </Link>
                <Link href="/auth/register" className="btn-primary text-xs py-2 px-4">
                  REGISTRO
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ══ Mobile ══ */}
        <div className="md:hidden flex items-center h-14 px-4 gap-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)]">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 text-[#0A0A0A] dark:text-[#FAFAFA] hover:text-primary transition-colors cursor-pointer"
          >
            <Menu size={22} strokeWidth={2} />
          </button>

          <Link
            href="/"
            className="font-display font-bold text-xl tracking-[-0.05em] text-[#0A0A0A] dark:text-[#FAFAFA] uppercase flex-shrink-0 cursor-pointer"
          >
            DIMAR
          </Link>

          <div className="flex-1" />

          <button
            type="button"
            aria-label="Buscar"
            onClick={() => setSearchOpen(true)}
            className="p-2 text-[#0A0A0A] dark:text-[#FAFAFA] hover:text-primary transition-colors cursor-pointer"
          >
            <Search size={20} strokeWidth={2} />
          </button>

          <button
            onClick={openCartDrawer}
            aria-label="Abrir carrito"
            className="relative p-2 text-[#0A0A0A] dark:text-[#FAFAFA] hover:text-primary transition-colors cursor-pointer"
          >
            <ShoppingCart size={20} strokeWidth={2} />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-mono font-bold w-4 h-4 flex items-center justify-center border border-[#0A0A0A]">
                {itemCount}
              </span>
            )}
          </button>

          <ThemeToggle />
        </div>
      </nav>

      {/* ══════════════════════════════════════
          SEARCH MODAL (mobile)
      ══════════════════════════════════════ */}
      <div
        className={`fixed inset-0 z-[80] md:hidden flex flex-col transition-opacity duration-200 ${
          searchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/70" onClick={() => setSearchOpen(false)} />

        <div className="relative bg-[#FAFAFA] dark:bg-[#111111] border-b-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-mono font-bold tracking-widest uppercase text-[#0A0A0A] dark:text-[#FAFAFA]">
              BUSCAR
            </p>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-2 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex items-center w-full">
            <div className="flex w-full items-center border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] bg-white dark:bg-[#1A1A1A] h-12 px-4 gap-3 focus-within:border-primary">
              <Search size={16} className="text-[#888888] flex-shrink-0" />
              <input
                ref={mobileInputRef}
                value={query}
                onChange={handleQueryChange}
                placeholder="BUSCA PRODUCTOS..."
                className="flex-1 bg-transparent outline-none text-xs font-mono font-bold tracking-wider uppercase text-[#0A0A0A] dark:text-[#FAFAFA] placeholder:text-[#888888] min-w-0"
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                {micButton}
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSearch} />
                <button
                  type="button"
                  disabled={analyzingImage}
                  onClick={() => imageInputRef.current?.click()}
                  className={`p-1 cursor-pointer ${analyzingImage ? "text-primary animate-pulse" : "text-[#888888] hover:text-[#0A0A0A] dark:hover:text-white"}`}
                >
                  <Camera size={16} />
                </button>
              </div>
            </div>
          </form>

          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  onClick={() => setSearchOpen(false)}
                  className="text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1.5 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-primary hover:border-primary hover:text-white transition-colors cursor-pointer"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          LEFT DRAWER (mobile)
      ══════════════════════════════════════ */}
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 bg-black/60 z-[60] md:hidden transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#FAFAFA] dark:bg-[#0A0A0A] z-[70] border-r-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] flex flex-col md:hidden transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] flex-shrink-0">
          <Link
            href="/"
            onClick={closeDrawer}
            className="font-display font-bold text-xl tracking-[-0.05em] uppercase text-[#0A0A0A] dark:text-[#FAFAFA] cursor-pointer"
          >
            DIMAR
          </Link>
          <button
            onClick={closeDrawer}
            aria-label="Cerrar menú"
            className="p-1.5 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {user ? (
            <div className="px-4 py-4 border-b-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary flex items-center justify-center border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)]">
                  <span className="text-white font-mono font-bold text-sm">
                    {user.email?.[0].toUpperCase() ?? "U"}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-[#888888] truncate uppercase tracking-widest">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 border-b-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)] flex flex-col gap-2">
              <Link href="/auth/login" className="btn-secondary text-xs py-2 text-center" onClick={closeDrawer}>
                INGRESAR
              </Link>
              <Link href="/auth/register" className="btn-primary text-xs py-2 text-center" onClick={closeDrawer}>
                REGISTRARSE
              </Link>
            </div>
          )}

          <div className="py-2">
            <p className="px-4 pt-3 pb-1 text-[10px] font-mono font-bold text-[#888888] uppercase tracking-widest">
              CATEGORÍAS
            </p>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                onClick={closeDrawer}
                className="flex items-center px-4 py-3 text-xs font-mono font-bold tracking-widest uppercase text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-primary hover:text-white border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] transition-colors cursor-pointer"
              >
                {cat.name}
              </a>
            ))}
          </div>

          {user && (
            <div className="border-t-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)] py-2">
              <p className="px-4 pt-3 pb-1 text-[10px] font-mono font-bold text-[#888888] uppercase tracking-widest">
                MI CUENTA
              </p>
              {[
                { href: "/profile", label: "MI PERFIL", Icon: User },
                { href: "/favorites", label: "MIS FAVORITOS", Icon: Heart },
                { href: "/orders", label: "MIS PEDIDOS", Icon: Package },
              ].map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeDrawer}
                  className="flex items-center gap-3 px-4 py-3 text-xs font-mono font-bold tracking-widest uppercase text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
              <hr className="border-t-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)] my-1" />
              <button
                onClick={() => { closeDrawer(); handleSignOut(); }}
                className="flex items-center gap-3 px-4 py-3 text-xs font-mono font-bold tracking-widest uppercase text-red-600 hover:bg-red-600 hover:text-white w-full text-left transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                CERRAR SESIÓN
              </button>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 px-4 py-3 border-t-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)] flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#888888]">TEMA</span>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
