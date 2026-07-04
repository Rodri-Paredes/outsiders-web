import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/imageCompression';

/**
 * Generic CMS service for reading/writing site_config keys in Supabase.
 * All config is stored as JSONB under a unique key in the site_config table.
 */
export const cmsService = {
  /**
   * Get config value by key. Returns null if not found.
   */
  async getConfig(key: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error(`[CMS] Error loading ${key}:`, error);
        return null;
      }

      return data?.value ?? null;
    } catch (err) {
      console.error(`[CMS] Exception loading ${key}:`, err);
      return null;
    }
  },

  /**
   * Set (upsert) config value by key.
   */
  async setConfig(key: string, value: any): Promise<void> {
    const { error } = await supabase
      .from('site_config')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) throw error;
  },

  /**
   * Upload a CMS image to Supabase Storage bucket 'cms'.
   * Falls back to 'products' bucket if 'cms' doesn't exist.
   */
  async uploadImage(file: File, folder = 'banners'): Promise<string> {
    const compressedFile = await compressImage(file);
    const ext = compressedFile.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Try 'cms' bucket first, fall back to 'products'.
    // cacheControl largo: fileName incluye timestamp+random, nunca se reemplaza.
    let bucket = 'cms';
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, compressedFile, { cacheControl: '31536000' });

    if (uploadError) {
      // Try products bucket as fallback
      bucket = 'products';
      const { error: fallbackError } = await supabase.storage
        .from(bucket)
        .upload(fileName, compressedFile, { cacheControl: '31536000' });
      if (fallbackError) throw fallbackError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  },
};
