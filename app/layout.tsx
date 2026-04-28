import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/Toaster";
import CartDrawer from "@/components/CartDrawer";
import { SITE_URL, SITE_NAME, SITE_DESC } from "@/lib/seo";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "es_PE",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Normaliza el valor: acepta con o sin # (# es comentario en .env)
function toHex(val: string, fallback: string) {
  const v = (val ?? "").trim();
  if (!v) return fallback;
  return v.startsWith("#") ? v : `#${v}`;
}

const primary = toHex(process.env.NEXT_PUBLIC_COLOR_PRIMARY ?? "", "#3b82f6");
const secondary = toHex(process.env.NEXT_PUBLIC_COLOR_SECONDARY ?? "", "#f59e0b");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Inyectar como style inline en <html> evita hydration mismatch
  const cssVars = {
    "--color-primary": primary,
    "--color-primary-dark": `color-mix(in srgb, ${primary} 80%, black)`,
    "--color-primary-light": `color-mix(in srgb, ${primary} 12%, white)`,
    "--color-secondary": secondary,
    "--color-secondary-dark": `color-mix(in srgb, ${secondary} 80%, black)`,
    "--color-secondary-light": `color-mix(in srgb, ${secondary} 12%, white)`,
  } as React.CSSProperties;

  return (
    <html lang="es" data-scroll-behavior="smooth" style={cssVars} suppressHydrationWarning>
      <head>
        {/* Script anti-flash: aplica el tema ANTES de que React hidrate */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-display antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster />
        <CartDrawer />
      </body>
    </html>
  );
}
