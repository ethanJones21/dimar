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

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#888888] mb-2">
    {children}
  </label>
);

const SectionTitle = ({ children, sub }: { children: React.ReactNode; sub?: string }) => (
  <div className="pb-4 mb-5 border-b-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.2)]">
    <h2 className="font-display font-bold text-xs uppercase tracking-widest text-[#0A0A0A] dark:text-[#FAFAFA]">
      {children}
    </h2>
    {sub && <p className="text-[10px] font-mono text-[#888888] mt-1">{sub}</p>}
  </div>
);

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
      supabase.from("profiles").upsert({ id: userId, full_name: fullName.trim(), phone: phone.trim() }),
      street.trim()
        ? supabase.from("addresses").upsert(
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
      <div className="border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] p-6 bg-white dark:bg-[#111111] space-y-5">
        <SectionTitle>DATOS PERSONALES</SectionTitle>
        <div>
          <Label>Nombre completo</Label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
            className="input"
          />
        </div>
        <div>
          <Label>Teléfono</Label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+51 999 999 999"
            className="input"
          />
        </div>
      </div>

      {/* Dirección */}
      <div className="border-2 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.5)] p-6 bg-white dark:bg-[#111111] space-y-5">
        <SectionTitle sub="Se usará para pre-llenar el formulario de pago.">
          DIRECCIÓN DE ENVÍO
        </SectionTitle>
        <div>
          <Label>Dirección</Label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Av. Larco 123, Miraflores"
            className="input"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Ciudad</Label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lima" className="input" />
          </div>
          <div>
            <Label>Departamento</Label>
            <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="Lima" className="input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Código Postal</Label>
            <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="15001" className="input" />
          </div>
          <div>
            <Label>País</Label>
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Perú" className="input" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-4">
        {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
      </button>
    </form>
  );
}
