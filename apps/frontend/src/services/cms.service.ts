import { supabase } from '@/lib/supabase';

export interface BestSellersConfig {
  title: string;
  product_ids: string[];
}

export interface HomeSection {
  id?: string;
  type: 'tag' | 'products';
  title: string;
  tag?: string;
  product_ids?: string[];
}

export interface HomeHeroConfig {
  title?: string;
  subtitle?: string;
  desktop_title_1?: string;
  desktop_title_2?: string;
  desktop_season?: string;
  desktop_description?: string;
  cta_text?: string;
  cta_link?: string;
  images?: string[];
}

export interface HomeCategory {
  title: string;
  subtitle?: string;
  href?: string;
  image?: string;
}

export const cmsService = {
  async getConfig(key: string) {
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', key)
      .single();
      
    if (error) {
      console.error(`[cmsService] Error fetching config for ${key}:`, error.message);
      return null;
    }
    
    return data?.value;
  }
};
