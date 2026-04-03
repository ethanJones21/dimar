import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-primary mb-4">404</p>
        <h1 className="text-2xl font-bold text-content-base mb-2">Página no encontrada</h1>
        <p className="text-content-muted mb-8">Lo que buscas no existe o fue movido</p>
        <Link href="/" className="btn-primary">Ir al Inicio</Link>
      </div>
    </div>
  );
}
