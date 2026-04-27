import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nosotros | OUTSIDERS',
  description: 'Outsiders nace de una idea simple: no seguir, sino definir. Diseñado en Bolivia. Hecho sin compromisos.',
};

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">

        <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-center mb-16">
          Sobre Nosotros
        </h1>

        <div className="space-y-10 text-sm leading-relaxed text-black/70">

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Quiénes somos</h2>
            <p>Outsiders nace de una idea simple: no seguir, sino definir. Somos una marca boliviana que apuesta por la precisión en la construcción, la calidad de los materiales y la intención detrás de cada detalle.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Nuestra filosofía</h2>
            <p>Nos enfocamos en lo que otros pasan por alto. Cada prenda está diseñada para sentirse natural, pero con la presencia suficiente para destacar sin esfuerzo.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Lo que creemos</h2>
            <p>No creemos en lo masivo ni en lo genérico. Creemos en piezas que perduran, en procesos cuidados y en una identidad que no necesita validación externa.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Nuestro compromiso</h2>
            <p>Esto no es moda rápida. Es un compromiso con la calidad, con el diseño y con quienes entienden que la diferencia está en los detalles.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Origen</h2>
            <p>Diseñado en Bolivia. Hecho sin compromisos.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
