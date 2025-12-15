import Link from 'next/link';
import Navbar from '../../components/Navbar';
import CartView from './view';

export default function CartPage() {
  return (
    <main className="bg-white min-h-screen text-black">
      {/* Top bar */}
      <div className="w-full text-xs font-medium text-[#d4a574] bg-[#1a3e3d] flex items-center justify-center h-10 px-6">
        <span>🔥 envíos gratis en pedidos +100bs — devoluciones fáciles</span>
      </div>

      <Navbar />

      <section className="py-16 px-6 max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-black">tu bolsa</h1>
            <p className="text-base font-medium text-gray-600">productos seleccionados</p>
          </div>
          <Link href="/#products" className="text-sm font-bold text-[#2d5f5d] border-b-2 border-[#2d5f5d] pb-1 hover:text-[#d4a574] hover:border-[#d4a574] transition-colors">
            seguir comprando
          </Link>
        </div>

        <CartView />
      </section>
    </main>
  );
}
