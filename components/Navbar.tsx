"use client";

import Link from "next/link";
import {
  ShoppingCart,
  User,
  Store,
  LogOut,
  Settings,
  Search,
  Mic,
  Camera,
  Menu,
  ChevronRight,
} from "lucide-react";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (
        window as typeof window & {
          SpeechRecognition?: typeof globalThis.SpeechRecognition;
          webkitSpeechRecognition?: typeof globalThis.SpeechRecognition;
        }
      ).SpeechRecognition ??
      (
        window as typeof window & {
          webkitSpeechRecognition?: typeof globalThis.SpeechRecognition;
        }
      ).webkitSpeechRecognition;

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
      const params = new URLSearchParams();
      if (transcript.trim()) params.set("q", transcript.trim());
      router.push(`/products?${params}`);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => setIsAdmin(profile?.role === "admin"));
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/products${params.toString() ? `?${params}` : ""}`);
  };

  // Fetch categories once
  useEffect(() => {
    supabase
      .from("categories")
      .select("id,name,slug")
      .order("name")
      .then(({ data }) => {
        if (data) setCategories(data as Category[]);
      });
  }, []);

  // Close dropdown on outside click
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
      } else if (res.status === 429) {
        toast(
          "No encontramos lo que buscabas. Intenta con otra imagen.",
          "error",
        );
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
    setIsAdmin(false);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-blue-600 flex-shrink-0"
        >
          <Store size={24} />
          <span className="hidden sm:block">Dimar</span>
        </Link>

        <div className="flex items-center justify-center gap-2 min-w-0">
          <div ref={catRef} className="relative hidden md:block flex-shrink-0">
            <button
              type="button"
              onClick={() => setCatOpen((o) => !o)}
              className="flex items-center gap-2 py-2 text-blue-600 hover:text-blue-700 font-bold text-sm tracking-wide transition-colors"
            >
              <Menu size={18} />
              CATEGORÍAS
            </button>

            {catOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                {categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    onClick={closeCat}
                    className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {cat.name}
                    <ChevronRight size={14} className="text-slate-400" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSearch}
          />

          <form
            onSubmit={handleSearch}
            className="flex items-center"
          >
            <div className="flex w-[480px] items-center bg-slate-100 hover:bg-slate-200/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 rounded-full h-11 px-5 gap-3 transition-all">
              <Search size={17} className="text-slate-400 flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué estás buscando?"
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 min-w-0"
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  title="Buscar por voz"
                  onClick={handleVoiceSearch}
                  className={`transition-colors ${listening ? "text-red-500 animate-pulse" : "text-slate-400 hover:text-blue-600"}`}
                >
                  <Mic size={17} />
                </button>
                <button
                  type="button"
                  title="Buscar por imagen"
                  disabled={analyzingImage}
                  onClick={() => imageInputRef.current?.click()}
                  className={`transition-colors ${analyzingImage ? "text-blue-500 animate-pulse" : "text-slate-400 hover:text-blue-600"}`}
                >
                  <Camera size={17} />
                </button>
              </div>
            </div>
          </form>
        </div>
        {/* end center block */}

        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="hidden lg:flex items-center gap-1 mr-2">
            {user && (
              <Link
                href="/orders"
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Pedidos
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Settings size={14} />
                Admin
              </Link>
            )}
          </div>

          <Link
            href="/cart"
            className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ShoppingCart size={22} />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <User size={20} className="text-slate-600" />
                <span className="hidden xl:block text-sm text-slate-600 max-w-[120px] truncate">
                  {user.email}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1">
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mis Pedidos
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings size={14} /> Panel Admin
                    </Link>
                  )}
                  <hr className="my-1 border-slate-100" />
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
    </nav>
  );
}
