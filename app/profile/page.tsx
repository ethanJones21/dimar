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
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Mi Perfil</h1>
      <p className="text-slate-500 text-sm mb-8">{user.email}</p>
      <ProfileForm profile={profile} address={address} userId={user.id} />
    </div>
  );
}
