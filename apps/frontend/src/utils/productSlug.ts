/**
 * Product URLs use the format `{uuid}-{name-slug}` (e.g. `a1b2c3d4-...-polera-negra`).
 * Extracts just the UUID so it can be used to look up the product.
 */
export function extractProductId(slug: string): string {
  const uuidPattern = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const uuidMatch = slug.match(uuidPattern);
  if (uuidMatch) return uuidMatch[1];
  // Fallback: assume first part before dash is the ID
  return slug.split('-')[0];
}
