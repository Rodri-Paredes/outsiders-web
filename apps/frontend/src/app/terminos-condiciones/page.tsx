import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | OUTSIDERS',
  description: 'Términos y condiciones de uso del sitio web y compras en Outsiders.',
};

const terms = [
  {
    number: '01',
    title: 'Disponibilidad',
    body: 'Todos los productos están sujetos a disponibilidad. Nos reservamos el derecho de limitar cantidades o descontinuar productos en cualquier momento.',
  },
  {
    number: '02',
    title: 'Precios',
    body: 'Los precios están expresados en moneda local y pueden cambiar sin previo aviso.',
  },
  {
    number: '03',
    title: 'Descripción de productos',
    body: 'Nos esforzamos por mostrar la información de cada producto con la mayor precisión posible. Sin embargo, pueden existir ligeras variaciones en colores o detalles.',
  },
  {
    number: '04',
    title: 'Responsabilidad de envíos',
    body: 'Outsiders no se hace responsable por retrasos ocasionados por empresas de envío u otros factores fuera de nuestro control.',
  },
  {
    number: '05',
    title: 'Aceptación',
    body: 'Al realizar una compra, aceptas nuestras políticas de envíos, cambios y privacidad.',
  },
];

export default function TerminosCondicionesPage() {
  return (
    <div className="min-h-screen bg-off-white text-black">

      {/* Hero */}
      <section className="pt-32 pb-0 overflow-hidden">
        <div className="container-custom">
          <div className="border-t border-black/10 pt-8 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40">Legal — 04</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40">Outsiders</span>
          </div>
        </div>
        <div className="container-custom mt-8">
          <h1
            className="font-bold uppercase leading-[0.85] tracking-tighter text-black"
            style={{ fontSize: 'clamp(2.5rem, 9vw, 9rem)' }}
          >
            Términos &amp;<br />
            <span className="text-black/10 [-webkit-text-stroke:2px_black]">Condiciones</span>
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <p className="text-base md:text-lg font-light text-black/60 max-w-2xl">
            Al acceder y comprar en Outsiders, aceptas los siguientes términos.
          </p>
        </div>
      </section>

      {/* Terms list */}
      <section className="bg-off-white pb-24 md:pb-32">
        <div className="container-custom">
          <div className="border-t border-black/10">
            {terms.map((term) => (
              <div
                key={term.number}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 border-b border-black/10 py-10 group"
              >
                <div className="md:col-span-1">
                  <span className="text-xs font-bold text-black/20 uppercase tracking-[0.3em]">{term.number}</span>
                </div>
                <div className="md:col-span-3">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-black">{term.title}</p>
                </div>
                <div className="md:col-span-8">
                  <p className="text-sm font-light leading-relaxed text-black/60">{term.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-black">
        <div className="container-custom flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <p className="text-base md:text-xl font-light text-white/60 max-w-sm">
            Para cualquier consulta relacionada con estos términos:
          </p>
          <a
            href="https://wa.me/59164884458"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 group w-fit"
          >
            <div className="w-8 h-px bg-white group-hover:w-14 transition-all duration-300" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-white">
              Contactar al 64884458
            </span>
          </a>
        </div>
      </section>

    </div>
  );
}
