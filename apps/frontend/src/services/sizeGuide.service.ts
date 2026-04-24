import { supabase } from '@/lib/supabase';

export interface SizeGuideRow {
  size: string;
  a: number;
  b: number;
  c: number;
}

export interface SizeGuide {
  id: string;
  material: string;
  rows: SizeGuideRow[];
  col_a_label: string;
  col_b_label: string;
  col_c_label: string;
  image_url: string | null;
}

export const sizeGuideService = {
  /**
   * Devuelve la guía de tallas para un material específico.
   * Si no existe, devuelve null (se muestra la tabla genérica hardcodeada).
   */
  async getByMaterial(material: string): Promise<SizeGuide | null> {
    const { data, error } = await supabase
      .from('size_guides')
      .select('*')
      .eq('material', material)
      .single();

    if (error || !data) return null;
    return data as SizeGuide;
  },

  /** Obtiene todas las guías (para el ERP) */
  async getAll(): Promise<SizeGuide[]> {
    const { data, error } = await supabase
      .from('size_guides')
      .select('*')
      .order('material');

    if (error) {
      console.error('[SizeGuide] Error:', error);
      return [];
    }
    return (data || []) as SizeGuide[];
  },

  /** Obtiene una guía de tallas por su ID */
  async getById(id: string): Promise<SizeGuide | null> {
    const { data, error } = await supabase
      .from('size_guides')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as SizeGuide;
  },
};
