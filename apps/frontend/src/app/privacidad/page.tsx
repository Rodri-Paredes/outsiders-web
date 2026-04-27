import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad | OUTSIDERS',
  description: 'En Outsiders, tu privacidad es importante. Conoce cómo manejamos tu información.',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">

        <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-center mb-16">
          Política de Privacidad
        </h1>

        <div className="space-y-10 text-sm leading-relaxed text-black/70">

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Qué recopilamos</h2>
            <p>Nombre, correo electrónico, número de teléfono y dirección de envío. Únicamente lo necesario para procesar y entregar tu pedido.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Cómo usamos tu información</h2>
            <p>Tu información no será vendida ni compartida con terceros, excepto cuando sea necesario para completar tu compra — como servicios de envío o procesamiento de pagos.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Seguridad</h2>
            <p>Tomamos medidas adecuadas para proteger tus datos y garantizar transacciones seguras en todo momento.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Aceptación</h2>
            <p>Al utilizar nuestro sitio web, aceptas la recopilación y uso de tu información conforme a esta política.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
