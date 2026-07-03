import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-medium uppercase tracking-wide text-black mb-3">
          Producto no encontrado
        </h1>
        <p className="text-gray-500 mb-8">
          Este producto no existe o ya no está disponible en la tienda.
        </p>
        <Link
          href="/shop"
          className="inline-block px-8 py-3 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-gray-900 transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
