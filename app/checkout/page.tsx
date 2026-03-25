"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";
import { Address } from "@/types";
import { CreditCard, MapPin } from "lucide-react";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "Colombia",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login?redirect=/checkout");
        return;
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          total: total(),
          shipping_address: address,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      toast("¡Pedido realizado exitosamente!", "success");
      router.push(`/orders/${order.id}`);
    } catch (err) {
      toast("Error al procesar el pedido. Intenta de nuevo.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Finalizar Compra</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
        {/* Shipping */}
        <div>
          <div className="card p-6">
            <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Dirección de Envío
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                <input
                  required
                  className="input"
                  placeholder="Calle 123 #45-67"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
                  <input
                    required
                    className="input"
                    placeholder="Bogotá"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                  <input
                    required
                    className="input"
                    placeholder="Cundinamarca"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código Postal</label>
                <input
                  className="input"
                  placeholder="110111"
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="card p-6 mt-4">
            <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-blue-600" />
              Método de Pago
            </h2>
            <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
              💳 Pago contra entrega disponible. Integra Stripe o PayU para pagos en línea.
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="card p-6 h-fit sticky top-20">
          <h2 className="font-bold text-lg text-slate-800 mb-4">Resumen del Pedido</h2>
          <div className="space-y-3 mb-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-slate-600 truncate max-w-[200px]">{product.name} x{quantity}</span>
                <span className="font-medium">{formatPrice(product.price * quantity)}</span>
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Subtotal</span>
            <span>{formatPrice(total())}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600 mb-4">
            <span>Envío</span>
            <span className="text-green-600 font-medium">Gratis</span>
          </div>
          <div className="flex justify-between font-bold text-xl mb-6">
            <span>Total</span>
            <span className="text-blue-600">{formatPrice(total())}</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? "Procesando..." : "Confirmar Pedido"}
          </button>
        </div>
      </form>
    </div>
  );
}
