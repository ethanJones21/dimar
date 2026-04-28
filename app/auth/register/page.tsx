"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";

function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("email rate limit") || m.includes("too many requests") || m.includes("over_email_send_rate_limit"))
    return "Has superado el límite de intentos. Espera unos minutos e inténtalo de nuevo.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Este correo ya está registrado. ¿Quieres iniciar sesión?";
  if (m.includes("password should be at least"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("invalid email") || m.includes("unable to validate email"))
    return "El correo electrónico no es válido.";
  if (m.includes("signup is disabled"))
    return "El registro está deshabilitado temporalmente.";
  if (m.includes("email not confirmed"))
    return "Debes confirmar tu correo antes de iniciar sesión.";
  if (m.includes("invalid login credentials") || m.includes("invalid credentials"))
    return "Correo o contraseña incorrectos.";
  if (m.includes("network") || m.includes("fetch"))
    return "Error de conexión. Verifica tu internet e inténtalo de nuevo.";
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) { setError(translateAuthError(error.message)); setLoading(false); return; }
    if (data.user && !data.session) setSuccess(true);
    else { router.push("/"); router.refresh(); }
    setLoading(false);
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#888888] mb-2">
      {children}
    </label>
  );

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 border-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)] flex items-center justify-center mx-auto mb-8">
            <Mail size={28} className="text-primary" strokeWidth={2} />
          </div>
          <h2
            className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA] mb-4"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}
          >
            REVISA<br />TU CORREO
          </h2>
          <p className="text-xs font-mono text-[#888888] mb-2 uppercase tracking-widest">
            ENLACE ENVIADO A
          </p>
          <p className="text-sm font-mono font-bold text-[#0A0A0A] dark:text-[#FAFAFA] mb-8 border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] px-4 py-2">
            {email}
          </p>
          <Link href="/auth/login" className="btn-primary py-4 px-8">
            IR A INICIAR SESIÓN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 border-r-4 border-[#0A0A0A]">
        <Link href="/" className="font-display font-bold text-white text-2xl tracking-[-0.05em] uppercase cursor-pointer">
          DIMAR
        </Link>
        <div>
          <p className="text-[10px] font-mono text-[rgba(255,255,255,0.5)] uppercase tracking-widest mb-4">
            ÚNETE HOY
          </p>
          <h2
            className="font-display font-bold text-white"
            style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)", lineHeight: 0.95, letterSpacing: "-0.03em" }}
          >
            CREA TU<br />CUENTA.
          </h2>
        </div>
        <p className="text-[10px] font-mono text-[rgba(255,255,255,0.3)] uppercase tracking-widest">
          © {new Date().getFullYear()} DIMAR STORE
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden block font-display font-bold text-xl tracking-[-0.05em] uppercase text-[#0A0A0A] dark:text-[#FAFAFA] mb-10 cursor-pointer">
            DIMAR
          </Link>

          <div className="mb-8">
            <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-2">REGISTRO</p>
            <h1
              className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
              style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}
            >
              CREAR<br />CUENTA
            </h1>
          </div>

          {error && (
            <div className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20 px-4 py-3 mb-5">
              <p className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-widest">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label>Nombre Completo</Label>
              <input required className="input" placeholder="Juan Pérez"
                value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <input type="email" required className="input" placeholder="tu@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Contraseña (mín. 6 caracteres)</Label>
              <input type="password" required minLength={6} className="input" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 gap-3 mt-2">
              {loading ? "CREANDO CUENTA..." : "CREAR CUENTA"}
              {!loading && <ArrowRight size={15} strokeWidth={2.5} />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)]">
            <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest text-center">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="text-primary hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] font-bold transition-colors cursor-pointer">
                INICIA SESIÓN
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
