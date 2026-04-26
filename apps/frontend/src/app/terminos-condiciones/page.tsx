import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | OUTSIDERS',
  description: 'Términos y condiciones de uso del sitio web y compras en Outsiders.',
};

export default function TerminosCondicionesPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">

        <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-center mb-16">
          Términos y Condiciones
        </h1>

        <div className="space-y-10 text-sm leading-relaxed text-black/70">

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Disponibilidad</h2>
            <p>Todos los productos están sujetos a disponibilidad. Nos reservamos el derecho de limitar cantidades o descontinuar productos en cualquier momento.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Precios</h2>
            <p>Los precios están expresados en moneda local y pueden cambiar sin previo aviso.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Descripción de productos</h2>
            <p>Nos esforzamos por mostrar la información de cada producto con la mayor precisión posible. Sin embargo, pueden existir ligeras variaciones en colores o detalles.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Responsabilidad de envíos</h2>
            <p>Outsiders no se hace responsable por retrasos ocasionados por empresas de envío u otros factores fuera de nuestro control.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Aceptación</h2>
            <p>Al realizar una compra, aceptas nuestras políticas de envíos, cambios y privacidad.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
