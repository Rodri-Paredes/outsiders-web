import Link from 'next/link';
import CartView from './view';

export default function CartPage() {
  return (
    <main className="bg-black min-h-screen text-white">
      <section className="py-16 px-6 max-w-[1400px] mx-auto mt-32">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight">Tu Carrito</h1>
            <p className="text-base font-light text-gray-light mt-2">Productos seleccionados</p>
          </div>
          <Link 
            href="/#products" 
            className="hidden md:block text-sm font-light text-white border-b border-white pb-1 hover:text-gray-light hover:border-gray-light transition-colors tracking-wide uppercase"
          >
            Seguir Comprando
          </Link>
        </div>

        <CartView />
      </section>
    </main>
  );
}
