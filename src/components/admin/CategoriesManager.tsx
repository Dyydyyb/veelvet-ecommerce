import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Layers,
  Check,
  X,
  AlertCircle,
  Star,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { Categoria, Subcategoria, MenuLateralItem } from '../../lib/supabase';
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
  const [newCatImagen, setNewCatImagen] = useState('');
  const [newCatDestacada, setNewCatDestacada] = useState(false);

  // Estado para editar Categoría
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatNombre, setEditCatNombre] = useState('');
  const [editCatOrden, setEditCatOrden] = useState<number | ''>(1);
  const [editCatImagen, setEditCatImagen] = useState('');
  const [editCatDestacada, setEditCatDestacada] = useState(false);

  // Estado para crear Subcategoría
  const [newSubNombre, setNewSubNombre] = useState('');
  const [newSubCatIds, setNewSubCatIds] = useState<string[]>([]);
  const [newSubSlug, setNewSubSlug] = useState('');
  const [newSubImagen, setNewSubImagen] = useState('');
  const [newSubDestacada, setNewSubDestacada] = useState(false);

  // Estado para editar Subcategoría
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubNombre, setEditSubNombre] = useState('');
  const [editSubCatIds, setEditSubCatIds] = useState<string[]>([]);
  const [editSubSlug, setEditSubSlug] = useState('');
  const [editSubImagen, setEditSubImagen] = useState('');

  // Estado para Menú Lateral Izquierdo de Colección (Header Mega Menú)
  const [menuLateralItems, setMenuLateralItems] = useState<MenuLateralItem[]>([]);
  const [tipoItemToAdd, setTipoItemToAdd] = useState<'categoria' | 'subcategoria'>('categoria');
  const [selectedItemToAdd, setSelectedItemToAdd] = useState('');
  const [savingLateral, setSavingLateral] = useState(false);
  const [lateralNotice, setLateralNotice] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const missingColumnSql = 'ALTER TABLE categorias ADD COLUMN IF NOT EXISTS destacada boolean DEFAULT false;';

  const handleCopyMissingSql = () => {
    navigator.clipboard.writeText(missingColumnSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Cargar configuración del Menú Lateral
  const loadMenuLateral = async () => {
    try {
      const items = await SupabaseService.getMenuLateralItems();
      setMenuLateralItems(items);
    } catch (e) {
      console.warn('Error al cargar menú lateral:', e);
    }
  };

  useEffect(() => {
    loadMenuLateral();
  }, [subcategorias, categorias]);

  // Set default category when available
  useEffect(() => {
    if (categorias.length > 0 && newSubCatIds.length === 0) {
      setNewSubCatIds([categorias[0].id]);
    }
  }, [categorias, newSubCatIds]);

  const toggleNewSubCat = (catId: string) => {
    setNewSubCatIds((prev) => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev; // Mantener al menos una categoría seleccionada
        return prev.filter((id) => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const toggleEditSubCat = (catId: string) => {
    setEditSubCatIds((prev) => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev; // Mantener al menos una categoría seleccionada
        return prev.filter((id) => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

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
        newCatDestacada,
        newCatImagen.trim()
      );
      setNewCatNombre('');
      setNewCatImagen('');
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
    setEditCatImagen(cat.imagen_url || '');
    setEditCatDestacada(Boolean(cat.destacada));
  };

  const handleSaveEditCat = async (id: string) => {
    try {
      setLoading(true);
      await SupabaseService.updateCategoria(
        id,
        editCatNombre,
        Number(editCatOrden) || 1,
        editCatDestacada,
        editCatImagen.trim()
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
    if (!newSubNombre.trim() || newSubCatIds.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      const created = await SupabaseService.createSubcategoria(
        newSubCatIds[0],
        newSubNombre.trim(),
        newSubSlug.trim(),
        newSubImagen.trim(),
        newSubCatIds
      );
      if (newSubDestacada && created?.id) {
        await SupabaseService.toggleSubcategoriaDestacada(created.id, false);
      }
      setNewSubNombre('');
      setNewSubSlug('');
      setNewSubImagen('');
      setNewSubDestacada(false);
      setNewSubCatIds(categorias.length > 0 ? [categorias[0].id] : []);
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
    const existingCats = Array.isArray(sub.categorias_ids) && sub.categorias_ids.length > 0
      ? sub.categorias_ids
      : sub.categoria_id ? [sub.categoria_id] : [];
    setEditSubCatIds(existingCats);
    setEditSubSlug(sub.slug);
    setEditSubImagen(sub.imagen_url || '');
  };

  const handleSaveEditSub = async (id: string) => {
    if (editSubCatIds.length === 0) {
      setError('Debés asignar al menos una categoría a la subcategoría.');
      return;
    }
    try {
      setLoading(true);
      await SupabaseService.updateSubcategoria(
        id,
        editSubCatIds[0],
        editSubNombre,
        editSubSlug,
        editSubImagen.trim(),
        editSubCatIds
      );
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

  // Handlers Menú Lateral Izquierdo de Colección
  const handleMoveLateral = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === menuLateralItems.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...menuLateralItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Recalcular orden secuencial
    const updated = newItems.map((item, idx) => ({ ...item, orden: idx + 1 }));
    setMenuLateralItems(updated);

    try {
      setSavingLateral(true);
      await SupabaseService.saveMenuLateralItems(updated);
      setLateralNotice('Posición jerárquica actualizada con éxito.');
      setTimeout(() => setLateralNotice(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar orden del menú lateral.');
    } finally {
      setSavingLateral(false);
    }
  };

  const handleChangeLateralOrder = async (id: string, newOrden: number) => {
    const updated = menuLateralItems.map((it) => (it.id === id ? { ...it, orden: newOrden } : it));
    updated.sort((a, b) => a.orden - b.orden);
    const normalized = updated.map((item, idx) => ({ ...item, orden: idx + 1 }));
    setMenuLateralItems(normalized);

    try {
      setSavingLateral(true);
      await SupabaseService.saveMenuLateralItems(normalized);
      setLateralNotice('Posición jerárquica guardada.');
      setTimeout(() => setLateralNotice(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar posición.');
    } finally {
      setSavingLateral(false);
    }
  };

  const handleRemoveFromLateral = async (id: string, itemName: string) => {
    const updated = menuLateralItems
      .filter((it) => it.id !== id)
      .map((it, idx) => ({ ...it, orden: idx + 1 }));
    setMenuLateralItems(updated);

    try {
      setSavingLateral(true);
      await SupabaseService.saveMenuLateralItems(updated);
      setLateralNotice(`"${itemName}" fue quitada de la sección lateral (sigue activa en la tienda).`);
      setTimeout(() => setLateralNotice(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Error al remover del menú lateral.');
    } finally {
      setSavingLateral(false);
    }
  };

  const handleAddToLateral = async () => {
    if (!selectedItemToAdd) return;
    if (menuLateralItems.some((it) => it.id === selectedItemToAdd)) return;

    const nextOrden = menuLateralItems.length + 1;
    const newItem: MenuLateralItem = {
      id: selectedItemToAdd,
      orden: nextOrden,
      tipo: tipoItemToAdd,
    };
    const updated = [...menuLateralItems, newItem];
    setMenuLateralItems(updated);
    setSelectedItemToAdd('');

    try {
      setSavingLateral(true);
      await SupabaseService.saveMenuLateralItems(updated);
      const itemLabel =
        tipoItemToAdd === 'categoria'
          ? categorias.find((c) => c.id === selectedItemToAdd)?.nombre || 'Categoría'
          : subcategorias.find((s) => s.id === selectedItemToAdd)?.nombre || 'Subcategoría';
      setLateralNotice(`"${itemLabel}" agregada a la sección lateral de Colección.`);
      setTimeout(() => setLateralNotice(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Error al agregar al menú lateral.');
    } finally {
      setSavingLateral(false);
    }
  };

  const handleSaveAllLateral = async () => {
    try {
      setSavingLateral(true);
      await SupabaseService.saveMenuLateralItems(menuLateralItems);
      setLateralNotice('Configuración del Menú Lateral guardada en Supabase.');
      setTimeout(() => setLateralNotice(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar menú lateral.');
    } finally {
      setSavingLateral(false);
    }
  };

  // Categorías y subcategorías que aún no están en el menú lateral
  const availableCatsForLateral = categorias.filter(
    (c) => !menuLateralItems.some((it) => it.id === c.id)
  );
  const availableSubsForLateral = subcategorias.filter(
    (s) => !menuLateralItems.some((it) => it.id === s.id)
  );

  return (
    <div className="space-y-10">
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

      {/* Grid: 2 Columns (Categorías y Subcategorías con Imágenes Principales) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================= */}
        {/* Column 1: Categorías Principales */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-beige-300 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-beige-200">
              <div>
                <h3 className="font-montserrat font-black text-base uppercase text-navy">
                  1. Categorías Principales
                </h3>
                <p className="text-[11px] text-navy/60 font-light">
                  Grupos mayores del Mega Menú con imagen principal para la Home.
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
                  placeholder="Nombre (ej: Abrigos)"
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
              </div>

              {/* URL Imagen Principal */}
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={newCatImagen}
                    onChange={(e) => setNewCatImagen(e.target.value)}
                    placeholder="URL imagen principal (Cloudflare R2 o Web)"
                    className="w-full text-xs bg-white border border-beige-300 rounded-lg pl-8 pr-3 py-2 text-navy focus:outline-none focus:border-navy"
                  />
                  <ImageIcon className="w-3.5 h-3.5 text-navy/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                {newCatImagen.trim() && (
                  <img
                    src={newCatImagen.trim()}
                    alt="Preview"
                    className="w-8 h-8 rounded-md object-cover border border-beige-300 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-navy hover:bg-navy-500 text-white p-2 rounded-lg transition-colors cursor-pointer flex-shrink-0"
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
                      <div className="flex-1 flex flex-col space-y-2 mr-2 bg-beige-50 p-2.5 rounded-lg border border-beige-300">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editCatNombre}
                            onChange={(e) => setEditCatNombre(e.target.value)}
                            placeholder="Nombre de categoría"
                            className="flex-1 text-xs bg-white border border-beige-300 rounded px-2 py-1"
                          />
                          <input
                            type="number"
                            value={editCatOrden}
                            onChange={(e) => setEditCatOrden(Number(e.target.value))}
                            className="w-14 text-xs bg-white border border-beige-300 rounded px-1 py-1 text-center"
                            title="Orden numérico"
                          />
                          <button
                            onClick={() => handleSaveEditCat(cat.id)}
                            className="text-green-700 hover:text-green-800 p-1 cursor-pointer"
                            title="Guardar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingCatId(null)}
                            className="text-navy/40 hover:text-navy p-1 cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Input imagen en edición */}
                        <div className="flex items-center space-x-2">
                          <input
                            type="url"
                            value={editCatImagen}
                            onChange={(e) => setEditCatImagen(e.target.value)}
                            placeholder="URL imagen principal (Cloudflare R2)"
                            className="flex-1 text-xs bg-white border border-beige-300 rounded px-2 py-1"
                          />
                          {editCatImagen.trim() && (
                            <img
                              src={editCatImagen.trim()}
                              alt="Preview"
                              className="w-6 h-6 rounded object-cover border border-beige-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
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
                        <div className="flex items-center space-x-2.5">
                          <button
                            onClick={() => handleToggleDestacada(cat)}
                            disabled={loading}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              cat.destacada
                                ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                                : 'text-navy/20 hover:text-navy/60 hover:bg-beige-100'
                            }`}
                            title={cat.destacada ? 'Categoría destacada en Home (clic para quitar)' : 'Clic para destacar en Home'}
                          >
                            <Star className={`w-3.5 h-3.5 ${cat.destacada ? 'fill-amber-500' : ''}`} />
                          </button>

                          {/* Thumbnail de la categoría */}
                          {cat.imagen_url ? (
                            <img
                              src={cat.imagen_url}
                              alt={cat.nombre}
                              className="w-9 h-9 rounded-lg object-cover border border-beige-300 shadow-xs flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/images/hero-look.jpg';
                              }}
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-lg bg-beige-100 border border-beige-200 flex items-center justify-center text-navy/35 flex-shrink-0"
                              title="Sin imagen asignada"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}

                          <div>
                            <span className="font-montserrat font-bold uppercase text-navy block">
                              {cat.nombre}
                            </span>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-[10px] text-navy/50 font-mono">
                                Orden #{cat.orden}
                              </span>
                              {cat.destacada && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                                  Destacada
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleStartEditCat(cat)}
                            className="p-1 text-navy/50 hover:text-navy cursor-pointer"
                            title="Editar categoría e imagen"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategoria(cat.id, cat.nombre)}
                            className="p-1 text-navy/30 hover:text-red-600 cursor-pointer"
                            title="Eliminar categoría"
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
        {/* Column 2: Subcategorías de Prendas */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-beige-300 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-beige-200">
              <div>
                <h3 className="font-montserrat font-black text-base uppercase text-navy">
                  2. Subcategorías de Prendas
                </h3>
                <p className="text-[11px] text-navy/60 font-light">
                  Tipos de prendas con su propia imagen para mostrar en Home.
                </p>
              </div>
              <span className="text-xs bg-beige-200 text-navy px-2 py-0.5 rounded-full font-bold">
                {subcategorias.length}
              </span>
            </div>

            {/* Form Crear Subcategoría */}
            <form onSubmit={handleCreateSubcategoria} className="space-y-3 bg-beige-50/70 p-4 rounded-xl border border-beige-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-navy">
                  + Nueva Subcategoría
                </span>
                <span className="text-[10px] text-navy/60">
                  Podés asignarla a una o más categorías (sus productos se incluirán en todas).
                </span>
              </div>

              {/* Selector de Múltiples Categorías */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70">
                  Categorías Asignadas (hacé clic para sumar o quitar categorías):
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-lg border border-beige-300">
                  {categorias.map((cat) => {
                    const isSelected = newSubCatIds.includes(cat.id);
                    return (
                      <button
                        key={`new-sub-cat-${cat.id}`}
                        type="button"
                        onClick={() => toggleNewSubCat(cat.id)}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-navy text-white shadow-2xs'
                            : 'bg-beige-100/70 text-navy/70 hover:bg-beige-200 hover:text-navy border border-beige-200'
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3 opacity-60" />}
                        <span>{cat.nombre}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                  placeholder="Nombre (ej: Camperas, Remeras)"
                  className="text-xs bg-white border border-beige-300 rounded-lg px-3 py-2 text-navy focus:outline-none focus:border-navy"
                />

                <input
                  type="text"
                  value={newSubSlug}
                  onChange={(e) => setNewSubSlug(e.target.value)}
                  placeholder="Slug URL (ej: campera, remeras)"
                  className="text-xs bg-white border border-beige-300 rounded-lg px-2.5 py-2 text-navy focus:outline-none focus:border-navy"
                />
              </div>

              {/* URL Imagen Principal Subcategoría */}
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={newSubImagen}
                    onChange={(e) => setNewSubImagen(e.target.value)}
                    placeholder="URL imagen principal para Home (Cloudflare R2 o Web)"
                    className="w-full text-xs bg-white border border-beige-300 rounded-lg pl-8 pr-3 py-2 text-navy focus:outline-none focus:border-navy"
                  />
                  <ImageIcon className="w-3.5 h-3.5 text-navy/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                {newSubImagen.trim() && (
                  <img
                    src={newSubImagen.trim()}
                    alt="Preview"
                    className="w-8 h-8 rounded-md object-cover border border-beige-300 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <button
                  type="submit"
                  disabled={loading || newSubCatIds.length === 0}
                  className="bg-navy hover:bg-navy-500 text-white px-3 py-2 rounded-lg transition-colors cursor-pointer flex-shrink-0 flex items-center space-x-1"
                  title="Crear subcategoría"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-xs font-semibold hidden sm:inline">Agregar</span>
                </button>
              </div>

              <label className="flex items-center space-x-2 text-xs text-navy cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newSubDestacada}
                  onChange={(e) => setNewSubDestacada(e.target.checked)}
                  className="rounded text-navy focus:ring-navy cursor-pointer"
                />
                <span className="text-[11px] font-medium text-navy/80 flex items-center space-x-1">
                  <Star className="w-3 h-3 text-amber-500" />
                  <span>Destacar en Home (figura en la sección de Categorías Destacadas)</span>
                </span>
              </label>
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
                      <div className="flex-1 flex flex-col space-y-2.5 mr-2 bg-beige-50 p-3 rounded-lg border border-beige-300">
                        {/* Selector de categorías para editar */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-navy/70 block">
                            Categorías asignadas (clic para sumar/quitar):
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white rounded border border-beige-300">
                            {categorias.map((c) => {
                              const isAssigned = editSubCatIds.includes(c.id);
                              return (
                                <button
                                  key={`edit-sub-cat-${c.id}`}
                                  type="button"
                                  onClick={() => toggleEditSubCat(c.id)}
                                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                                    isAssigned
                                      ? 'bg-navy text-white shadow-2xs'
                                      : 'bg-beige-100 text-navy/60 hover:bg-beige-200 hover:text-navy border border-beige-200'
                                  }`}
                                >
                                  {isAssigned ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3 opacity-60" />}
                                  <span>{c.nombre}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editSubNombre}
                            onChange={(e) => setEditSubNombre(e.target.value)}
                            placeholder="Nombre"
                            className="text-xs bg-white border border-beige-300 rounded px-2.5 py-1.5 text-navy focus:outline-none focus:border-navy"
                          />
                          <input
                            type="text"
                            value={editSubSlug}
                            onChange={(e) => setEditSubSlug(e.target.value)}
                            placeholder="Slug"
                            className="text-xs bg-white border border-beige-300 rounded px-2.5 py-1.5 text-navy focus:outline-none focus:border-navy"
                          />
                        </div>

                        {/* Input imagen al editar subcategoría */}
                        <div className="flex items-center space-x-2">
                          <input
                            type="url"
                            value={editSubImagen}
                            onChange={(e) => setEditSubImagen(e.target.value)}
                            placeholder="URL imagen principal (Cloudflare R2)"
                            className="flex-1 text-xs bg-white border border-beige-300 rounded px-2.5 py-1.5 text-navy focus:outline-none focus:border-navy"
                          />
                          {editSubImagen.trim() && (
                            <img
                              src={editSubImagen.trim()}
                              alt="Preview"
                              className="w-6 h-6 rounded object-cover border border-beige-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <button
                            onClick={() => handleSaveEditSub(sub.id)}
                            className="bg-navy hover:bg-navy-500 text-white px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer flex items-center space-x-1"
                            title="Guardar cambios"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Guardar</span>
                          </button>
                          <button
                            onClick={() => setEditingSubId(null)}
                            className="bg-beige-200 hover:bg-beige-300 text-navy px-2 py-1.5 rounded text-xs cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2.5">
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

                          {/* Thumbnail de la subcategoría */}
                          {sub.imagen_url ? (
                            <img
                              src={sub.imagen_url}
                              alt={sub.nombre}
                              className="w-9 h-9 rounded-lg object-cover border border-beige-300 shadow-xs flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/images/hero-look.jpg';
                              }}
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-lg bg-beige-100 border border-beige-200 flex items-center justify-center text-navy/35 flex-shrink-0"
                              title="Sin imagen asignada"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-montserrat font-bold text-navy">
                                {sub.nombre}
                              </span>
                              <span className="text-[10px] text-navy/50 font-mono">
                                /{sub.slug}
                              </span>
                              {sub.destacada && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wider">
                                  Destacada en Home
                                </span>
                              )}
                            </div>

                            {/* Badges de todas las categorías asignadas a esta subcategoría */}
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {(() => {
                                const assignedCats = Array.isArray(sub.categorias) && sub.categorias.length > 0
                                  ? sub.categorias
                                  : Array.isArray(sub.categorias_ids) && sub.categorias_ids.length > 0
                                  ? (sub.categorias_ids.map((cid) => categorias.find((c) => c.id === cid)).filter(Boolean) as Categoria[])
                                  : sub.categoria ? [sub.categoria] : [];

                                if (assignedCats.length === 0) {
                                  return (
                                    <span className="px-1.5 py-0.5 rounded bg-beige-100 text-navy/70 text-[9px] font-semibold uppercase">
                                      General
                                    </span>
                                  );
                                }

                                return assignedCats.map((c) => (
                                  <span
                                    key={`sub-assigned-cat-${sub.id}-${c.id}`}
                                    className="px-1.5 py-0.5 rounded bg-navy text-white text-[9px] font-bold uppercase tracking-wider shadow-2xs"
                                  >
                                    {c.nombre}
                                  </span>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleStartEditSub(sub)}
                            className="p-1 text-navy/50 hover:text-navy cursor-pointer"
                            title="Editar subcategoría e imagen"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubcategoria(sub.id, sub.nombre)}
                            className="p-1 text-navy/30 hover:text-red-600 cursor-pointer"
                            title="Eliminar subcategoría"
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

      {/* ========================================================= */}
      {/* Sección 3: Menú Lateral Izquierdo de «Colección» (Mega Menú) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-beige-300 shadow-sm p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-beige-200">
          <div>
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-5 h-5 text-navy" />
              <h3 className="font-montserrat font-black text-lg uppercase tracking-tight text-navy">
                3. Menú Lateral Izquierdo de «Colección» (Header)
              </h3>
            </div>
            <p className="text-xs text-navy/60 font-light mt-1">
              Asigná la posición jerárquica de las categorías completas y subcategorías en la primera columna del menú desplegable "Colección", o quitalas de esa sección si no querés que aparezcan allí.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            {lateralNotice && (
              <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg flex items-center space-x-1 animate-fade-in">
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span>{lateralNotice}</span>
              </span>
            )}
            <button
              onClick={handleSaveAllLateral}
              disabled={savingLateral}
              className="inline-flex items-center space-x-1.5 bg-navy hover:bg-navy-500 text-white text-xs font-montserrat font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{savingLateral ? 'Guardando...' : 'Guardar Jerarquía'}</span>
            </button>
          </div>
        </div>

        {/* Lista de Elementos en la Columna Lateral */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-navy/70 block">
            Elementos activos en la columna lateral izquierda (Categorías y Subcategorías):
          </span>

          {menuLateralItems.length === 0 ? (
            <div className="text-center py-8 bg-beige-50/60 rounded-xl border border-dashed border-beige-300 p-6">
              <p className="text-xs text-navy/60 font-light">
                No hay ninguna categoría ni subcategoría asignada a la sección lateral izquierda.
              </p>
              <p className="text-[11px] text-navy/40 mt-1">
                Usá el selector inferior para agregar categorías completas o subcategorías y definir su orden jerárquico.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-beige-200 rounded-xl border border-beige-300 overflow-hidden bg-white shadow-xs">
              {menuLateralItems.map((item, index) => {
                const isCat =
                  item.tipo === 'categoria' ||
                  (categorias.some((c) => c.id === item.id) && !subcategorias.some((s) => s.id === item.id));
                const catObj = isCat ? categorias.find((c) => c.id === item.id) : undefined;
                const subObj = !isCat ? subcategorias.find((s) => s.id === item.id) : undefined;

                const itemName = isCat
                  ? catObj?.nombre || `Categoría (${item.id.slice(0, 6)})`
                  : subObj?.nombre || `Subcategoría (${item.id.slice(0, 6)})`;
                const catParentName = !isCat ? subObj?.categoria?.nombre || 'General' : 'Categoría Entera';
                const itemRoute = isCat
                  ? `/tienda?cat=${encodeURIComponent(catObj?.nombre.toLowerCase() || '')}`
                  : `/tienda?sub=${subObj?.slug || ''}`;
                const itemImg = isCat ? catObj?.imagen_url : subObj?.imagen_url;

                return (
                  <div
                    key={item.id}
                    className="p-3 sm:px-4 flex items-center justify-between text-xs hover:bg-beige-50/70 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Badge de Jerarquía */}
                      <span className="w-7 h-7 rounded-lg bg-navy text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                        #{item.orden}
                      </span>

                      {/* Mini thumbnail */}
                      {itemImg ? (
                        <img
                          src={itemImg}
                          alt={itemName}
                          className="w-8 h-8 rounded-md object-cover border border-beige-300 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/images/hero-look.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-beige-100 border border-beige-200 flex items-center justify-center text-navy/30 flex-shrink-0">
                          <ImageIcon className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-montserrat font-bold text-navy text-sm">
                            {itemName}
                          </span>
                          {isCat ? (
                            <span className="px-2 py-0.5 rounded bg-navy text-white text-[9px] font-bold uppercase tracking-wider">
                              Categoría Entera
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-beige-200 text-navy/80 text-[10px] font-semibold uppercase">
                              {catParentName}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-navy/50 font-mono">
                          Ruta: {itemRoute}
                        </span>
                      </div>
                    </div>

                    {/* Controles de Jerarquía y Eliminación */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-beige-100 p-1 rounded-lg border border-beige-200">
                        <button
                          type="button"
                          disabled={index === 0 || savingLateral}
                          onClick={() => handleMoveLateral(index, 'up')}
                          className="p-1 rounded text-navy/70 hover:text-navy hover:bg-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Subir posición jerárquica"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === menuLateralItems.length - 1 || savingLateral}
                          onClick={() => handleMoveLateral(index, 'down')}
                          className="p-1 rounded text-navy/70 hover:text-navy hover:bg-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Bajar posición jerárquica"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Input manual de orden */}
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={item.orden}
                        onChange={(e) => handleChangeLateralOrder(item.id, Number(e.target.value) || 1)}
                        className="w-12 text-center text-xs font-mono font-bold bg-white border border-beige-300 rounded-lg py-1.5 text-navy focus:outline-none focus:border-navy"
                        title="Editar posición jerárquica numérica directamente"
                      />

                      {/* Botón Eliminar de esta sección lateral */}
                      <button
                        type="button"
                        onClick={() => handleRemoveFromLateral(item.id, itemName)}
                        disabled={savingLateral}
                        className="p-1.5 rounded-lg text-navy/40 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer ml-1"
                        title="Eliminar de la sección lateral de Colección"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Formulario para Agregar al Menú Lateral (Categoría Entera o Subcategoría) */}
        <div className="pt-4 border-t border-beige-200 bg-beige-50/60 p-4 rounded-xl space-y-3">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-navy">
            + Agregar Elemento a la Sección Lateral Izquierda:
          </span>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Selector de Tipo: Categoría o Subcategoría */}
            <div className="flex rounded-lg bg-white p-1 border border-beige-300 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setTipoItemToAdd('categoria');
                  setSelectedItemToAdd('');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  tipoItemToAdd === 'categoria'
                    ? 'bg-navy text-white shadow-2xs'
                    : 'text-navy/70 hover:text-navy hover:bg-beige-100'
                }`}
              >
                📁 Categoría Entera
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipoItemToAdd('subcategoria');
                  setSelectedItemToAdd('');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  tipoItemToAdd === 'subcategoria'
                    ? 'bg-navy text-white shadow-2xs'
                    : 'text-navy/70 hover:text-navy hover:bg-beige-100'
                }`}
              >
                🏷️ Subcategoría
              </button>
            </div>

            {/* Selector de Elemento según el tipo elegido */}
            <div className="flex-1">
              {tipoItemToAdd === 'categoria' ? (
                <select
                  value={selectedItemToAdd}
                  onChange={(e) => setSelectedItemToAdd(e.target.value)}
                  className="w-full text-xs bg-white border border-beige-300 rounded-lg px-3 py-2 text-navy focus:outline-none focus:border-navy"
                >
                  <option value="">-- Seleccionar categoría completa disponible --</option>
                  {availableCatsForLateral.map((c) => (
                    <option key={c.id} value={c.id}>
                      Categoría: {c.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedItemToAdd}
                  onChange={(e) => setSelectedItemToAdd(e.target.value)}
                  className="w-full text-xs bg-white border border-beige-300 rounded-lg px-3 py-2 text-navy focus:outline-none focus:border-navy"
                >
                  <option value="">-- Seleccionar subcategoría disponible --</option>
                  {availableSubsForLateral.map((s) => (
                    <option key={s.id} value={s.id}>
                      Subcategoría: {s.nombre} ({s.categoria?.nombre || 'General'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddToLateral}
              disabled={!selectedItemToAdd || savingLateral}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-navy hover:bg-navy-500 text-white text-xs font-montserrat font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar al Menú Lateral</span>
            </button>
          </div>
        </div>

        {/* Nota informativa clara */}
        <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl text-xs text-navy/80 flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="font-light leading-relaxed">
            <strong>Aclaración:</strong> Al eliminar una categoría o subcategoría de esta sección lateral izquierda, <strong>NO</strong> se borra de la tienda ni de la base de datos. Seguirá figurando en sus columnas habituales de categorías y en los filtros de la tienda.
          </p>
        </div>
      </div>
    </div>
  );
}
