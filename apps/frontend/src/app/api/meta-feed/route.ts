import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Force dynamic — this feed must always be fresh (no static generation).
export const dynamic = 'force-dynamic';

const SITE_URL = 'https://www.outsidersbrand.shop';

/**
 * Escape XML special characters to produce valid XML output.
 */
function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Build a SEO-friendly slug from a product name.
 * Mirrors the pattern used in the frontend: `${id}-${name-slug}`.
 */
function makeSlug(id: string, name: string): string {
  const nameSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${id}-${nameSlug}`;
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      return new NextResponse('Missing Supabase configuration', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id, name, description, price, image_url, images, category,
        is_visible, visible_on_web,
        variants:product_variants(
          id, size,
          stock(quantity)
        )
      `)
      .eq('is_visible', true)
      .eq('visible_on_web', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Meta feed — Supabase error:', error);
      return new NextResponse('Database error', { status: 500 });
    }

    const items = (products || []).map((p: any) => {
      // --- Stock calculation ---
      let totalStock = 0;
      if (p.variants) {
        for (const v of p.variants) {
          if (v.stock) {
            for (const s of v.stock) {
              totalStock += s.quantity || 0;
            }
          }
        }
      }

      // --- Image URL ---
      let imageUrl = '';
      if (Array.isArray(p.images) && p.images.length > 0) {
        imageUrl = p.images[0];
      } else if (typeof p.images === 'string') {
        try {
          const parsed = JSON.parse(p.images);
          if (Array.isArray(parsed) && parsed.length > 0) {
            imageUrl = parsed[0];
          }
        } catch {
          // Postgres array format {url1,url2}
          const cleaned = p.images.replace(/^{|}$/g, '').split(',')[0]?.replace(/^"|"$/g, '').trim();
          if (cleaned) imageUrl = cleaned;
        }
      }
      if (!imageUrl && p.image_url) {
        imageUrl = p.image_url;
      }

      // --- Product URL ---
      const slug = makeSlug(p.id, p.name || '');
      const productUrl = `${SITE_URL}/producto/${slug}`;

      // --- Description ---
      const description = p.description || p.name || '';

      // --- Price (whole number, BOB) ---
      const price = Math.round(p.price || 0);

      // --- Availability ---
      const availability = totalStock > 0 ? 'in_stock' : 'out_of_stock';

      // --- Category ---
      const category = p.category || 'Ropa';

      return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price} BOB</g:price>
      <g:condition>new</g:condition>
      <g:brand>OUTSIDERS</g:brand>
      <g:product_type>${escapeXml(category)}</g:product_type>
    </item>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>OUTSIDERS - Urban Streetwear</title>
    <link>${SITE_URL}</link>
    <description>Catálogo de productos OUTSIDERS para Meta Commerce Manager</description>
${items.join('\n')}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('Meta feed — unexpected error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
