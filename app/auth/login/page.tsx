"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";

function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("email rate limit") || m.includes("too many requests") || m.includes("over_email_send_rate_limit"))
    return "Has superado el límite de intentos. Espera unos minutos e inténtalo de nuevo.";
  if (m.includes("email not confirmed"))
    return "Debes confirmar tu correo antes de iniciar sesión.";
  if (m.includes("invalid login credentials") || m.includes("invalid credentials"))
    return "Correo o contraseña incorrectos.";
  if (m.includes("network") || m.includes("fetch"))
    return "Error de conexión. Verifica tu internet e inténtalo de nuevo.";
  return "Correo o contraseña incorrectos.";
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(translateAuthError(error.message)); setLoading(false); return; }
    router.push(redirect);
    router.refresh();
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#888888] mb-2">
      {children}
    </label>
  );

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      {/* Left — brutalist branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A0A0A] flex-col justify-between p-12 border-r-4 border-[#0A0A0A]">
        <Link href="/" className="font-display font-bold text-[#FAFAFA] text-2xl tracking-[-0.05em] uppercase cursor-pointer">
          DIMAR
        </Link>
        <div>
          <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-4">
            BIENVENIDO DE VUELTA
          </p>
          <h2
            className="font-display font-bold text-[#FAFAFA]"
            style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)", lineHeight: 0.95, letterSpacing: "-0.03em" }}
          >
            INICIA<br />SESIÓN.
          </h2>
        </div>
        <p className="text-[10px] font-mono text-[#444444] uppercase tracking-widest">
          © {new Date().getFullYear()} DIMAR STORE
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden block font-display font-bold text-xl tracking-[-0.05em] uppercase text-[#0A0A0A] dark:text-[#FAFAFA] mb-10 cursor-pointer">
            DIMAR
          </Link>

          <div className="mb-8">
            <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-2">ACCESO</p>
            <h1
              className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
              style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}
            >
              INICIAR<br />SESIÓN
            </h1>
          </div>

          {error && (
            <div className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20 px-4 py-3 mb-5">
              <p className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Email</Label>
              <input type="email" required className="input" placeholder="tu@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Contraseña</Label>
              <input type="password" required className="input" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 gap-3 mt-2">
              {loading ? "PROCESANDO..." : "INICIAR SESIÓN"}
              {!loading && <ArrowRight size={15} strokeWidth={2.5} />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)]">
            <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest text-center">
              ¿No tienes cuenta?{" "}
              <Link href="/auth/register" className="text-primary hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] font-bold transition-colors cursor-pointer">
                REGÍSTRATE
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
