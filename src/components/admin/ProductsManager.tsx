import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Star, Image as ImageIcon, Filter, RefreshCw } from 'lucide-react';
import { Producto, Subcategoria, Categoria, TipoOferta } from '../../lib/supabase';
import { ProductModal } from './ProductModal';
import { SupabaseService } from '../../services/supabaseService';

interface ProductsManagerProps {
  productos: Producto[];
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  tiposOferta: TipoOferta[];
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

export function ProductsManager({
  productos,
  categorias,
  subcategorias,
  tiposOferta,
  onRefresh,
  isLoading,
}: ProductsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubcat, setSelectedSubcat] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredProducts = productos.filter((p) => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (!selectedSubcat) return true;

    // Puede ser ID de subcategoría o ID de categoría
    const matchesSub =
      p.subcategoria_id === selectedSubcat ||
      (Array.isArray(p.subcategorias_ids) && p.subcategorias_ids.includes(selectedSubcat));
    const matchesCat =
      p.subcategoria?.categoria_id === selectedSubcat ||
      (Array.isArray(p.categorias_ids) && p.categorias_ids.includes(selectedSubcat));

    return matchesSub || matchesCat;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Producto) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleToggleDestacado = async (prod: Producto) => {
    try {
      setTogglingId(prod.id);
      await SupabaseService.toggleProductoDestacado(prod.id, Boolean(prod.destacado));
      await onRefresh();
    } catch (err: any) {
      alert(`Error al cambiar estado destacado de la prenda: ${err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseás eliminar el producto "${name}"?`)) {
      return;
    }
    try {
      setDeletingId(id);
      await SupabaseService.deleteProducto(id);
      await onRefresh();
    } catch (err: any) {
      alert(`Error al eliminar producto: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveProduct = async (payload: any) => {
    if (editingProduct) {
      await SupabaseService.updateProducto(editingProduct.id, payload);
    } else {
      await SupabaseService.createProducto(payload);
    }
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top action and filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-beige-300 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-navy/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de prenda..."
            className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg pl-9 pr-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
          />
        </div>

        {/* Subcategory & Category Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-navy/40" />
          <select
            value={selectedSubcat}
            onChange={(e) => setSelectedSubcat(e.target.value)}
            className="text-xs bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy focus:outline-none focus:border-navy"
          >
            <option value="">Todas las categorías y subcat.</option>
            <optgroup label="Categorías Principales">
              {categorias.map((cat) => (
                <option key={`cat-${cat.id}`} value={cat.id}>
                  Categoría: {cat.nombre}
                </option>
              ))}
            </optgroup>
            <optgroup label="Subcategorías">
              {subcategorias.map((sub) => (
                <option key={`sub-${sub.id}`} value={sub.id}>
                  Subcat: {sub.nombre} ({sub.categoria?.nombre || 'General'})
                </option>
              ))}
            </optgroup>
          </select>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-navy/60 hover:text-navy hover:bg-beige-100 rounded-lg transition-colors"
            title="Recargar datos de Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* New Product Button */}
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center space-x-2 bg-navy hover:bg-navy-500 text-white px-5 py-2.5 rounded-lg text-xs font-montserrat font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Table list */}
      <div className="bg-white rounded-2xl border border-beige-300 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-beige-200 bg-beige-50 text-[10px] uppercase tracking-wider font-bold text-navy/60">
                <th className="py-3.5 px-4">Prenda & Fotos (R2)</th>
                <th className="py-3.5 px-4">Categoría / Subcat.</th>
                <th className="py-3.5 px-4">Precio ($ ARS)</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Oferta / Badge</th>
                <th className="py-3.5 px-4">Destacado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-100 text-xs text-navy">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-navy/50 font-light">
                    {productos.length === 0
                      ? 'No hay productos cargados en Supabase todavía. Podés crear uno nuevo o cargar los datos iniciales.'
                      : 'No se encontraron prendas que coincidan con la búsqueda.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const primaryImg = prod.imagenes_url?.[0];
                  return (
                    <tr key={prod.id} className="hover:bg-beige-50/60 transition-colors">
                      {/* Product & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-14 rounded-lg bg-beige-100 border border-beige-300/80 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {primaryImg ? (
                              <img
                                src={primaryImg}
                                alt={prod.nombre}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-navy/30" />
                            )}
                          </div>
                          <div>
                            <p className="font-montserrat font-bold text-xs uppercase text-navy">
                              {prod.nombre}
                            </p>
                            {prod.descripcion && (
                              <p className="text-[10px] text-navy/60 line-clamp-1 italic max-w-xs mt-0.5">
                                {prod.descripcion}
                              </p>
                            )}
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="text-[10px] text-navy/50 font-mono">
                                {prod.imagenes_url?.length || 0} foto(s) R2
                              </span>
                              {prod.colores && prod.colores.length > 0 && (
                                <>
                                  <span className="text-navy/30">•</span>
                                  <span className="text-[10px] text-navy/60 font-semibold">
                                    {prod.colores.length} color(es)
                                  </span>
                                  <div className="flex items-center -space-x-1 ml-0.5">
                                    {prod.colores.map((c, i) => (
                                      <span
                                        key={i}
                                        className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-2xs"
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Subcategory & Category */}
                      <td className="py-3 px-4">
                        <div className="space-y-1.5 max-w-[220px]">
                          {/* Categorías asignadas */}
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              const assignedCatIds = Array.isArray(prod.categorias_ids) && prod.categorias_ids.length > 0
                                ? prod.categorias_ids
                                : prod.subcategoria?.categoria_id
                                ? [prod.subcategoria.categoria_id]
                                : [];

                              if (assignedCatIds.length === 0) return null;

                              return assignedCatIds.map((cid) => {
                                const catObj =
                                  categorias.find((c) => c.id === cid) ||
                                  (prod.subcategoria?.categoria?.id === cid ? prod.subcategoria?.categoria : undefined);
                                return (
                                  <span
                                    key={cid}
                                    className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-navy text-white shadow-2xs"
                                  >
                                    {catObj?.nombre || 'Cat'}
                                  </span>
                                );
                              });
                            })()}
                          </div>

                          {/* Subcategorías asignadas */}
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              const assignedSubIds = Array.isArray(prod.subcategorias_ids) && prod.subcategorias_ids.length > 0
                                ? prod.subcategorias_ids
                                : prod.subcategoria_id
                                ? [prod.subcategoria_id]
                                : [];

                              if (assignedSubIds.length === 0) {
                                return <span className="text-navy/40 italic text-[11px]">Sin asignar</span>;
                              }

                              return assignedSubIds.map((sid) => {
                                const subObj =
                                  subcategorias.find((s) => s.id === sid) ||
                                  (prod.subcategoria?.id === sid ? prod.subcategoria : undefined);
                                return (
                                  <span
                                    key={sid}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-beige-200 text-navy border border-beige-300"
                                  >
                                    {subObj?.nombre || 'Subcat'}
                                  </span>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-navy">{formatPrice(Number(prod.precio))}</div>
                        {prod.precio_anterior && (
                          <div className="text-[10px] text-navy/40 line-through">
                            {formatPrice(Number(prod.precio_anterior))}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            prod.stock > 5
                              ? 'bg-green-100 text-green-800'
                              : prod.stock > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {prod.stock} un.
                        </span>
                      </td>

                      {/* Offer badge */}
                      <td className="py-3 px-4">
                        {prod.tipo_oferta ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              prod.tipo_oferta.color_badge || 'bg-navy text-white'
                            }`}
                          >
                            {prod.tipo_oferta.etiqueta_badge}
                          </span>
                        ) : (
                          <span className="text-navy/40 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleDestacado(prod)}
                          disabled={togglingId === prod.id}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            prod.destacado
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-beige-100 text-navy/40 hover:text-navy hover:bg-beige-200'
                          }`}
                          title={prod.destacado ? 'Prenda destacada en la web (Clic para quitar)' : 'Clic para destacar prenda en la web'}
                        >
                          <Star className={`w-3.5 h-3.5 ${prod.destacado ? 'fill-amber-500 text-amber-500' : 'text-navy/40'}`} />
                          <span>{prod.destacado ? 'Destacado' : 'Normal'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 text-navy/70 hover:text-navy hover:bg-beige-200 rounded-lg transition-colors"
                            title="Editar prenda"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id, prod.nombre)}
                            disabled={deletingId === prod.id}
                            className="p-1.5 text-navy/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar prenda"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-4 py-3 bg-beige-50 border-t border-beige-200 flex items-center justify-between text-xs text-navy/60 font-light">
          <span>Total de productos en base de datos: {productos.length}</span>
          <span>Sincronizado en tiempo real</span>
        </div>
      </div>

      {/* Modal create / edit */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        categorias={categorias}
        subcategorias={subcategorias}
        tiposOferta={tiposOferta}
      />
    </div>
  );
}
