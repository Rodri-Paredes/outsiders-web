import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cambios y Devoluciones | OUTSIDERS',
  description: 'Política de cambios y devoluciones de Outsiders. Aceptamos cambios dentro de los 7 días posteriores a la entrega.',
};

export default function CambiosDevolucionesPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">

        <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-center mb-16">
          Cambios y Devoluciones
        </h1>

        <div className="space-y-10 text-sm leading-relaxed text-black/70">

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Cambios</h2>
            <p>Aceptamos cambios dentro de los 7 días posteriores a la entrega. La prenda debe estar sin uso, sin lavar y en perfecto estado, conservando sus etiquetas originales y presentando comprobante de compra.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Opciones de cambio</h2>
            <p>Puedes cambiar el producto por otra talla, por un artículo de igual valor, o recibir un crédito en tienda.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Devoluciones</h2>
            <p>Aplican únicamente en casos de producto defectuoso o error en el pedido. En estos casos, Outsiders cubre el costo de envío.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Costo de envío en cambios voluntarios</h2>
            <p>Para cambios voluntarios, el cliente asume el costo de envío. Recomendamos usar un servicio con seguimiento.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">No elegibles</h2>
            <p>No aplican cambios ni devoluciones en prendas en oferta o descuento, ni en productos personalizados.</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-3">Proceso</h2>
            <p>Para iniciar un cambio o devolución, escríbenos al 64884458 con tu número de pedido, motivo y fotos si aplica. Respondemos en un máximo de 48 horas.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
