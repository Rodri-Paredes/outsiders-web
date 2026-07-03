/**
 * Proxy an image URL through images.weserv.nl for automatic WebP conversion,
 * resizing, and caching — reducing Supabase egress and improving load times.
 *
 * Weserv reference: https://images.weserv.nl/
 */
export function getWeservUrl(
  url: string,
  { w = 800, h, q = 75, output = 'webp', fit }: { w?: number; h?: number; q?: number; output?: string; fit?: 'cover' | 'contain' } = {}
): string {
  if (!url) return url;
  // Already proxied — don't double-wrap
  if (url.includes('weserv.nl')) return url;
  // Skip relative paths and data URIs
  if (!url.startsWith('http')) return url;
  // Strip scheme — weserv expects URL without https://
  const stripped = url.replace(/^https?:\/\//, '');
  let out = `https://images.weserv.nl/?url=${encodeURIComponent(stripped)}&w=${w}&output=${output}&q=${q}`;
  if (h) out += `&h=${h}`;
  if (fit) out += `&fit=${fit}`;
  return out;
}
