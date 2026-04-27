import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Envíos | OUTSIDERS',
  description: 'Realizamos envíos a nivel nacional dentro de Bolivia. Todos los pedidos son procesados en un máximo de 24 horas.',
};

export default function EnviosPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">

        <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-center mb-16">
          Política de Envíos
        </h1>

        <div className="space-y-10 text-sm leading-relaxed text-black/70">

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Cobertura</h2>
            <p>Realizamos envíos a nivel nacional dentro de Bolivia. Todos los pedidos confirmados son procesados y despachados en un plazo máximo de 24 horas posteriores a la confirmación del pago.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Ciudad</h2>
            <p>Entregas dentro de la ciudad mediante servicio de mototaxi de confianza.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Nacional</h2>
            <p>Envíos interdepartamentales con Trans Copacabana, El Dorado y Cosmos.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Courier</h2>
            <p>Envío mediante courier disponible con costo adicional según destino.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Tiempo de entrega</h2>
            <p>Entre 1 y 3 días hábiles según la ubicación del destinatario.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Costo de envío</h2>
            <p>Varía en función del destino y del método seleccionado. Se indica al momento de confirmar el pedido.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Consideraciones</h2>
            <p>Una vez realizado el despacho, los tiempos quedan sujetos a la gestión de la empresa transportadora. Factores externos como bloqueos, condiciones climáticas o inconvenientes logísticos pueden ocasionar retrasos ajenos a nuestra responsabilidad.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

