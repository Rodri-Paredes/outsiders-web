import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nosotros | OUTSIDERS',
  description: 'Outsiders nace de una idea simple: no seguir, sino definir. Diseñado en Bolivia. Hecho sin compromisos.',
};

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-off-white text-black">

      {/* Hero */}
      <section className="pt-32 pb-0 overflow-hidden">
        <div className="container-custom">
          <div className="border-t border-black/10 pt-8 mb-0 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40">La Marca — 01</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40">Bolivia</span>
          </div>
        </div>
        <div className="container-custom mt-8">
          <h1
            className="font-bold uppercase leading-[0.85] tracking-tighter text-black"
            style={{ fontSize: 'clamp(4rem, 14vw, 14rem)' }}
          >
            Sobre<br />
            <span className="text-black/10 [-webkit-text-stroke:2px_black]">Nosotros</span>
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

            {/* Left column */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="w-8 h-px bg-black mb-10" />
                <p className="text-2xl md:text-3xl font-light leading-tight tracking-tight text-black">
                  No seguir,<br />sino <strong className="font-bold">definir.</strong>
                </p>
              </div>
              <div className="mt-16 hidden lg:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-black/40">
                  Diseñado en Bolivia
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-black/40 mt-1">
                  Hecho sin compromisos
                </p>
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-7 space-y-10">
              <p className="text-base md:text-lg font-light leading-relaxed text-black/70">
                Nos enfocamos en lo que otros pasan por alto — la precisión en la construcción,
                la calidad de los materiales y la intención detrás de cada detalle. Cada prenda
                está diseñada para sentirse natural, pero con la presencia suficiente para destacar
                sin esfuerzo.
              </p>
              <p className="text-base md:text-lg font-light leading-relaxed text-black/70">
                No creemos en lo masivo ni en lo genérico. Creemos en piezas que perduran, en
                procesos cuidados y en una identidad que no necesita validación externa.
              </p>
              <div className="border-t border-black/10 pt-10">
                <p className="text-xl md:text-2xl font-light leading-snug tracking-tight text-black">
                  "Esto no es moda rápida. Es un compromiso con la calidad, con el diseño y con
                  quienes entienden que la diferencia está en los detalles."
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom statement */}
      <section className="py-24 md:py-32 bg-black overflow-hidden">
        <div className="container-custom">
          <p
            className="font-bold uppercase text-white leading-none tracking-tighter"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 7rem)' }}
          >
            Diseñado en Bolivia.<br />
            <span className="text-white/20">Hecho sin compromisos.</span>
          </p>
        </div>
      </section>

    </div>
  );
}
