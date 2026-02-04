import Link from 'next/link';
import Navbar from '../../components/Navbar';
import DropsGrid from '../../components/DropsGrid';

export default function DropsPage() {
  return (
    <main className="bg-black min-h-screen text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-gradient-to-br from-dark-bg to-dark-card mt-20">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-light text-white mb-4 tracking-tight">
              DROPS
            </h1>
            <div className="h-px w-24 bg-white/30 mx-auto" />
            <p className="text-base md:text-lg text-gray-light max-w-2xl tracking-wider uppercase">
              Limited Edition — Exclusive Releases
            </p>
          </div>
        </div>
      </section>

      {/* Drops Content */}
      <section className="py-16 px-6 max-w-[1800px] mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-4 tracking-tight">Exclusive Releases</h2>
          <p className="text-gray-light max-w-3xl font-light leading-relaxed">
            Limited collections available for a short time only. Once they're gone, they won't come back. Don't miss these unique drops.
          </p>
        </div>

        <DropsGrid />
      </section>

      {/* CTA Section */}
      <section className="bg-dark-card py-20 px-6 border-y border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6 mb-8">
            <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">
              Don't Miss the Next Drop
            </h2>
            <div className="h-px w-24 bg-white/30 mx-auto" />
          </div>
          <p className="text-gray-light text-base mb-8 font-light">
            Subscribe to our newsletter and be the first to know about new exclusive releases
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-6 py-4 bg-dark-bg border border-white/10 text-white placeholder-gray-medium focus:outline-none focus:border-white transition-colors"
            />
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-black font-light text-xs tracking-widest uppercase hover:bg-white/90 transition-all whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
