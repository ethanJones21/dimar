import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Package } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";
export const metadata = { title: "Gestión de Productos" };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") redirect("/");

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Productos</h1>
        </div>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nuevo Producto
        </Link>
      </div>

      <div className="card overflow-hidden">
        {products && products.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Producto</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Categoría</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Precio</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Stock</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Estado</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Package size={16} className="text-slate-400" />
                        </div>
                      )}
                      <span className="font-medium text-slate-800 max-w-[200px] truncate">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.category?.name || "—"}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700">{formatPrice(product.price)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {product.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={16} />
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">No hay productos todavía</p>
            <Link href="/admin/products/new" className="btn-primary">Agregar primer producto</Link>
          </div>
        )}
      </div>
    </div>
  );
}
