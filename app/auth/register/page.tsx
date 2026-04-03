"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";

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

    if (error) {
      setError(translateAuthError(error.message));
      setLoading(false);
      return;
    }

    if (data.user && !data.session) {
      setSuccess(true);
    } else {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-content-base mb-2">¡Revisa tu correo!</h2>
          <p className="text-content-muted mb-6">
            Hemos enviado un enlace de confirmación a <strong>{email}</strong>.
          </p>
          <Link href="/auth/login" className="btn-primary">Ir a Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-page">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-2xl mb-2">
            <Store size={28} />
            Dimar Store
          </div>
          <h1 className="text-xl font-bold text-content-base">Crear Cuenta</h1>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-content-base mb-1">Nombre Completo</label>
            <input
              required
              className="input"
              placeholder="Juan Pérez"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-content-base mb-1">Email</label>
            <input
              type="email"
              required
              className="input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-content-base mb-1">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              className="input"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-content-muted mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
