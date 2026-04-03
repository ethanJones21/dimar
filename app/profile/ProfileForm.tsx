"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toaster";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

interface AddressRow {
  id?: string;
  user_id?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

const inputCls = "w-full border border-line rounded-xl px-4 py-2.5 text-sm text-content-base bg-surface-base outline-none focus:ring-2 focus:ring-primary";

export default function ProfileForm({
  profile,
  address,
  userId,
}: {
  profile: Profile | null;
  address: AddressRow | null;
  userId: string;
}) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone]       = useState(profile?.phone ?? "");
  const [street, setStreet]     = useState(address?.street ?? "");
  const [city, setCity]         = useState(address?.city ?? "");
  const [state, setState]       = useState(address?.state ?? "");
  const [zip, setZip]           = useState(address?.zip ?? "");
  const [country, setCountry]   = useState(address?.country ?? "Perú");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    const [profileRes, addressRes] = await Promise.all([
      supabase
        .from("profiles")
        .upsert({ id: userId, full_name: fullName.trim(), phone: phone.trim() }),
      street.trim()
        ? supabase
            .from("addresses")
            .upsert(
              { user_id: userId, street: street.trim(), city: city.trim(), state: state.trim(), zip: zip.trim(), country: country.trim() },
              { onConflict: "user_id" }
            )
        : Promise.resolve({ error: null }),
    ]);

    if (profileRes.error || addressRes.error) {
      toast("No se pudo guardar los datos", "error");
    } else {
      toast("Perfil actualizado", "success");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos personales */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-content-base">Datos personales</h2>
        <div>
          <label className="block text-sm font-medium text-content-base mb-1.5">Nombre completo</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-content-base mb-1.5">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+51 999 999 999"
            className={inputCls}
          />
        </div>
      </div>

      {/* Dirección de envío */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-content-base">Dirección de envío</h2>
        <p className="text-xs text-content-muted -mt-3">Se usará para pre-llenar el formulario de pago.</p>
        <div>
          <label className="block text-sm font-medium text-content-base mb-1.5">Dirección</label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Av. Larco 123, Miraflores"
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-content-base mb-1.5">Ciudad</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Lima"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-content-base mb-1.5">Departamento</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Lima"
              className={inputCls}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-content-base mb-1.5">Código Postal</label>
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="15001"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-content-base mb-1.5">País</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Perú"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
