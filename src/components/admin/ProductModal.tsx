import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { Producto, Subcategoria, TipoOferta } from '../../lib/supabase';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    nombre: string;
    precio: number;
    precio_anterior?: number | null;
    subcategoria_id?: string | null;
    tipo_oferta_id?: string | null;
    imagenes_url: string[];
    destacado: boolean;
    stock: number;
  }) => Promise<void>;
  product?: Producto | null;
  subcategorias: Subcategoria[];
  tiposOferta: TipoOferta[];
}

export function ProductModal({
  isOpen,
  onClose,
  onSave,
  product,
  subcategorias,
  tiposOferta,
}: ProductModalProps) {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState<number | ''>('');
  const [precioAnterior, setPrecioAnterior] = useState<number | ''>('');
  const [subcategoriaId, setSubcategoriaId] = useState('');
  const [tipoOfertaId, setTipoOfertaId] = useState('');
  const [destacado, setDestacado] = useState(false);
  const [stock, setStock] = useState<number | ''>(10);
  const [imagenes, setImagenes] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setNombre(product.nombre || '');
      setPrecio(product.precio || '');
      setPrecioAnterior(product.precio_anterior || '');
      setSubcategoriaId(product.subcategoria_id || '');
      setTipoOfertaId(product.tipo_oferta_id || '');
      setDestacado(Boolean(product.destacado));
      setStock(product.stock ?? 0);
      setImagenes(
        Array.isArray(product.imagenes_url) && product.imagenes_url.length > 0
          ? product.imagenes_url
          : ['']
      );
    } else {
      setNombre('');
      setPrecio('');
      setPrecioAnterior('');
      setSubcategoriaId(subcategorias[0]?.id || '');
      setTipoOfertaId('');
      setDestacado(false);
      setStock(15);
      setImagenes(['']);
    }
    setError(null);
  }, [product, subcategorias, isOpen]);

  if (!isOpen) return null;

  const handleAddImageUrl = () => {
    setImagenes([...imagenes, '']);
  };

  const handleRemoveImageUrl = (index: number) => {
    const updated = imagenes.filter((_, idx) => idx !== index);
    setImagenes(updated.length > 0 ? updated : ['']);
  };

  const handleImageUrlChange = (index: number, val: string) => {
    const updated = [...imagenes];
    updated[index] = val;
    setImagenes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('Por favor ingresá un nombre para la prenda.');
      return;
    }
    if (!precio || Number(precio) <= 0) {
      setError('Por favor ingresá un precio válido en ARS.');
      return;
    }

    const cleanUrls = imagenes.map((u) => u.trim()).filter(Boolean);

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        nombre: nombre.trim(),
        precio: Number(precio),
        precio_anterior: precioAnterior ? Number(precioAnterior) : null,
        subcategoria_id: subcategoriaId || null,
        tipo_oferta_id: tipoOfertaId || null,
        imagenes_url: cleanUrls,
        destacado,
        stock: Number(stock) || 0,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el producto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-beige-300 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-beige-200 bg-beige-50">
          <div>
            <h3 className="font-montserrat font-black text-lg text-navy uppercase">
              {product ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h3>
            <p className="text-xs text-navy/60 font-light">
              Los cambios se sincronizan en vivo con Supabase y la tienda pública.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-navy/50 hover:text-navy rounded-lg hover:bg-beige-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
              Nombre de la prenda *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Buzo con Cierre Boxy Heavy"
              className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
            />
          </div>

          {/* Precios & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                Precio ($ ARS) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej: 68000"
                className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                Precio Anterior ($)
              </label>
              <input
                type="number"
                min="0"
                value={precioAnterior}
                onChange={(e) => setPrecioAnterior(e.target.value ? Number(e.target.value) : '')}
                placeholder="Para tachado (ej: 79000)"
                className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                Stock disponible
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej: 20"
                className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
              />
            </div>
          </div>

          {/* Subcategoría & Tipo de Oferta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                Subcategoría
              </label>
              <select
                value={subcategoriaId}
                onChange={(e) => setSubcategoriaId(e.target.value)}
                className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
              >
                <option value="">-- Sin subcategoría --</option>
                {subcategorias.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.categoria?.nombre ? `[${sub.categoria.nombre}] ` : ''}
                    {sub.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                Tipo de Oferta / Badge
              </label>
              <select
                value={tipoOfertaId}
                onChange={(e) => setTipoOfertaId(e.target.value)}
                className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
              >
                <option value="">-- Sin oferta especial --</option>
                {tiposOferta.map((to) => (
                  <option key={to.id} value={to.id}>
                    {to.nombre} ({to.etiqueta_badge})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destacado */}
          <div className="flex items-center space-x-3 p-3 bg-beige-50 rounded-xl border border-beige-200">
            <input
              type="checkbox"
              id="destacado"
              checked={destacado}
              onChange={(e) => setDestacado(e.target.checked)}
              className="w-4 h-4 rounded text-navy focus:ring-navy border-beige-300 cursor-pointer"
            />
            <label htmlFor="destacado" className="text-xs font-semibold text-navy cursor-pointer select-none">
              Marcar como <strong>Producto Destacado</strong> (aparece en la sección principal de la Home)
            </label>
          </div>

          {/* URLs de Imágenes (Cloudflare R2) */}
          <div className="space-y-2 pt-2 border-t border-beige-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  URLs de Imágenes (Cloudflare R2 / CDN)
                </label>
                <p className="text-[11px] text-navy/60 font-light">
                  Ingresá los enlaces públicos de tus fotos (la 1ª será la foto principal del producto).
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="inline-flex items-center space-x-1 text-xs font-bold text-navy hover:text-navy-500 bg-beige-100 hover:bg-beige-200 px-2.5 py-1.5 rounded-lg border border-beige-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar foto</span>
              </button>
            </div>

            <div className="space-y-2.5 mt-2">
              {imagenes.map((url, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-beige-100 border border-beige-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {url.trim() ? (
                      <img
                        src={url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-navy/30" />
                    )}
                  </div>

                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                    placeholder={`https://pub-xxxx.r2.dev/foto-${idx + 1}.jpg`}
                    className="flex-1 text-xs bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy focus:outline-none focus:border-navy"
                  />

                  {imagenes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(idx)}
                      className="p-2 text-navy/40 hover:text-red-600 transition-colors"
                      title="Eliminar URL"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-beige-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-navy/70 hover:text-navy uppercase tracking-wider"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-navy hover:bg-navy-500 text-white text-xs font-montserrat font-bold uppercase tracking-wider rounded-lg shadow-md transition-colors disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{product ? 'Actualizar Producto' : 'Crear Producto'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
