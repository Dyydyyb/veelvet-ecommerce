import React, { useState, useMemo } from 'react';
import { X, SlidersHorizontal, TrendingUp, TrendingDown, Percent, DollarSign, Check, AlertCircle, RefreshCw, CheckSquare, Square } from 'lucide-react';
import { Producto, Categoria, Subcategoria } from '../../lib/supabase';
import { SupabaseService } from '../../services/supabaseService';

interface BulkPriceAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  selectedProductIds?: string[];
  onRefresh: () => Promise<void>;
}

export function BulkPriceAdjustModal({
  isOpen,
  onClose,
  productos,
  categorias,
  subcategorias,
  selectedProductIds = [],
  onRefresh,
}: BulkPriceAdjustModalProps) {
  // Acción: 'aumentar' (+) o 'bajar' (-)
  const [accion, setAccion] = useState<'aumentar' | 'bajar'>('aumentar');

  // Tipo: 'porcentaje' (%) o 'monto' ($ ARS)
  const [tipoAjuste, setTipoAjuste] = useState<'porcentaje' | 'monto'>('porcentaje');

  // Valor a ingresar
  const [valorAjuste, setValorAjuste] = useState<string>('10');

  // Alcance / Categoría seleccionada
  const [alcance, setAlcance] = useState<string>(() => {
    if (selectedProductIds.length > 0) return 'seleccionados';
    return 'todos';
  });

  // Precios a modificar
  const [modificarMinorista, setModificarMinorista] = useState<boolean>(true);
  const [modificarMayorista, setModificarMayorista] = useState<boolean>(true);

  // Estados de proceso
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filtrado de productos según el alcance elegido
  const targetProducts = useMemo(() => {
    if (alcance === 'seleccionados') {
      const selectedSet = new Set(selectedProductIds);
      return productos.filter((p) => selectedSet.has(p.id));
    }
    if (alcance === 'todos') {
      return productos;
    }
    if (alcance.startsWith('cat:')) {
      const catId = alcance.replace('cat:', '');
      return productos.filter((p) => {
        const matchesDirect = p.subcategoria?.categoria_id === catId;
        const matchesArray = Array.isArray(p.categorias_ids) && p.categorias_ids.includes(catId);
        const matchesSubArray =
          Array.isArray(p.subcategorias_ids) &&
          p.subcategorias_ids.some((sid) => {
            const sub = subcategorias.find((s) => s.id === sid);
            return sub?.categoria_id === catId || sub?.categorias_ids?.includes(catId);
          });
        return matchesDirect || matchesArray || matchesSubArray;
      });
    }
    if (alcance.startsWith('sub:')) {
      const subId = alcance.replace('sub:', '');
      return productos.filter((p) => {
        const matchesDirect = p.subcategoria_id === subId;
        const matchesArray = Array.isArray(p.subcategorias_ids) && p.subcategorias_ids.includes(subId);
        return matchesDirect || matchesArray;
      });
    }
    return productos;
  }, [alcance, productos, selectedProductIds, subcategorias]);

  // Cálculo de ejemplo para previsualización
  const numValor = parseFloat(valorAjuste) || 0;
  const sampleProduct = targetProducts[0] || productos[0];
  
  const calculateNewPrice = (currentPrice: number) => {
    if (numValor <= 0) return currentPrice;
    if (accion === 'aumentar') {
      if (tipoAjuste === 'porcentaje') {
        return Math.round(currentPrice * (1 + numValor / 100));
      } else {
        return Math.round(currentPrice + numValor);
      }
    } else {
      if (tipoAjuste === 'porcentaje') {
        return Math.max(1, Math.round(currentPrice * (1 - numValor / 100)));
      } else {
        return Math.max(1, Math.round(currentPrice - numValor));
      }
    }
  };

  const sampleOriginalPrice = sampleProduct ? Number(sampleProduct.precio) : 25000;
  const sampleCalculatedPrice = calculateNewPrice(sampleOriginalPrice);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleApply = async () => {
    setError(null);
    setSuccess(null);

    if (numValor <= 0 || isNaN(numValor)) {
      setError('Por favor, ingresá un valor mayor a cero para el ajuste.');
      return;
    }

    if (!modificarMinorista && !modificarMayorista) {
      setError('Debés marcar al menos un tipo de precio para modificar (Minorista o Mayorista).');
      return;
    }

    if (targetProducts.length === 0) {
      setError('No hay productos que coincidan con la categoría o selección indicada.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updates = targetProducts.map((p) => {
        const currentPrice = Number(p.precio) || 0;
        const newPrice = calculateNewPrice(currentPrice);

        let newOldPrice: number | null | undefined = undefined;
        if (p.precio_anterior) {
          const currentOld = Number(p.precio_anterior);
          newOldPrice = calculateNewPrice(currentOld);
        }

        return {
          id: p.id,
          precio: modificarMinorista ? newPrice : currentPrice,
          precio_anterior: newOldPrice,
        };
      });

      const res = await SupabaseService.bulkUpdatePrices(updates);

      if (res.errors.length > 0 && res.updatedCount === 0) {
        throw new Error(res.errors[0]);
      }

      await onRefresh();
      setSuccess(`¡Ajuste aplicado con éxito a ${res.updatedCount} producto(s)!`);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Error aplicando ajuste masivo de precios:', err);
      setError(err.message || 'Ocurrió un error al actualizar los precios en la base de datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-beige-300 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-beige-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <SlidersHorizontal className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-montserrat font-black text-lg text-navy tracking-tight">
                Ajuste Masivo de Precios
              </h3>
              <p className="text-xs text-navy/60 font-light mt-0.5">
                Aumentá o bajá los precios de tus productos por porcentaje o monto fijo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-navy/40 hover:text-navy hover:bg-beige-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="py-5 space-y-5 text-navy">
          
          {/* 1. Acción a Realizar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy/80 mb-2">
              Acción a Realizar
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccion('aumentar')}
                className={`py-3 px-4 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  accion === 'aumentar'
                    ? 'bg-[#00875A] text-white shadow-md'
                    : 'bg-beige-100 hover:bg-beige-200 text-navy/70'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Aumentar Precios (+)</span>
              </button>

              <button
                type="button"
                onClick={() => setAccion('bajar')}
                className={`py-3 px-4 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  accion === 'bajar'
                    ? 'bg-rose-700 text-white shadow-md'
                    : 'bg-beige-100 hover:bg-beige-200 text-navy/70'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Bajar Precios (-)</span>
              </button>
            </div>
          </div>

          {/* 2. Tipo de Ajuste */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy/80 mb-2">
              Tipo de Ajuste
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoAjuste('porcentaje')}
                className={`py-3 px-4 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  tipoAjuste === 'porcentaje'
                    ? 'bg-[#1868DF] text-white shadow-md'
                    : 'bg-beige-100 hover:bg-beige-200 text-navy/70'
                }`}
              >
                <Percent className="w-4 h-4" />
                <span>Porcentaje (%)</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoAjuste('monto')}
                className={`py-3 px-4 rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  tipoAjuste === 'monto'
                    ? 'bg-[#1868DF] text-white shadow-md'
                    : 'bg-beige-100 hover:bg-beige-200 text-navy/70'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Monto Fijo ($ ARS)</span>
              </button>
            </div>
          </div>

          {/* 3. Input de Valor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy/80 mb-2">
              {tipoAjuste === 'porcentaje' ? 'Porcentaje de Ajuste (%)' : 'Monto de Ajuste ($ ARS)'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step={tipoAjuste === 'porcentaje' ? '1' : '100'}
                value={valorAjuste}
                onChange={(e) => setValorAjuste(e.target.value)}
                placeholder={tipoAjuste === 'porcentaje' ? 'Ej: 10 (para 10%)' : 'Ej: 2000 (para $2.000)'}
                className="w-full text-xs sm:text-sm bg-beige-50 border border-beige-300 rounded-xl px-4 py-3 text-navy font-bold focus:outline-none focus:border-navy"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-navy/50 pointer-events-none">
                {tipoAjuste === 'porcentaje' ? '%' : '$ ARS'}
              </span>
            </div>
          </div>

          {/* 4. Aplicar en Categoría / Selección */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy/80 mb-2">
              Aplicar en Categoría
            </label>
            <select
              value={alcance}
              onChange={(e) => setAlcance(e.target.value)}
              className="w-full text-xs sm:text-sm bg-beige-50 border border-beige-300 rounded-xl px-4 py-3 text-navy font-semibold focus:outline-none focus:border-navy cursor-pointer"
            >
              <option value="todos">
                ☀️ Todos los Productos ({productos.length} artículos)
              </option>

              {selectedProductIds.length > 0 && (
                <option value="seleccionados">
                  ☑️ Productos Seleccionados ({selectedProductIds.length} artículos elegidos)
                </option>
              )}

              <optgroup label="Categorías Principales">
                {categorias.map((cat) => {
                  const count = productos.filter((p) => {
                    const matchesDirect = p.subcategoria?.categoria_id === cat.id;
                    const matchesArray = Array.isArray(p.categorias_ids) && p.categorias_ids.includes(cat.id);
                    const matchesSub =
                      Array.isArray(p.subcategorias_ids) &&
                      p.subcategorias_ids.some((sid) => {
                        const sub = subcategorias.find((s) => s.id === sid);
                        return sub?.categoria_id === cat.id || sub?.categorias_ids?.includes(cat.id);
                      });
                    return matchesDirect || matchesArray || matchesSub;
                  }).length;
                  return (
                    <option key={`cat-${cat.id}`} value={`cat:${cat.id}`}>
                      📁 {cat.nombre} ({count} artículos)
                    </option>
                  );
                })}
              </optgroup>

              <optgroup label="Subcategorías">
                {subcategorias.map((sub) => {
                  const count = productos.filter(
                    (p) =>
                      p.subcategoria_id === sub.id ||
                      (Array.isArray(p.subcategorias_ids) && p.subcategorias_ids.includes(sub.id))
                  ).length;
                  return (
                    <option key={`sub-${sub.id}`} value={`sub:${sub.id}`}>
                      🏷️ {sub.nombre} ({count} artículos)
                    </option>
                  );
                })}
              </optgroup>
            </select>
          </div>

          {/* 5. Precios a Modificar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy/80 mb-2">
              Precios a Modificar
            </label>
            <div className="bg-beige-50 border border-beige-300 rounded-xl p-3 sm:p-4 flex items-center justify-around gap-4">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold text-navy select-none">
                <input
                  type="checkbox"
                  checked={modificarMinorista}
                  onChange={(e) => setModificarMinorista(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span>Precio Minorista</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold text-navy select-none">
                <input
                  type="checkbox"
                  checked={modificarMayorista}
                  onChange={(e) => setModificarMayorista(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span>Precio Mayorista</span>
              </label>
            </div>
          </div>

          {/* Previsualización del cálculo */}
          <div className="bg-[#FAF7F0] p-4 rounded-xl border border-beige-300/80 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold text-navy">
              <span>Artículos a modificar:</span>
              <span className="font-mono bg-beige-200 px-2 py-0.5 rounded text-navy">
                {targetProducts.length} producto(s)
              </span>
            </div>
            {sampleProduct && numValor > 0 && (
              <div className="pt-2 border-t border-beige-200/80 text-navy/80 flex items-center justify-between font-mono text-[11px]">
                <span className="truncate max-w-[200px]" title={sampleProduct.nombre}>
                  Ej: {sampleProduct.nombre}
                </span>
                <span className="font-bold">
                  {formatCurrency(sampleOriginalPrice)} ➔{' '}
                  <span className={accion === 'aumentar' ? 'text-emerald-700' : 'text-rose-700'}>
                    {formatCurrency(sampleCalculatedPrice)}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-xs text-red-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 border border-green-300 rounded-xl text-xs text-green-800 flex items-center space-x-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-beige-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-beige-300 text-xs font-montserrat font-bold uppercase tracking-wider text-navy/70 hover:bg-beige-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={isSubmitting || targetProducts.length === 0}
            className="px-6 py-2.5 rounded-xl bg-[#00875A] hover:bg-[#00704A] disabled:opacity-50 text-white text-xs font-montserrat font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Aplicando Ajuste...</span>
              </>
            ) : (
              <span>Aplicar Ajuste de Precios</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
