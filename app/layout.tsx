import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Dimar Store",
    template: "%s | Dimar Store",
  },
  description: "Tu tienda online de confianza",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="bg-slate-800 text-slate-300 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="font-semibold text-white text-lg mb-1">Dimar Store</p>
            <p className="text-sm">© {new Date().getFullYear()} Todos los derechos reservados</p>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
