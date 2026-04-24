import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Envíos | OUTSIDERS',
  description: 'Realizamos envíos a nivel nacional dentro de Bolivia. Todos los pedidos son procesados en un máximo de 24 horas.',
};

const methods = [
  {
    label: '01',
    title: 'Ciudad',
    description: 'Entregas dentro de la ciudad mediante servicio de mototaxi de confianza.',
  },
  {
    label: '02',
    title: 'Nacional',
    description: 'Envíos interdepartamentales con Trans Copacabana, El Dorado y Cosmos.',
  },
  {
    label: '03',
    title: 'Courier',
    description: 'Envío mediante courier disponible con costo adicional según destino.',
  },
];

export default function EnviosPage() {
  return (
    <div className="min-h-screen bg-off-white text-black">

      {/* Hero */}
      <section className="pt-32 pb-0 overflow-hidden">
        <div className="container-custom">
          <div className="border-t border-black/10 pt-8 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40">Información — 02</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40">Bolivia</span>
          </div>
        </div>
        <div className="container-custom mt-8">
          <h1
            className="font-bold uppercase leading-[0.85] tracking-tighter text-black"
            style={{ fontSize: 'clamp(3.5rem, 12vw, 12rem)' }}
          >
            Política de<br />
            <span className="text-black/10 [-webkit-text-stroke:2px_black]">Envíos</span>
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <div className="w-8 h-px bg-black mb-6" />
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-black/40">Cobertura</p>
              <p className="text-3xl md:text-4xl font-light tracking-tight mt-4 leading-tight">
                Envíos a nivel<br /><strong className="font-bold">nacional</strong><br />en Bolivia.
              </p>
            </div>
            <div className="lg:col-span-8 flex items-center">
              <p className="text-base md:text-lg font-light leading-relaxed text-black/60 max-w-xl">
                Todos los pedidos confirmados son procesados y despachados en un plazo máximo de{' '}
                <strong className="text-black font-medium">24 horas</strong> posteriores a la confirmación del pago.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methods */}
      <section className="py-20 md:py-28 bg-off-white">
        <div className="container-custom">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40 mb-16">Métodos de envío</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-black/10">
            {methods.map((m) => (
              <div key={m.label} className="border-b md:border-b-0 md:border-r border-black/10 py-12 md:pr-12 last:border-r-0">
                <span className="text-6xl font-bold text-black/8 leading-none block mb-6">{m.label}</span>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/40 mb-3">{m.title}</p>
                <p className="text-sm font-light leading-relaxed text-black/60">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Times & Costs */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-black/10">
            <div className="py-12 md:pr-16 md:border-r border-black/10 border-b md:border-b-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40 mb-6">Tiempo de entrega</p>
              <p
                className="font-bold uppercase leading-tight tracking-tighter"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
              >
                1–3<br />días hábiles
              </p>
              <p className="text-sm font-light text-black/50 mt-4">Según ubicación del destinatario.</p>
            </div>
            <div className="py-12 md:pl-16">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40 mb-6">Costo de envío</p>
              <p className="text-base md:text-lg font-light leading-relaxed text-black/60">
                Varía en función del destino y del método seleccionado. Se indica al momento de confirmar el pedido.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Notice */}
      <section className="py-20 bg-black">
        <div className="container-custom">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 mb-8">Consideraciones</p>
          <p className="text-base md:text-xl font-light leading-relaxed text-white/60 max-w-3xl">
            Una vez realizado el despacho, los tiempos quedan sujetos a la gestión de la empresa transportadora.
            Factores externos como bloqueos, condiciones climáticas o inconvenientes logísticos pueden ocasionar
            retrasos ajenos a nuestra responsabilidad. Nos comprometemos a gestionar cada envío con la mayor
            rapidez posible.
          </p>
        </div>
      </section>

    </div>
  );
}
