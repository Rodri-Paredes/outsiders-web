import Link from 'next/link';
import Navbar from '../../components/Navbar';
import DropsGrid from '../../components/DropsGrid';

export default function DropsPage() {
  return (
    <main className="bg-white min-h-screen text-black">
      {/* Top bar */}
      <div className="w-full text-xs font-medium text-[#d4a574] bg-[#1a3e3d] flex items-center justify-center h-10 px-6">
        <span>🔥 lanzamientos exclusivos — edición limitada</span>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full h-[50vh] overflow-hidden bg-gradient-to-br from-[#2d5f5d] to-[#1a3e3d]">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <h1 className="text-5xl md:text-7xl font-black text-[#d4a574] mb-4 tracking-tight">
            DROPS
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            lanzamientos exclusivos — edición limitada — solo por tiempo limitado
          </p>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTIsIDE2NSwgMTE2LCAwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      </section>

      {/* Drops Content */}
      <section className="py-16 px-6 max-w-[1800px] mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-[#d4a574]"></div>
            <h2 className="text-3xl md:text-4xl font-black text-black">lanzamientos exclusivos</h2>
          </div>
          <p className="text-gray-600 max-w-3xl">
            Colecciones limitadas que solo estarán disponibles por tiempo limitado. Una vez que se agoten, no volverán. No te pierdas estos drops únicos.
          </p>
        </div>

        <DropsGrid />
      </section>

      {/* CTA Section */}
      <section className="bg-[#2d5f5d] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-[#d4a574] mb-6">
            ¿no quieres perderte los próximos drops?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Suscríbete a nuestro newsletter y sé el primero en saber sobre nuevos lanzamientos exclusivos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu email"
              className="w-full px-6 py-4 rounded-sm bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#d4a574]"
            />
            <button className="w-full sm:w-auto px-8 py-4 bg-[#d4a574] text-[#2d5f5d] font-bold rounded-sm hover:bg-[#e6b885] transition-all whitespace-nowrap">
              suscribirme
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
