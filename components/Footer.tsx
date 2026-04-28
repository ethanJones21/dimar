import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

const LINKS = {
  tienda: [
    { label: "Todos los productos", href: "/products" },
    { label: "Categorías", href: "/products" },
    { label: "Ofertas", href: "/products" },
    { label: "Novedades", href: "/products" },
  ],
  cuenta: [
    { label: "Mis Pedidos", href: "/orders" },
    { label: "Iniciar sesión", href: "/auth/login" },
    { label: "Registrarse", href: "/auth/register" },
    { label: "Mi carrito", href: "/cart" },
  ],
  ayuda: [
    { label: "Preguntas frecuentes", href: "#" },
    { label: "Envíos y devoluciones", href: "#" },
    { label: "Términos y condiciones", href: "#" },
    { label: "Política de privacidad", href: "#" },
  ],
};

const SOCIAL = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

const PAYMENT_METHODS = ["VISA", "MASTERCARD", "YAPE", "MERCADOPAGO"];

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest mb-4 pb-2 border-b border-[rgba(255,255,255,0.12)]">
        {title}
      </p>
      <ul className="flex flex-col gap-2">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-xs font-mono text-[#AAAAAA] hover:text-[#FAFAFA] transition-colors duration-150 cursor-pointer"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-[#FAFAFA] mt-0 border-t-4 border-[#0A0A0A]">

      {/* ── Top editorial strip ── */}
      <div className="border-b border-[rgba(255,255,255,0.1)]">
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-2">
              Dimar Store — Lima, Perú
            </p>
            <div
              className="font-display font-bold text-[#FAFAFA] leading-none"
              style={{ fontSize: "clamp(3rem, 8vw, 6rem)", letterSpacing: "-0.04em" }}
            >
              DIMAR
            </div>
          </div>
          <p className="text-xs font-mono text-[#666666] max-w-xs leading-relaxed">
            Tu tienda online de confianza. Productos de calidad con envío rápido a todo el país.
          </p>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand col */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 text-xs font-mono text-[#666666]">
            <a
              href="mailto:contacto@dimar.pe"
              className="flex items-center gap-2 hover:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              <Mail size={13} /> contacto@dimar.pe
            </a>
            <a
              href="tel:+51999999999"
              className="flex items-center gap-2 hover:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              <Phone size={13} /> +51 999 999 999
            </a>
            <span className="flex items-center gap-2">
              <MapPin size={13} /> Lima, Perú
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 flex items-center justify-center border border-[rgba(255,255,255,0.2)] text-[#666666] hover:text-[#FAFAFA] hover:border-[#FAFAFA] transition-colors cursor-pointer"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>

          {/* Payment badges */}
          <div>
            <p className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest mb-3">
              Pagos seguros
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_METHODS.map((m) => (
                <span
                  key={m}
                  className="px-2 py-1 border border-[rgba(255,255,255,0.15)] text-[10px] font-mono font-bold text-[#666666]"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <LinkColumn title="Tienda" links={LINKS.tienda} />
        <LinkColumn title="Mi cuenta" links={LINKS.cuenta} />
        <LinkColumn title="Ayuda" links={LINKS.ayuda} />
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-[rgba(255,255,255,0.1)]">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] font-mono text-[#444444]">
            © {new Date().getFullYear()} DIMAR STORE — TODOS LOS DERECHOS RESERVADOS
          </p>
          <div className="flex items-center gap-6">
            {["Privacidad", "Términos", "Cookies"].map((label) => (
              <Link
                key={label}
                href="#"
                className="text-[10px] font-mono text-[#444444] hover:text-[#FAFAFA] transition-colors uppercase tracking-widest cursor-pointer"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
