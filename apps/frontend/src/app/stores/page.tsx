import { createClient } from '@supabase/supabase-js';
import { StoreCard } from './StoreCard';

const BUCKET = 'web';
const PHOTOS_PER_STORE = 3;

const STORES_DATA = [
  {
    city: "COCHABAMBA",
    address: "Av. Potosí 1384, entre Av. Portales y Pedro Blanco",
    url: "https://maps.app.goo.gl/mXpEFRJ5z2CXwd2Y8",
    folder: "cocha",
    schedule: "Lunes a Sábado: 11:00 - 20:00",
  },
  {
    city: "SANTA CRUZ",
    address: "Av. Busch 970, entre 2 y 3 anillo",
    url: "https://maps.app.goo.gl/MNdXKaCzUu9VS8Zf9",
    folder: "santa",
    schedule: "Lunes a Sábado: 11:00 - 20:00",
  },
];

// Sin esta directiva, Next cachea el render de forma efectivamente
// indefinida desde la primera visita (mismo problema encontrado en
// /producto/[id]). Acá el riesgo es menor (fotos de tienda, no precios),
// pero igual conviene no dejarlo sin acotar.
export const revalidate = 3600;

async function getStorePhotos(folder: string): Promise<string[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(folder, {
      limit: PHOTOS_PER_STORE,
      sortBy: { column: 'created_at', order: 'asc' },
    });

  if (error || !data) return [];

  return data
    .filter((f) => f.id !== null)
    .slice(0, PHOTOS_PER_STORE)
    .map((f) => `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${folder}/${f.name}`);
}

export default async function StoresPage() {
  const [cochaPhotos, santaPhotos] = await Promise.all([
    getStorePhotos('cocha'),
    getStorePhotos('santa'),
  ]);

  return (
    <div className="bg-white min-h-screen pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">

        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter mb-4">
            Nuestras Tiendas
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            Visita nuestras sucursales para conocer los últimos drops y experimentar OUTSIDERS en persona.
          </p>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          <StoreCard {...STORES_DATA[0]} photos={cochaPhotos} />
          <StoreCard {...STORES_DATA[1]} photos={santaPhotos} />
        </div>
      </div>
    </div>
  );
}