import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Tag, Check, X, AlertCircle } from 'lucide-react';
import { TipoOferta } from '../../lib/supabase';
import { SupabaseService } from '../../services/supabaseService';

interface OfferTypesManagerProps {
  tiposOferta: TipoOferta[];
  onRefresh: () => Promise<void>;
}

const COLOR_PRESETS = [
  { label: 'Navy Clásico', value: 'bg-navy text-white' },
  { label: 'Rojo Fuego (HOT)', value: 'bg-red-600 text-white' },
  { label: 'Ámbar / Naranja (SALE)', value: 'bg-amber-600 text-white' },
  { label: 'Verde Éxito', value: 'bg-green-700 text-white' },
  { label: 'Beige Crudo (Minimal)', value: 'bg-beige-300 text-navy' },
  { label: 'Gris Oscuro', value: 'bg-neutral-800 text-white' },
];

export function OfferTypesManager({ tiposOferta, onRefresh }: OfferTypesManagerProps) {
  const [nombre, setNombre] = useState('');
  const [etiqueta, setEtiqueta] = useState('');
  const [color, setColor] = useState(COLOR_PRESETS[0].value);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editEtiqueta, setEditEtiqueta] = useState('');
  const [editColor, setEditColor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !etiqueta.trim()) return;
    try {
      setLoading(true);
      setError(null);
      await SupabaseService.createTipoOferta(nombre.trim(), etiqueta.trim(), color);
      setNombre('');
      setEtiqueta('');
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al crear tipo de oferta.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (item: TipoOferta) => {
    setEditingId(item.id);
    setEditNombre(item.nombre);
    setEditEtiqueta(item.etiqueta_badge);
    setEditColor(item.color_badge || COLOR_PRESETS[0].value);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      setLoading(true);
      await SupabaseService.updateTipoOferta(id, editNombre, editEtiqueta, editColor);
      setEditingId(null);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(`¿Eliminar el tipo de oferta "${label}"?`)) return;
    try {
      setLoading(true);
      await SupabaseService.deleteTipoOferta(id);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs space-y-6">
        <div>
          <h3 className="font-montserrat font-black text-lg uppercase text-navy flex items-center space-x-2">
            <Tag className="w-5 h-5 text-navy/60" />
            <span>Gestión de Tipos de Oferta & Badges</span>
          </h3>
          <p className="text-xs text-navy/60 font-light mt-1">
            Configurá las pastillas que aparecen en el panel lateral del Mega Menú ("Colección") y en las tarjetas de producto (ej: HOT, DROP, -60%, BEST SELLER).
          </p>
        </div>

        {/* Formulario Crear */}
        <form onSubmit={handleCreate} className="p-4 bg-beige-50/80 rounded-xl border border-beige-200 space-y-3">
          <span className="block text-xs font-bold uppercase tracking-wider text-navy">
            + Crear Nuevo Tipo de Oferta
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre (ej: Precios únicos)"
                className="w-full text-xs bg-white border border-beige-300 rounded-lg px-3 py-2 text-navy focus:outline-none focus:border-navy"
              />
            </div>
            <div className="sm:col-span-1">
              <input
                type="text"
                required
                value={etiqueta}
                onChange={(e) => setEtiqueta(e.target.value)}
                placeholder="Badge (ej: HOT, -60%)"
                className="w-full text-xs bg-white border border-beige-300 rounded-lg px-3 py-2 text-navy focus:outline-none focus:border-navy uppercase font-bold"
              />
            </div>
            <div className="sm:col-span-1">
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full text-xs bg-white border border-beige-300 rounded-lg px-2.5 py-2 text-navy focus:outline-none focus:border-navy"
              >
                {COLOR_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-1 flex items-center space-x-2">
              <div className="flex-1 text-center">
                <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${color}`}>
                  {etiqueta || 'PREVIEW'}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-navy hover:bg-navy-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Tabla de Tipos de Oferta */}
        <div className="divide-y divide-beige-100">
          {tiposOferta.length === 0 ? (
            <p className="text-xs text-navy/50 py-6 text-center italic">
              No hay tipos de oferta configurados. Podés cargar los datos iniciales o crear uno arriba.
            </p>
          ) : (
            tiposOferta.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                {editingId === item.id ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2 mr-2">
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="text-xs bg-white border border-beige-300 rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      value={editEtiqueta}
                      onChange={(e) => setEditEtiqueta(e.target.value)}
                      className="text-xs bg-white border border-beige-300 rounded px-2 py-1 font-bold uppercase"
                    />
                    <select
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="text-xs bg-white border border-beige-300 rounded px-2 py-1"
                    >
                      {COLOR_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${editColor}`}>
                        {editEtiqueta}
                      </span>
                      <button onClick={() => handleSaveEdit(item.id)} className="text-green-700 hover:text-green-800 p-1">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-navy/40 hover:text-navy p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.color_badge || 'bg-navy text-white'}`}>
                        {item.etiqueta_badge}
                      </span>
                      <div>
                        <span className="font-montserrat font-bold text-navy">
                          {item.nombre}
                        </span>
                        <span className="block text-[10px] text-navy/50 font-mono">
                          ID: {item.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 text-navy/50 hover:text-navy hover:bg-beige-100 rounded-md"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.nombre)}
                        className="p-1.5 text-navy/30 hover:text-red-600 hover:bg-red-50 rounded-md"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
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
  );
}
