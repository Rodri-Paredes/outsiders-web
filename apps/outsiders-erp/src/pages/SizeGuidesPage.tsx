import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Toast from '../components/ui/Toast';

interface SizeGuideRow {
  size: string;
  a: number;
  b: number;
  c: number;
}

interface SizeGuide {
  id: string;
  material: string;
  rows: SizeGuideRow[];
  col_a_label: string;
  col_b_label: string;
  col_c_label: string;
  image_url: string | null;
}

const EMPTY_GUIDE: Omit<SizeGuide, 'id'> = {
  material: '',
  rows: [
    { size: 'XS', a: 0, b: 0, c: 0 },
    { size: 'S', a: 0, b: 0, c: 0 },
    { size: 'M', a: 0, b: 0, c: 0 },
    { size: 'L', a: 0, b: 0, c: 0 },
    { size: 'XL', a: 0, b: 0, c: 0 },
  ],
  col_a_label: 'Ancho',
  col_b_label: 'Largo',
  col_c_label: '',
  image_url: null,
};

export function SizeGuidesPage() {
  const [guides, setGuides] = useState<SizeGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SizeGuide | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<SizeGuide, 'id'>>(EMPTY_GUIDE);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('size_guides')
        .select('*')
        .order('material');
      if (error) throw error;
      setGuides((data || []) as SizeGuide[]);
    } catch {
      Toast.error('Error al cargar guías de tallas');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(EMPTY_GUIDE);
    setImageFile(null);
    setImagePreview(null);
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (guide: SizeGuide) => {
    setForm({
      material: guide.material,
      rows: guide.rows,
      col_a_label: guide.col_a_label,
      col_b_label: guide.col_b_label,
      col_c_label: guide.col_c_label,
      image_url: guide.image_url,
    });
    setImageFile(null);
    setImagePreview(guide.image_url);
    setEditing(guide);
    setCreating(false);
  };

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const path = `size-guides/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) {
      console.error('Upload error', error);
      return null;
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const updateRow = (index: number, field: keyof SizeGuideRow, value: string | number) => {
    setForm(prev => {
      const rows = [...prev.rows];
      rows[index] = { ...rows[index], [field]: field === 'size' ? String(value) : Number(value) } as SizeGuideRow;
      return { ...prev, rows };
    });
  };

  const addRow = () => {
    setForm(prev => ({
      ...prev,
      rows: [...prev.rows, { size: '', a: 0, b: 0, c: 0 }],
    }));
  };

  const removeRow = (index: number) => {
    setForm(prev => ({ ...prev, rows: prev.rows.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!form.material.trim()) {
      Toast.error('El nombre del material es requerido');
      return;
    }

    try {
      setSaving(true);

      let imageUrl = form.image_url;
      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        if (uploaded) imageUrl = uploaded;
      }

      const payload = { ...form, image_url: imageUrl };

      if (editing) {
        const { error } = await supabase
          .from('size_guides')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
        Toast.success('Guía actualizada');
      } else {
        const { error } = await supabase.from('size_guides').insert([payload]);
        if (error) throw error;
        Toast.success('Guía creada');
      }

      await loadGuides();
      closeForm();
    } catch (err: any) {
      if (err?.code === '23505') {
        Toast.error('Ya existe una guía para ese material');
      } else {
        Toast.error('Error al guardar la guía');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta guía de tallas?')) return;
    const { error } = await supabase.from('size_guides').delete().eq('id', id);
    if (error) {
      Toast.error('Error al eliminar');
    } else {
      Toast.success('Guía eliminada');
      setGuides(prev => prev.filter(g => g.id !== id));
    }
  };

  const isFormOpen = creating || !!editing;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guías de Tallas</h1>
          <p className="text-sm text-gray-500 mt-1">Define las tablas de medidas por material. El frontend las muestra automáticamente según el producto.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Nueva Guía
          </button>
        )}
      </div>

      {/* Form Panel */}
      {isFormOpen && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editing ? `Editar: ${editing.material}` : 'Nueva Guía de Tallas'}
            </h2>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              {/* Material name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.material}
                  onChange={e => setForm(prev => ({ ...prev, material: e.target.value }))}
                  placeholder="Ej: Alto gramaje, 20/1, Jeans, Lino..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-400 mt-1">Debe coincidir con el nombre del tag de material/gramaje en el producto.</p>
              </div>

              {/* Column labels */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Columna A</label>
                  <input
                    type="text"
                    value={form.col_a_label}
                    onChange={e => setForm(prev => ({ ...prev, col_a_label: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Ancho"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Columna B</label>
                  <input
                    type="text"
                    value={form.col_b_label}
                    onChange={e => setForm(prev => ({ ...prev, col_b_label: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Largo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Columna C <span className="text-gray-400">(opcional)</span></label>
                  <input
                    type="text"
                    value={form.col_c_label}
                    onChange={e => setForm(prev => ({ ...prev, col_c_label: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Vacío = ocultar"
                  />
                </div>
              </div>

              {/* Reference image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de referencia (opcional)</label>
                {imagePreview && (
                  <div className="mb-3 relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img src={imagePreview} alt="Preview" className="object-contain w-full h-full" />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); setImageFile(null); setForm(prev => ({ ...prev, image_url: null })); }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
              </div>
            </div>

            {/* Right column: rows table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Filas de medidas (cm)</label>
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus size={14} /> Añadir fila
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Talla</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{form.col_a_label || 'A'}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{form.col_b_label || 'B'}</th>
                      {form.col_c_label && <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{form.col_c_label}</th>}
                      <th className="px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {form.rows.map((row, i) => (
                      <tr key={i}>
                        <td className="px-2 py-1">
                          <input
                            type="text"
                            value={row.size}
                            onChange={e => updateRow(i, 'size', e.target.value)}
                            className="w-14 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="number"
                            value={row.a || ''}
                            onChange={e => updateRow(i, 'a', e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="number"
                            value={row.b || ''}
                            onChange={e => updateRow(i, 'b', e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        </td>
                        {form.col_c_label && (
                          <td className="px-2 py-1">
                            <input
                              type="number"
                              value={row.c || ''}
                              onChange={e => updateRow(i, 'c', e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black"
                            />
                          </td>
                        )}
                        <td className="px-2 py-1">
                          <button
                            type="button"
                            onClick={() => removeRow(i)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* Guides List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="h-24 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : guides.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-400 text-sm">No hay guías de tallas creadas aún.</p>
          <button onClick={openCreate} className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            Crear la primera guía
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.map(guide => (
            <div key={guide.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {guide.image_url && (
                <div className="h-32 bg-gray-50 overflow-hidden">
                  <img src={guide.image_url} alt={guide.material} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{guide.material}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(guide)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(guide.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="text-left py-1 font-medium">Talla</th>
                      <th className="text-left py-1 font-medium">{guide.col_a_label}</th>
                      <th className="text-left py-1 font-medium">{guide.col_b_label}</th>
                      {guide.col_c_label && <th className="text-left py-1 font-medium">{guide.col_c_label}</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {guide.rows.slice(0, 5).map(row => (
                      <tr key={row.size} className="text-gray-600">
                        <td className="py-1 font-medium">{row.size}</td>
                        <td className="py-1">{row.a}</td>
                        <td className="py-1">{row.b}</td>
                        {guide.col_c_label && <td className="py-1">{row.c}</td>}
                      </tr>
                    ))}
                    {guide.rows.length > 5 && (
                      <tr><td colSpan={4} className="py-1 text-gray-400 italic">+{guide.rows.length - 5} más...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SizeGuidesPage;
