import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Layers, Check, X, AlertCircle, Star, Copy, ExternalLink } from 'lucide-react';
import { Categoria, Subcategoria } from '../../lib/supabase';
import { SupabaseService } from '../../services/supabaseService';

interface CategoriesManagerProps {
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  onRefresh: () => Promise<void>;
}

export function CategoriesManager({
  categorias,
  subcategorias,
  onRefresh,
}: CategoriesManagerProps) {
  // Estado para crear Categoría
  const [newCatNombre, setNewCatNombre] = useState('');
  const [newCatOrden, setNewCatOrden] = useState<number | ''>(categorias.length + 1);
  const [newCatDestacada, setNewCatDestacada] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatNombre, setEditCatNombre] = useState('');
  const [editCatOrden, setEditCatOrden] = useState<number | ''>(1);
  const [editCatDestacada, setEditCatDestacada] = useState(false);

  // Estado para crear Subcategoría
  const [newSubNombre, setNewSubNombre] = useState('');
  const [newSubCatId, setNewSubCatId] = useState('');
  const [newSubSlug, setNewSubSlug] = useState('');
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubNombre, setEditSubNombre] = useState('');
  const [editSubCatId, setEditSubCatId] = useState('');
  const [editSubSlug, setEditSubSlug] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const missingColumnSql = 'ALTER TABLE categorias ADD COLUMN IF NOT EXISTS destacada boolean DEFAULT false;';

  const handleCopyMissingSql = () => {
    navigator.clipboard.writeText(missingColumnSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Set default category when available
  React.useEffect(() => {
    if (categorias.length > 0 && !newSubCatId) {
      setNewSubCatId(categorias[0].id);
    }
  }, [categorias, newSubCatId]);

  // Handlers Categorías
  const handleCreateCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNombre.trim()) return;
    try {
      setLoading(true);
      setError(null);
      await SupabaseService.createCategoria(
        newCatNombre.trim(),
        Number(newCatOrden) || 1,
        newCatDestacada
      );
      setNewCatNombre('');
      setNewCatOrden(categorias.length + 2);
      setNewCatDestacada(false);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al crear categoría.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditCat = (cat: Categoria) => {
    setEditingCatId(cat.id);
    setEditCatNombre(cat.nombre);
    setEditCatOrden(cat.orden);
    setEditCatDestacada(Boolean(cat.destacada));
  };

  const handleSaveEditCat = async (id: string) => {
    try {
      setLoading(true);
      await SupabaseService.updateCategoria(
        id,
        editCatNombre,
        Number(editCatOrden) || 1,
        editCatDestacada
      );
      setEditingCatId(null);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar categoría.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDestacada = async (cat: Categoria) => {
    try {
      setLoading(true);
      setError(null);
      await SupabaseService.toggleCategoriaDestacada(cat.id, Boolean(cat.destacada));
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado destacado de categoría.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategoria = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar la categoría "${name}"? También se eliminarán sus subcategorías vinculadas.`)) {
      return;
    }
    try {
      setLoading(true);
      await SupabaseService.deleteCategoria(id);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar categoría.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers Subcategorías
  const handleCreateSubcategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubNombre.trim() || !newSubCatId) return;
    try {
      setLoading(true);
      setError(null);
      await SupabaseService.createSubcategoria(newSubCatId, newSubNombre.trim(), newSubSlug.trim());
      setNewSubNombre('');
      setNewSubSlug('');
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al crear subcategoría.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditSub = (sub: Subcategoria) => {
    setEditingSubId(sub.id);
    setEditSubNombre(sub.nombre);
    setEditSubCatId(sub.categoria_id);
    setEditSubSlug(sub.slug);
  };

  const handleSaveEditSub = async (id: string) => {
    try {
      setLoading(true);
      await SupabaseService.updateSubcategoria(id, editSubCatId, editSubNombre, editSubSlug);
      setEditingSubId(null);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar subcategoría.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubDestacada = async (sub: Subcategoria) => {
    try {
      setLoading(true);
      setError(null);
      await SupabaseService.toggleSubcategoriaDestacada(sub.id, Boolean(sub.destacada));
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar subcategoría destacada.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategoria = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar la subcategoría "${name}"?`)) return;
    try {
      setLoading(true);
      await SupabaseService.deleteSubcategoria(id);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar subcategoría.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && error.includes('destacada') ? (
        <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-300/80 text-xs text-navy space-y-3 shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 text-amber-900 font-bold uppercase tracking-wider text-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>Paso rápido en Supabase: Falta la columna "destacada"</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-navy/40 hover:text-navy p-1 transition-colors"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-navy/80 font-light leading-relaxed">
            Tu tabla <strong>categorias</strong> se creó originalmente sin la columna para marcar favoritos. Para habilitar el botón de la estrella con 1 solo clic, ejecutá esta línea en tu panel de Supabase:
          </p>

          <div className="bg-navy text-beige-100 p-3.5 rounded-xl font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <code className="text-amber-300 font-bold select-all">{missingColumnSql}</code>
            <button
              onClick={handleCopyMissingSql}
              className="inline-flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto flex-shrink-0"
            >
              {copiedSql ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="https://supabase.com/dashboard/project/ikuwvjvhtbouafjayrvj/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 bg-navy hover:bg-navy-500 text-white text-xs font-montserrat font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <span>Abrir SQL Editor en Supabase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => {
                setError(null);
                onRefresh();
              }}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-navy/70 hover:text-navy px-3 py-2 rounded-lg border border-beige-300 bg-white hover:bg-beige-100 cursor-pointer"
            >
              <span>Ya lo ejecuté, reintentar</span>
            </button>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================= */}
        {/* Column 1: Categorías Principales (Top, Bottom, Accesorios) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-beige-300 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-beige-200">
              <div>
                <h3 className="font-montserrat font-black text-base uppercase text-navy">
                  1. Categorías Principales
                </h3>
                <p className="text-[11px] text-navy/60 font-light">
                  Grupos mayores del Mega Menú (ej: Top, Bottom, Accesorios).
                </p>
              </div>
              <span className="text-xs bg-beige-200 text-navy px-2 py-0.5 rounded-full font-bold">
                {categorias.length}
              </span>
            </div>

            {/* Form Crear Categoría */}
            <form onSubmit={handleCreateCategoria} className="space-y-3 bg-beige-50/70 p-4 rounded-xl border border-beige-200">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-navy">
                + Agregar Categoría Principal
              </span>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  value={newCatNombre}
                  onChange={(e) => setNewCatNombre(e.target.value)}
                  placeholder="Nombre (ej: Calzado)"
                  className="flex-1 text-xs bg-white border border-beige-300 rounded-lg px-3 py-2 text-navy focus:outline-none focus:border-navy"
                />
                <input
                  type="number"
                  required
                  value={newCatOrden}
                  onChange={(e) => setNewCatOrden(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Orden"
                  title="Orden numérico"
                  className="w-18 text-xs bg-white border border-beige-300 rounded-lg px-2 py-2 text-center text-navy focus:outline-none focus:border-navy"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-navy hover:bg-navy-500 text-white p-2 rounded-lg transition-colors cursor-pointer"
                  title="Crear categoría"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <label className="flex items-center space-x-2 text-xs text-navy cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newCatDestacada}
                  onChange={(e) => setNewCatDestacada(e.target.checked)}
                  className="rounded text-navy focus:ring-navy cursor-pointer"
                />
                <span className="text-[11px] font-medium text-navy/80 flex items-center space-x-1">
                  <Star className="w-3 h-3 text-amber-500" />
                  <span>Destacar en Home (Sección "Categorías Destacadas")</span>
                </span>
              </label>
            </form>

            {/* Lista Categorías */}
            <div className="divide-y divide-beige-100">
              {categorias.length === 0 ? (
                <p className="text-xs text-navy/50 py-4 text-center italic">
                  No hay categorías cargadas en Supabase.
                </p>
              ) : (
                categorias.map((cat) => (
                  <div key={cat.id} className="py-2.5 flex items-center justify-between text-xs">
                    {editingCatId === cat.id ? (
                      <div className="flex-1 flex flex-col space-y-2 mr-2 bg-beige-50 p-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editCatNombre}
                            onChange={(e) => setEditCatNombre(e.target.value)}
                            className="flex-1 text-xs bg-white border border-beige-300 rounded px-2 py-1"
                          />
                          <input
                            type="number"
                            value={editCatOrden}
                            onChange={(e) => setEditCatOrden(Number(e.target.value))}
                            className="w-14 text-xs bg-white border border-beige-300 rounded px-1 py-1 text-center"
                          />
                          <button
                            onClick={() => handleSaveEditCat(cat.id)}
                            className="text-green-700 hover:text-green-800 p-1"
                            title="Guardar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingCatId(null)}
                            className="text-navy/40 hover:text-navy p-1"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <label className="flex items-center space-x-2 text-[11px] text-navy cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editCatDestacada}
                            onChange={(e) => setEditCatDestacada(e.target.checked)}
                            className="rounded text-navy focus:ring-navy"
                          />
                          <span>Destacada en Home</span>
                        </label>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleDestacada(cat)}
                            disabled={loading}
                            className={`p-1 rounded transition-colors ${
                              cat.destacada
                                ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                                : 'text-navy/20 hover:text-navy/60 hover:bg-beige-100'
                            }`}
                            title={cat.destacada ? 'Categoría destacada en Home (clic para quitar)' : 'Clic para destacar en Home'}
                          >
                            <Star className={`w-3.5 h-3.5 ${cat.destacada ? 'fill-amber-500' : ''}`} />
                          </button>
                          <div>
                            <span className="font-montserrat font-bold uppercase text-navy">
                              {cat.nombre}
                            </span>
                            <span className="ml-2 text-[10px] text-navy/50 font-mono">
                              Orden #{cat.orden}
                            </span>
                            {cat.destacada && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                                Destacada
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleStartEditCat(cat)}
                            className="p-1 text-navy/50 hover:text-navy"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategoria(cat.id, cat.nombre)}
                            className="p-1 text-navy/30 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Column 2: Subcategorías (Camperas, Remeras, Cargos, etc.) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-beige-300 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-beige-200">
              <div>
                <h3 className="font-montserrat font-black text-base uppercase text-navy">
                  2. Subcategorías de Prendas
                </h3>
                <p className="text-[11px] text-navy/60 font-light">
                  Tipos de prendas vinculados a cada categoría principal.
                </p>
              </div>
              <span className="text-xs bg-beige-200 text-navy px-2 py-0.5 rounded-full font-bold">
                {subcategorias.length}
              </span>
            </div>

            {/* Form Crear Subcategoría */}
            <form onSubmit={handleCreateSubcategoria} className="space-y-3 bg-beige-50/70 p-4 rounded-xl border border-beige-200">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-navy">
                + Nueva Subcategoría
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={newSubCatId}
                  onChange={(e) => setNewSubCatId(e.target.value)}
                  className="text-xs bg-white border border-beige-300 rounded-lg px-2.5 py-2 text-navy focus:outline-none focus:border-navy"
                >
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      Categoría: {cat.nombre}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  required
                  value={newSubNombre}
                  onChange={(e) => {
                    setNewSubNombre(e.target.value);
                    if (!newSubSlug) {
                      setNewSubSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                    }
                  }}
                  placeholder="Nombre (ej: Musculosas)"
                  className="text-xs bg-white border border-beige-300 rounded-lg px-3 py-2 text-navy focus:outline-none focus:border-navy"
                />

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSubSlug}
                    onChange={(e) => setNewSubSlug(e.target.value)}
                    placeholder="Slug URL"
                    className="flex-1 text-xs bg-white border border-beige-300 rounded-lg px-2.5 py-2 text-navy focus:outline-none focus:border-navy"
                  />
                  <button
                    type="submit"
                    disabled={loading || !newSubCatId}
                    className="bg-navy hover:bg-navy-500 text-white px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    title="Crear subcategoría"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* Lista Subcategorías */}
            <div className="divide-y divide-beige-100 max-h-[460px] overflow-y-auto pr-1">
              {subcategorias.length === 0 ? (
                <p className="text-xs text-navy/50 py-4 text-center italic">
                  No hay subcategorías cargadas aún.
                </p>
              ) : (
                subcategorias.map((sub) => (
                  <div key={sub.id} className="py-2.5 flex items-center justify-between text-xs">
                    {editingSubId === sub.id ? (
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 mr-2">
                        <select
                          value={editSubCatId}
                          onChange={(e) => setEditSubCatId(e.target.value)}
                          className="text-xs bg-white border border-beige-300 rounded px-2 py-1"
                        >
                          {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editSubNombre}
                          onChange={(e) => setEditSubNombre(e.target.value)}
                          className="text-xs bg-white border border-beige-300 rounded px-2 py-1"
                        />
                        <div className="flex items-center space-x-1">
                          <input
                            type="text"
                            value={editSubSlug}
                            onChange={(e) => setEditSubSlug(e.target.value)}
                            className="flex-1 text-xs bg-white border border-beige-300 rounded px-2 py-1"
                          />
                          <button
                            onClick={() => handleSaveEditSub(sub.id)}
                            className="text-green-700 hover:text-green-800 p-1"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingSubId(null)}
                            className="text-navy/40 hover:text-navy p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleSubDestacada(sub)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              sub.destacada
                                ? 'bg-amber-50 border-amber-300 text-amber-600'
                                : 'bg-white border-beige-200 text-navy/30 hover:text-navy hover:border-beige-300'
                            }`}
                            title={sub.destacada ? 'Subcategoría destacada en Home (clic para quitar)' : 'Clic para destacar en Home'}
                          >
                            <Star className={`w-3.5 h-3.5 ${sub.destacada ? 'fill-amber-500' : ''}`} />
                          </button>
                          <div>
                            <span className="font-montserrat font-bold text-navy">
                              {sub.nombre}
                            </span>
                            <span className="ml-2 text-[10px] text-navy/50 font-mono">
                              /{sub.slug}
                            </span>
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-beige-100 text-navy/70 text-[9px] font-semibold uppercase">
                              {sub.categoria?.nombre || 'General'}
                            </span>
                            {sub.destacada && (
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wider">
                                Destacada en Home
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleStartEditSub(sub)}
                            className="p-1 text-navy/50 hover:text-navy"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubcategoria(sub.id, sub.nombre)}
                            className="p-1 text-navy/30 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
