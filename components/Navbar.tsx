"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Store,
  LogOut,
  Search,
  Mic,
  Camera,
  Menu,
  ChevronRight,
  X,
  Heart,
  Package,
  User,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import ThemeToggle from "@/components/ThemeToggle";
import { useCartStore } from "@/lib/store/cart";
import { toast } from "@/components/ui/Toaster";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Category } from "@/types";

export default function Navbar() {
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleVoiceSearch = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const SpeechRecognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tu navegador no soporta búsqueda por voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-PE";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);
    recognition.start();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setListening(false);
      setSearchOpen(false);
      const params = new URLSearchParams();
      if (transcript.trim()) params.set("q", transcript.trim());
      router.push(`/products?${params}`);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Block body scroll when drawer or search modal is open
  useEffect(() => {
    if (drawerOpen || searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen, searchOpen]);

  // Focus input when search modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Close search modal on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/products${params.toString() ? `?${params}` : ""}`);
    setSearchOpen(false);
  };

  useEffect(() => {
    supabase
      .from("categories")
      .select("id,name,slug")
      .order("name")
      .then(({ data }) => {
        if (data) setCategories(data as Category[]);
      });
  }, []);

  const closeCat = useCallback(() => setCatOpen(false), []);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node))
        closeCat();
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

      const res = await fetch("/api/image-search", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.keywords) {
        setQuery(data.keywords);
        const params = new URLSearchParams({ q: data.keywords });
        router.push(`/products?${params}`);
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

  const searchBar = (
    <form onSubmit={handleSearch} className="flex items-center w-full">
      <div className="flex w-full items-center bg-surface-subtle hover:bg-surface-subtle/80 focus-within:bg-surface-base focus-within:ring-2 focus-within:ring-primary rounded-full h-11 px-5 gap-3 transition-all">
        <Search size={17} className="text-content-subtle flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="¿Qué estás buscando?"
          className="flex-1 bg-transparent outline-none text-sm text-content-base placeholder:text-content-subtle min-w-0"
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            title="Buscar por voz"
            onClick={handleVoiceSearch}
            className={`transition-colors ${listening ? "text-red-500 animate-pulse" : "text-content-subtle hover:text-primary"}`}
          >
            <Mic size={17} />
          </button>
          <button
            type="button"
            title="Buscar por imagen"
            disabled={analyzingImage}
            onClick={() => imageInputRef.current?.click()}
            className={`transition-colors ${analyzingImage ? "text-primary animate-pulse" : "text-content-subtle hover:text-primary"}`}
          >
            <Camera size={17} />
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <>
      <nav className="bg-surface-base border-b border-line sticky top-0 z-50">

        {/* ══ Desktop row ══ */}
        <div className="hidden md:grid grid-cols-[auto_1fr_auto] items-center h-16 max-w-7xl mx-auto px-4 gap-4">
          {/* Left: logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-primary flex-shrink-0"
          >
            <Store size={24} />
            <span>Dimar</span>
          </Link>

          {/* Center: categories + search inline */}
          <div className="flex items-center gap-0 w-full max-w-2xl mx-auto">
            <div ref={catRef} className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setCatOpen((o) => !o)}
                className="flex items-center gap-2 px-4 h-11 text-content-muted dark:text-white dark:hover:text-white/70 font-bold text-sm tracking-wide transition-colors whitespace-nowrap"
              >
                <Menu size={18} />
                CATEGORÍAS
              </button>

              {catOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-surface-base rounded-2xl shadow-xl border border-line-subtle py-2 z-50">
                  {categories.map((cat) => (
                    <a
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      onClick={closeCat}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-content-base hover:bg-primary-light hover:text-primary transition-colors"
                    >
                      {cat.name}
                      <ChevronRight size={14} className="text-content-subtle" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">{searchBar}</div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSearch}
            />

            <Link
              href="/cart"
              className="relative p-2 text-content-muted hover:text-primary transition-colors"
            >
              <ShoppingCart size={22} />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </Link>

            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 rounded-full hover:ring-2 hover:ring-primary transition-all"
                >
                  <Avatar>
                    <AvatarImage src={undefined} />
                    <AvatarFallback>
                      {user.email?.[0].toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-surface-base rounded-xl shadow-lg border border-line-subtle py-1">
                    <div className="px-4 py-2.5 border-b border-line-subtle">
                      <p className="text-xs text-content-subtle truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-content-base hover:bg-surface-hover"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-content-base hover:bg-surface-hover"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mis Favoritos
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-content-base hover:bg-surface-hover"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mis Pedidos
                    </Link>
                    <hr className="my-1 border-line-subtle" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut size={14} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link href="/auth/login" className="btn-secondary text-sm">
                  Ingresar
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ══ Mobile row ══ */}
        <div className="md:hidden flex items-center h-16 px-4 gap-2">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 text-content-muted hover:text-primary transition-colors"
          >
            <Menu size={22} />
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-primary flex-shrink-0"
          >
            <Store size={24} />
          </Link>

          <div className="flex-1" />

          <button
            type="button"
            aria-label="Buscar"
            onClick={() => setSearchOpen(true)}
            className="p-2 text-content-muted hover:text-primary transition-colors"
          >
            <Search size={22} />
          </button>

          <Link
            href="/cart"
            className="relative p-2 text-content-muted hover:text-primary transition-colors"
          >
            <ShoppingCart size={22} />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {itemCount}
              </span>
            )}
          </Link>

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
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60"
          onClick={() => setSearchOpen(false)}
        />

        {/* Panel */}
        <div className="relative bg-surface-base px-4 pt-4 pb-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-sm font-semibold text-content-base flex-1">¿Qué estás buscando?</p>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-1.5 rounded-lg text-content-subtle hover:text-content-base hover:bg-surface-subtle transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex items-center w-full">
            <div className="flex w-full items-center bg-surface-subtle focus-within:bg-surface-base focus-within:ring-2 focus-within:ring-primary rounded-full h-12 px-5 gap-3 transition-all">
              <Search size={17} className="text-content-subtle flex-shrink-0" />
              <input
                ref={mobileInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca productos, marcas..."
                className="flex-1 bg-transparent outline-none text-sm text-content-base placeholder:text-content-subtle min-w-0"
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  title="Buscar por voz"
                  onClick={handleVoiceSearch}
                  className={`transition-colors ${listening ? "text-red-500 animate-pulse" : "text-content-subtle hover:text-primary"}`}
                >
                  <Mic size={17} />
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSearch}
                />
                <button
                  type="button"
                  title="Buscar por imagen"
                  disabled={analyzingImage}
                  onClick={() => imageInputRef.current?.click()}
                  className={`transition-colors ${analyzingImage ? "text-primary animate-pulse" : "text-content-subtle hover:text-primary"}`}
                >
                  <Camera size={17} />
                </button>
              </div>
            </div>
          </form>

          {/* Categorías rápidas */}
          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  onClick={() => setSearchOpen(false)}
                  className="text-xs px-3 py-1.5 rounded-full border border-line text-content-muted hover:border-primary hover:text-primary transition-colors"
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

      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-surface-base z-[70] shadow-2xl flex flex-col md:hidden transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-line-subtle flex-shrink-0">
          <Link
            href="/"
            onClick={closeDrawer}
            className="flex items-center gap-2 font-bold text-xl text-primary"
          >
            <Store size={22} />
            Dimar
          </Link>
          <button
            onClick={closeDrawer}
            aria-label="Cerrar menú"
            className="p-2 text-content-subtle hover:text-content-base transition-colors rounded-lg hover:bg-surface-subtle"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer body – scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Auth section */}
          {user ? (
            <div className="px-4 py-4 border-b border-line-subtle">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={undefined} />
                  <AvatarFallback>
                    {user.email?.[0].toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-content-muted truncate">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 border-b border-line-subtle flex flex-col gap-2">
              <Link
                href="/auth/login"
                className="btn-secondary text-sm text-center"
                onClick={closeDrawer}
              >
                Ingresar
              </Link>
              <Link
                href="/auth/register"
                className="btn-primary text-sm text-center"
                onClick={closeDrawer}
              >
                Registrarse
              </Link>
            </div>
          )}

          {/* Categories */}
          <div className="py-2">
            <p className="px-4 pt-2 pb-1 text-xs font-semibold text-content-subtle uppercase tracking-wider">
              Categorías
            </p>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                onClick={closeDrawer}
                className="flex items-center justify-between px-4 py-3 text-sm text-content-base hover:bg-primary-light hover:text-primary transition-colors"
              >
                {cat.name}
                <ChevronRight size={14} className="text-content-subtle" />
              </a>
            ))}
          </div>

          {/* Account links – only when logged in */}
          {user && (
            <div className="border-t border-line-subtle py-2">
              <p className="px-4 pt-2 pb-1 text-xs font-semibold text-content-subtle uppercase tracking-wider">
                Mi cuenta
              </p>
              <Link
                href="/profile"
                onClick={closeDrawer}
                className="flex items-center gap-3 px-4 py-3 text-sm text-content-base hover:bg-surface-hover transition-colors"
              >
                <User size={16} className="text-content-subtle" />
                Mi Perfil
              </Link>
              <Link
                href="/favorites"
                onClick={closeDrawer}
                className="flex items-center gap-3 px-4 py-3 text-sm text-content-base hover:bg-surface-hover transition-colors"
              >
                <Heart size={16} className="text-content-subtle" />
                Mis Favoritos
              </Link>
              <Link
                href="/orders"
                onClick={closeDrawer}
                className="flex items-center gap-3 px-4 py-3 text-sm text-content-base hover:bg-surface-hover transition-colors"
              >
                <Package size={16} className="text-content-subtle" />
                Mis Pedidos
              </Link>
              <hr className="my-1 border-line-subtle" />
              <button
                onClick={() => {
                  closeDrawer();
                  handleSignOut();
                }}
                className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        {/* Drawer footer – theme toggle */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-line-subtle flex items-center justify-between">
          <span className="text-sm text-content-muted">Tema</span>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
