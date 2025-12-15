import ProductList from '../components/ProductList';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <main className="bg-white min-h-screen text-black">

      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full h-[88vh] overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <img 
          src="https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1600" 
          alt="Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white mb-8 drop-shadow-2xl">
            NO LIMITS
          </h1>
          <div className="flex flex-col items-center gap-6">
            <p className="text-base md:text-lg font-medium text-white/90">colección primavera/verano 2025</p>
            {/* <Link href="#products" className="mt-2 bg-[#d4a574] text-[#2d5f5d] px-10 py-4 text-sm font-bold hover:bg-[#e6b885] transition-all transform hover:scale-105 rounded-sm">
              ver todo
            </Link> */}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="w-full bg-[#2d5f5d] text-[#d4a574] py-4 overflow-hidden border-y border-[#d4a574]/20">
        <div className="whitespace-nowrap animate-marquee flex gap-16 items-center">
          {Array(10).fill("⚡ NUEVA COLECCIÓN • OVERSIZE FIT • ENVÍO GRATIS • EDICIÓN LIMITADA • ").map((text, i) => (
            <span key={i} className="text-sm font-bold">{text}</span>
          ))}
        </div>
      </div>

      {/* Product Showcase */}
      <section id="products" className="py-16 px-6 max-w-[1800px] mx-auto bg-white">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-black mb-2">nuevos drops</h2>
            <p className="text-base font-medium text-gray-600">lo último de la calle 🔥</p>
          </div>
          <Link href="#products" className="text-sm font-bold text-[#2d5f5d] border-b-2 border-[#2d5f5d] pb-1 hover:text-[#d4a574] hover:border-[#d4a574] transition-colors">
            ver todo
          </Link>
        </div>
        
        <ProductList />
      </section>

      {/* Editorial Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-10 max-w-[1800px] mx-auto">
        <div className="relative h-[70vh] group overflow-hidden cursor-pointer rounded-lg">
          <img 
            src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1600" 
            alt="Editorial 1" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-[#2d5f5d]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-3xl font-black text-[#d4a574] bg-[#2d5f5d] px-8 py-4 hover:bg-[#d4a574] hover:text-[#2d5f5d] transition-all">accesorios</span>
          </div>
        </div>
        <div className="relative h-[70vh] group overflow-hidden cursor-pointer rounded-lg">
          <img 
            src="https://images.pexels.com/photos/2955376/pexels-photo-2955376.jpeg?auto=compress&cs=tinysrgb&w=1600" 
            alt="Editorial 2" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-[#2d5f5d]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-3xl font-black text-[#d4a574] bg-[#2d5f5d] px-8 py-4 hover:bg-[#d4a574] hover:text-[#2d5f5d] transition-all">oversize</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-10 px-6">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-black">OUTSIDERS</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              streetwear para la generación que no se detiene. sin límites, sin reglas.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-black mb-4">tienda</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-black transition-colors">todos los productos</Link></li>
              <li><Link href="#" className="hover:text-black transition-colors">nuevos drops</Link></li>
              <li><Link href="#" className="hover:text-black transition-colors">accesorios</Link></li>
              <li><Link href="#" className="hover:text-black transition-colors">archivo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-black mb-4">info</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-black transition-colors">sobre nosotros</Link></li>
              <li><Link href="#" className="hover:text-black transition-colors">envíos</Link></li>
              <li><Link href="#" className="hover:text-black transition-colors">devoluciones</Link></li>
              <li><Link href="#" className="hover:text-black transition-colors">contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-black mb-4">newsletter</h4>
            <div className="flex border-b-2 border-gray-300 pb-2 focus-within:border-black transition-colors">
              <input 
                type="email" 
                placeholder="tu email" 
                className="bg-transparent w-full text-sm text-black placeholder-gray-400 focus:outline-none"
              />
              <button className="text-sm text-black font-bold hover:text-gray-600">unirse</button>
            </div>
          </div>
        </div>
        
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2025 outsiders. hecho con 🔥 para la calle</p>
          <div className="flex gap-6 mt-4 md:mt-0 font-medium">
            <Link href="#" className="hover:text-black transition-colors">instagram</Link>
            <Link href="#" className="hover:text-black transition-colors">tiktok</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
