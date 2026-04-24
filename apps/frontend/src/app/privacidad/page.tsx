import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad | OUTSIDERS',
  description: 'En Outsiders, tu privacidad es importante. Conoce cómo manejamos tu información.',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-off-white text-black">

      {/* Hero */}
      <section className="pt-32 pb-0 overflow-hidden">
        <div className="container-custom">
          <div className="border-t border-black/10 pt-8 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40">Legal — 05</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40">Privacidad</span>
          </div>
        </div>
        <div className="container-custom mt-8">
          <h1
            className="font-bold uppercase leading-[0.85] tracking-tighter text-black"
            style={{ fontSize: 'clamp(3rem, 11vw, 11rem)' }}
          >
            Política de<br />
            <span className="text-black/10 [-webkit-text-stroke:2px_black]">Privacidad</span>
          </h1>
        </div>
      </section>

      {/* Statement */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            <div className="lg:col-span-4">
              <div className="w-8 h-px bg-black mb-8" />
              <p className="text-3xl md:text-4xl font-light tracking-tight leading-tight">
                Tu privacidad<br />es <strong className="font-bold">importante.</strong>
              </p>
            </div>
            <div className="lg:col-span-8 flex items-center">
              <p className="text-base md:text-lg font-light leading-relaxed text-black/60">
                Recopilamos información personal únicamente para{' '}
                <strong className="text-black font-medium">procesar tus pedidos</strong> y mejorar tu experiencia.
                Nunca venderemos ni compartiremos tus datos con terceros sin una razón directa relacionada a tu compra.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detail blocks */}
      <section className="bg-off-white pb-24 md:pb-32">
        <div className="container-custom">
          <div className="border-t border-black/10">

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 border-b border-black/10 py-10">
              <div className="md:col-span-1">
                <span className="text-xs font-bold text-black/20 uppercase tracking-[0.3em]">01</span>
              </div>
              <div className="md:col-span-3">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-black">Qué recopilamos</p>
              </div>
              <div className="md:col-span-8">
                <p className="text-sm font-light leading-relaxed text-black/60">
                  Nombre, correo electrónico, número de teléfono y dirección de envío. Únicamente lo necesario
                  para procesar y entregar tu pedido.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 border-b border-black/10 py-10">
              <div className="md:col-span-1">
                <span className="text-xs font-bold text-black/20 uppercase tracking-[0.3em]">02</span>
              </div>
              <div className="md:col-span-3">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-black">Cómo usamos tu info</p>
              </div>
              <div className="md:col-span-8">
                <p className="text-sm font-light leading-relaxed text-black/60">
                  Tu información no será vendida ni compartida con terceros, excepto cuando sea necesario para
                  completar tu compra — como servicios de envío o procesamiento de pagos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 border-b border-black/10 py-10">
              <div className="md:col-span-1">
                <span className="text-xs font-bold text-black/20 uppercase tracking-[0.3em]">03</span>
              </div>
              <div className="md:col-span-3">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-black">Seguridad</p>
              </div>
              <div className="md:col-span-8">
                <p className="text-sm font-light leading-relaxed text-black/60">
                  Tomamos medidas adecuadas para proteger tus datos y garantizar transacciones seguras en todo momento.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 py-10">
              <div className="md:col-span-1">
                <span className="text-xs font-bold text-black/20 uppercase tracking-[0.3em]">04</span>
              </div>
              <div className="md:col-span-3">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-black">Aceptación</p>
              </div>
              <div className="md:col-span-8">
                <p className="text-sm font-light leading-relaxed text-black/60">
                  Al utilizar nuestro sitio web, aceptas la recopilación y uso de tu información conforme a esta política.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom bar */}
      <section className="py-16 bg-black">
        <div className="container-custom">
          <p
            className="font-bold uppercase text-white/10 leading-none tracking-tighter [-webkit-text-stroke:1px_rgba(255,255,255,0.3)]"
            style={{ fontSize: 'clamp(2rem, 6vw, 6rem)' }}
          >
            Tu información. Segura.
          </p>
        </div>
      </section>

    </div>
  );
}
