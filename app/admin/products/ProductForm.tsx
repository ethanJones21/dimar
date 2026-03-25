"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";
import { Category, Product } from "@/types";
import { X, Plus } from "lucide-react";

interface Props {
  product?: Product;
  categories: Category[];
}

export default function ProductForm({ product, categories }: Props) {
  const isEdit = !!product;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    compare_price: product?.compare_price?.toString() || "",
    stock: product?.stock?.toString() || "0",
    category_id: product?.category_id || "",
    images: product?.images || [] as string[],
    featured: product?.featured || false,
    active: product?.active ?? true,
  });

  const addImage = () => {
    if (imageUrl.trim() && !form.images.includes(imageUrl.trim())) {
      setForm({ ...form, images: [...form.images, imageUrl.trim()] });
      setImageUrl("");
    }
  };

  const removeImage = (url: string) => {
    setForm({ ...form, images: form.images.filter((i) => i !== url) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      stock: parseInt(form.stock),
      category_id: form.category_id || null,
      images: form.images,
      featured: form.featured,
      active: form.active,
      slug: form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from("products").update(payload).eq("id", product!.id));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }

    if (error) {
      toast("Error al guardar el producto", "error");
      console.error(error);
    } else {
      toast(isEdit ? "Producto actualizado" : "Producto creado", "success");
      router.push("/admin/products");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">← Productos</Link>
        <h1 className="text-2xl font-bold text-slate-800 mt-1">
          {isEdit ? "Editar Producto" : "Nuevo Producto"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-700">Información Básica</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre del producto" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción *</label>
            <textarea
              required
              rows={4}
              className="input resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción detallada del producto..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
            <select className="input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-700">Precios y Stock</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio *</label>
              <input required type="number" min="0" step="100" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="99900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio Comparación</label>
              <input type="number" min="0" step="100" className="input" value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} placeholder="129900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock *</label>
              <input required type="number" min="0" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-700">Imágenes</h2>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="URL de la imagen..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
            />
            <button type="button" onClick={addImage} className="btn-secondary flex items-center gap-1">
              <Plus size={16} /> Agregar
            </button>
          </div>
          {form.images.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {form.images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt={`img-${i}`} className="w-20 h-20 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeImage(img)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Configuración</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-blue-600" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              <span className="text-sm font-medium text-slate-700">Producto Activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-blue-600" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              <span className="text-sm font-medium text-slate-700">Destacado en Home</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Guardando..." : isEdit ? "Actualizar Producto" : "Crear Producto"}
          </button>
          <Link href="/admin/products" className="btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
