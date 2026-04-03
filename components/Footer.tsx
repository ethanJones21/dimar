import Link from "next/link";
import {
  Store,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

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

const PAYMENT_METHODS = ["Visa", "Mastercard", "Yape", "Culqi"];

const colHeading =
  "text-white font-semibold mb-4 text-sm uppercase tracking-wide";

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className={colHeading}>{title}</p>
      <ul className="flex flex-col gap-2.5">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm dark:hover:text-white transition-colors"
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
    <footer className="text-slate-400 mt-16 bg-surface-base border-t border-2 dark:border-0">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-content-base dark:text-white font-bold text-xl"
          >
            <Store size={22} />
            Dimar Store
          </Link>
          <p className="text-sm leading-relaxed">
            Tu tienda online de confianza. Productos de calidad con envío rápido
            a todo el país.
          </p>
          <div className="flex flex-col gap-2 text-sm text-black/60 dark:text-white/80">
            <a
              href="mailto:contacto@dimar.pe"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail size={14} /> contacto@dimar.pe
            </a>
            <a
              href="tel:+51999999999"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone size={14} /> +51 999 999 999
            </a>
            <span className="flex items-center gap-2">
              <MapPin size={14} /> Lima, Perú
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="p-2 rounded-lg bg-content-base text-white dark:bg-white/10 hover:bg-primary hover:text-white transition-colors"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        <LinkColumn title="Tienda" links={LINKS.tienda} />
        <LinkColumn title="Mi cuenta" links={LINKS.cuenta} />

        {/* Ayuda + Pagos */}
        <div>
          <LinkColumn title="Ayuda" links={LINKS.ayuda} />
          <p className={`${colHeading} mt-6`}>Pagos seguros</p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 bg-content-base dark:bg-white/10 rounded text-xs text-slate-300 font-medium"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-2 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>
            © {new Date().getFullYear()} Dimar Store. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="dark:hover:text-white transition-colors">
              Privacidad
            </Link>
            <Link href="#" className="dark:hover:text-white transition-colors">
              Términos
            </Link>
            <Link href="#" className="dark:hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
