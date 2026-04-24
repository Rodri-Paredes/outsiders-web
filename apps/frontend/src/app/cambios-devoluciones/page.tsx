import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cambios y Devoluciones | OUTSIDERS',
  description: 'Política de cambios y devoluciones de Outsiders. Aceptamos cambios dentro de los 7 días posteriores a la entrega.',
};

export default function CambiosDevolucionesPage() {
  return (
    <div className="min-h-screen bg-off-white text-black">

      {/* Hero */}
      <section className="pt-32 pb-0 overflow-hidden">
        <div className="container-custom">
          <div className="border-t border-black/10 pt-8 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40">Información — 03</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40">7 días</span>
          </div>
        </div>
        <div className="container-custom mt-8">
          <h1
            className="font-bold uppercase leading-[0.85] tracking-tighter text-black"
            style={{ fontSize: 'clamp(3rem, 10vw, 10rem)' }}
          >
            Cambios &amp;<br />
            <span className="text-black/10 [-webkit-text-stroke:2px_black]">Devoluciones</span>
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-custom">
          <div className="max-w-2xl">
            <div className="w-8 h-px bg-black mb-8" />
            <p className="text-xl md:text-2xl font-light leading-snug tracking-tight text-black/70">
              Cada prenda está diseñada con atención obsesiva al detalle.{' '}
              <strong className="text-black font-medium">Si algo no cumple tus expectativas, queremos solucionarlo.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Cambios / Devoluciones split */}
      <section className="py-20 md:py-28 bg-off-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-t border-black/10">

            {/* Cambios */}
            <div className="pt-12 lg:pr-16 lg:border-r border-black/10 pb-12 border-b lg:border-b-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40">01</span>
              <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter mt-4 mb-10">Cambios</h2>

              <p className="text-sm font-light text-black/60 mb-2 uppercase tracking-[0.2em]">Plazo</p>
              <p className="text-4xl md:text-5xl font-bold tracking-tighter mb-10">7 días</p>

              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-black/40 mb-5">Condiciones</p>
              <ul className="space-y-4 mb-12">
                {[
                  'Sin uso, sin lavar, en perfecto estado.',
                  'Conserva etiquetas originales.',
                  'Presentar comprobante de compra.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-4 border-b border-black/6 pb-4">
                    <span className="text-black/20 font-bold text-xs mt-0.5">—</span>
                    <p className="text-sm font-light text-black/70">{item}</p>
                  </li>
                ))}
              </ul>

              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-black/40 mb-5">Puedes cambiar por</p>
              <div className="grid grid-cols-3 gap-3">
                {['Otra talla', 'Mismo valor', 'Crédito en tienda'].map((opt) => (
                  <div key={opt} className="border border-black/10 p-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-black/60">{opt}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Devoluciones */}
            <div className="pt-12 lg:pl-16">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40">02</span>
              <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter mt-4 mb-10">Devoluciones</h2>

              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-black/40 mb-5">Aplican únicamente en</p>
              <ul className="space-y-4 mb-12">
                {[
                  'Producto defectuoso.',
                  'Error en el pedido.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-4 border-b border-black/6 pb-4">
                    <span className="text-black/20 font-bold text-xs mt-0.5">—</span>
                    <p className="text-sm font-light text-black/70">{item}</p>
                  </li>
                ))}
              </ul>

              <div className="bg-black p-6 mb-12">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/40 mb-2">En estos casos</p>
                <p className="text-white font-bold text-lg uppercase tracking-tight">Cubrimos el costo de envío.</p>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-black/40 mb-5">Envíos para cambios voluntarios</p>
              <ul className="space-y-4 mb-12">
                {[
                  'El cliente asume el costo de envío.',
                  'Recomendamos usar un servicio con seguimiento.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-4 border-b border-black/6 pb-4">
                    <span className="text-black/20 font-bold text-xs mt-0.5">—</span>
                    <p className="text-sm font-light text-black/70">{item}</p>
                  </li>
                ))}
              </ul>

              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-black/40 mb-5">No elegibles</p>
              <ul className="space-y-4">
                {[
                  'Prendas en oferta o descuento.',
                  'Productos personalizados.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-4 border-b border-black/6 pb-4">
                    <span className="text-black/20 font-bold text-xs mt-0.5">—</span>
                    <p className="text-sm font-light text-black/70">{item}</p>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-black">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 mb-6">Proceso</p>
              <p className="text-3xl md:text-4xl font-light text-white leading-snug tracking-tight">
                Para iniciar un cambio o devolución, escríbenos con tu número de pedido, motivo y fotos si aplica.
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <a
                href="https://wa.me/59164884458"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 group w-fit"
              >
                <div className="w-8 h-px bg-white group-hover:w-14 transition-all duration-300" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-white">
                  Escribir al 64884458
                </span>
              </a>
              <p className="text-sm font-light text-white/40">
                Respondemos en un máximo de <strong className="text-white/60 font-medium">48 horas.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
