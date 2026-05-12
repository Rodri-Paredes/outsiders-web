import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const BUCKET = 'web';
const PHOTOS_PER_STORE = 3;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get('folder');

  if (!folder || !['cocha', 'santa'].includes(folder)) {
    return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(folder, {
      limit: PHOTOS_PER_STORE,
      sortBy: { column: 'created_at', order: 'asc' },
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const urls = (data ?? [])
    .filter((f) => f.id !== null)
    .slice(0, PHOTOS_PER_STORE)
    .map(
      (f) =>
        `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${folder}/${f.name}`
    );

  return NextResponse.json({ urls });
}
