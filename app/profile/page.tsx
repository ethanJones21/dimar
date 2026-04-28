import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "Mi Perfil" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/profile");

  const [{ data: profile }, { data: address }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("addresses").select("*").eq("user_id", user.id).single(),
  ]);

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] min-h-screen">
      {/* ── Page header ── */}
      <div className="border-b-4 border-[#0A0A0A] dark:border-[rgba(255,255,255,0.6)]">
        <div className="max-w-xl mx-auto px-4 py-10">
          <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-2">MI CUENTA</p>
          <h1
            className="font-display font-bold text-[#0A0A0A] dark:text-[#FAFAFA]"
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}
          >
            MI PERFIL
          </h1>
          <p className="text-[10px] font-mono text-[#888888] mt-3 uppercase tracking-widest">{user.email}</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10">
        <ProfileForm profile={profile} address={address} userId={user.id} />
      </div>
    </div>
  );
}
