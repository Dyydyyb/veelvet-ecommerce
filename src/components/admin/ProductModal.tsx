import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Sparkles, AlertCircle, Palette, Check, Tag, CreditCard, Percent, Layers, FolderCheck, Star } from 'lucide-react';
import { Producto, Subcategoria, Categoria, TipoOferta, ColorVariant } from '../../lib/supabase';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    nombre: string;
    precio: number;
    precio_anterior?: number | null;
    subcategoria_id?: string | null;
    subcategorias_ids?: string[];
    categorias_ids?: string[];
    tipo_oferta_id?: string | null;
    imagenes_url: string[];
    imagen_principal?: string | null;
    color_principal?: string | null;
    colores?: ColorVariant[];
    descripcion?: string | null;
    talles?: string[];
    permite_cuotas?: boolean;
    permite_transferencia_descuento?: boolean;
    destacado: boolean;
    stock: number;
  }) => Promise<void>;
  product?: Producto | null;
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  tiposOferta: TipoOferta[];
}

interface ColorItemState {
  name: string;
  titulo?: string;
  hex: string;
  imagenes: string[];
}

const PRESET_COLORS = [
  { name: 'Negro Washed', hex: '#161616' },
  { name: 'Gris Melange', hex: '#9B9B9B' },
  { name: 'Beige Crudo', hex: '#E2DAC8' },
  { name: 'Marrón Chocolate', hex: '#3B291D' },
  { name: 'Azul Veelvet', hex: '#1B2A4A' },
  { name: 'Blanco Óptico', hex: '#F3F4F6' },
  { name: 'Verde Militar', hex: '#3A4B3C' },
];

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Único'];

export function ProductModal({
  isOpen,
  onClose,
  onSave,
  product,
  categorias,
  subcategorias,
  tiposOferta,
}: ProductModalProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState<number | ''>('');
  const [precioAnterior, setPrecioAnterior] = useState<number | ''>('');
  const [selectedSubcategoriasIds, setSelectedSubcategoriasIds] = useState<string[]>([]);
  const [selectedCategoriasIds, setSelectedCategoriasIds] = useState<string[]>([]);
  const [tipoOfertaId, setTipoOfertaId] = useState('');
  const [destacado, setDestacado] = useState(false);
  const [stock, setStock] = useState<number | ''>(10);
  const [imagenes, setImagenes] = useState<string[]>(['']);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>('');
  const [colorPrincipal, setColorPrincipal] = useState<string>('');
  const [colores, setColores] = useState<ColorItemState[]>([]);
  const [talles, setTalles] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [customTalle, setCustomTalle] = useState('');
  const [permiteCuotas, setPermiteCuotas] = useState(true);
  const [permiteTransferencia, setPermiteTransferencia] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setNombre(product.nombre || '');
      setDescripcion(product.descripcion || '');
      setPrecio(typeof product.precio === 'number' ? product.precio : Number(product.precio) || '');
      setPrecioAnterior(
        typeof product.precio_anterior === 'number'
          ? product.precio_anterior
          : product.precio_anterior
          ? Number(product.precio_anterior) || ''
          : ''
      );
      
      // Cargar múltiples subcategorías
      const rawSubIds = Array.isArray(product.subcategorias_ids) && product.subcategorias_ids.length > 0
        ? product.subcategorias_ids.filter(Boolean)
        : product.subcategoria_id
        ? [product.subcategoria_id]
        : [];
      setSelectedSubcategoriasIds(rawSubIds);

      // Cargar múltiples categorías guardadas exactamente en el producto
      const rawCatIds = Array.isArray(product.categorias_ids) && product.categorias_ids.length > 0
        ? product.categorias_ids.filter(Boolean)
        : product.subcategoria?.categoria_id
        ? [product.subcategoria.categoria_id]
        : [];
      setSelectedCategoriasIds(rawCatIds);

      setTipoOfertaId(product.tipo_oferta_id || '');
      setDestacado(Boolean(product.destacado));
      setStock(product.stock != null ? Number(product.stock) || 0 : 0);
      setPermiteCuotas(product.permite_cuotas !== false);
      setPermiteTransferencia(product.permite_transferencia_descuento !== false);
      setTalles(
        Array.isArray(product.talles) && product.talles.length > 0
          ? product.talles.filter((t) => typeof t === 'string')
          : ['S', 'M', 'L', 'XL']
      );

      // Limpiar y asegurar que imagenes sea siempre array de strings válidas
      const rawImgs = Array.isArray(product.imagenes_url)
        ? product.imagenes_url.filter((u): u is string => typeof u === 'string' && Boolean(u.trim()))
        : [];
      setImagenes(rawImgs.length > 0 ? rawImgs : ['']);

      const rawImgPrincipal =
        (typeof product.imagen_principal === 'string' && product.imagen_principal.trim()) ||
        rawImgs[0] ||
        '';
      setImagenPrincipal(rawImgPrincipal);

      // Limpiar y asegurar que colores sea siempre array de ColorItemState válidos
      const rawColors: ColorItemState[] =
        Array.isArray(product.colores) && product.colores.length > 0
          ? product.colores
              .filter((c): c is ColorVariant => Boolean(c && typeof c === 'object'))
              .map((c) => ({
                name: (c.name || '').trim(),
                titulo: (c.titulo || '').trim(),
                hex: c.hex || '#161616',
                imagenes:
                  Array.isArray(c.imagenes) && c.imagenes.length > 0
                    ? c.imagenes.filter((u): u is string => typeof u === 'string' && Boolean(u.trim()))
                    : [''],
              }))
          : [];
      setColores(rawColors);

      const rawColorPrincipal =
        (typeof product.color_principal === 'string' && product.color_principal.trim()) ||
        rawColors[0]?.name ||
        '';
      setColorPrincipal(rawColorPrincipal);
    } else {
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setPrecioAnterior('');
      setSelectedSubcategoriasIds([]);
      setSelectedCategoriasIds([]);
      setTipoOfertaId('');
      setDestacado(false);
      setStock(15);
      setTalles(['S', 'M', 'L', 'XL']);
      setPermiteCuotas(true);
      setPermiteTransferencia(true);
      setImagenes(['']);
      setImagenPrincipal('');
      setColorPrincipal('');
      setColores([]);
    }
    setError(null);
  }, [product, subcategorias, categorias, isOpen]);

  // Lista unificada de todas las URLs disponibles con origen amigable
  const allAvailablePhotos = React.useMemo(() => {
    const list: { url: string; label: string }[] = [];
    (imagenes || []).forEach((u, i) => {
      const clean = (typeof u === 'string' ? u : '').trim();
      if (clean && !list.some((item) => item.url === clean)) {
        list.push({ url: clean, label: `Foto General #${i + 1}` });
      }
    });
    (colores || []).forEach((c) => {
      const cName = (c?.name || 'Color').trim();
      (c?.imagenes || []).forEach((u, i) => {
        const clean = (typeof u === 'string' ? u : '').trim();
        if (clean && !list.some((item) => item.url === clean)) {
          list.push({ url: clean, label: `${cName} (Foto #${i + 1})` });
        }
      });
    });
    return list;
  }, [imagenes, colores]);

  const effectivePreviewMainImage = React.useMemo(() => {
    const mainImgClean = (typeof imagenPrincipal === 'string' ? imagenPrincipal : '').trim();
    if (mainImgClean) return mainImgClean;
    if (allAvailablePhotos.length > 0) return allAvailablePhotos[0].url;
    const firstGeneral = (imagenes || []).find((u) => typeof u === 'string' && u.trim());
    if (firstGeneral) return firstGeneral.trim();
    for (const c of colores || []) {
      const firstColorPhoto = (c?.imagenes || []).find((u) => typeof u === 'string' && u.trim());
      if (firstColorPhoto) return firstColorPhoto.trim();
    }
    return '';
  }, [imagenPrincipal, allAvailablePhotos, imagenes, colores]);

  // Manejo de Talles
  const toggleTalle = (sizeName: string) => {
    if (talles.includes(sizeName)) {
      if (talles.length === 1) {
        alert('Debe quedar al menos 1 talle disponible para la prenda.');
        return;
      }
      setTalles(talles.filter((s) => s !== sizeName));
    } else {
      setTalles([...talles, sizeName]);
    }
  };

  const handleAddCustomTalle = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customTalle.trim().toUpperCase();
    if (!clean) return;
    if (!talles.includes(clean)) {
      setTalles([...talles, clean]);
    }
    setCustomTalle('');
  };

  // Manejo de Fotos Generales
  const handleAddGeneralImage = () => {
    setImagenes([...imagenes, '']);
  };

  const handleRemoveGeneralImage = (index: number) => {
    const removedUrl = (imagenes[index] || '').trim();
    const updated = imagenes.filter((_, idx) => idx !== index);
    setImagenes(updated.length > 0 ? updated : ['']);
    if (imagenPrincipal && removedUrl && (imagenPrincipal || '').trim() === removedUrl) {
      setImagenPrincipal(updated[0]?.trim() || '');
    }
  };

  const handleGeneralImageChange = (index: number, val: string) => {
    const safeVal = typeof val === 'string' ? val : '';
    const oldVal = (imagenes[index] || '').trim();
    const updated = [...imagenes];
    updated[index] = safeVal;
    setImagenes(updated);
    if (imagenPrincipal && oldVal && (imagenPrincipal || '').trim() === oldVal) {
      setImagenPrincipal(safeVal.trim());
    } else if (!imagenPrincipal && safeVal.trim()) {
      setImagenPrincipal(safeVal.trim());
    }
  };

  // Manejo de Colores
  const handleAddPresetColor = (preset: { name: string; hex: string }) => {
    const pName = (preset.name || '').trim();
    const exists = colores.some((c) => (c?.name || '').trim().toLowerCase() === pName.toLowerCase());
    if (exists) return;
    const newColores = [...colores, { name: pName, titulo: '', hex: preset.hex || '#161616', imagenes: [''] }];
    setColores(newColores);
    if (!colorPrincipal) {
      setColorPrincipal(pName);
    }
  };

  const handleAddCustomColor = () => {
    const newColores = [...colores, { name: 'Nuevo Color', titulo: '', hex: '#222222', imagenes: [''] }];
    setColores(newColores);
    if (!colorPrincipal) {
      setColorPrincipal('Nuevo Color');
    }
  };

  const handleRemoveColor = (index: number) => {
    const removedColor = colores[index];
    const filtered = colores.filter((_, idx) => idx !== index);
    setColores(filtered);
    const removedName = (removedColor?.name || '').trim().toLowerCase();
    const currentMain = (colorPrincipal || '').trim().toLowerCase();
    if (currentMain && removedName && currentMain === removedName) {
      setColorPrincipal(filtered[0]?.name || '');
    }
  };

  const handleColorChange = (index: number, field: 'name' | 'titulo' | 'hex', val: string) => {
    const safeVal = typeof val === 'string' ? val : '';
    const oldName = (colores[index]?.name || '').trim().toLowerCase();
    const updated = [...colores];
    updated[index] = { ...updated[index], [field]: safeVal };
    setColores(updated);
    const currentMain = (colorPrincipal || '').trim().toLowerCase();
    if (field === 'name' && currentMain && currentMain === oldName) {
      setColorPrincipal(safeVal.trim());
    }
  };

  // Fotos específicas de un Color
  const handleAddColorPhoto = (colorIndex: number) => {
    const updated = [...colores];
    if (updated[colorIndex]) {
      updated[colorIndex].imagenes = [...(updated[colorIndex].imagenes || []), ''];
      setColores(updated);
    }
  };

  const handleRemoveColorPhoto = (colorIndex: number, photoIndex: number) => {
    const updated = [...colores];
    if (updated[colorIndex]) {
      const filtered = (updated[colorIndex].imagenes || []).filter((_, idx) => idx !== photoIndex);
      updated[colorIndex].imagenes = filtered.length > 0 ? filtered : [''];
      setColores(updated);
    }
  };

  const handleColorPhotoChange = (colorIndex: number, photoIndex: number, val: string) => {
    const safeVal = typeof val === 'string' ? val : '';
    const updated = [...colores];
    if (updated[colorIndex]) {
      const imgs = [...(updated[colorIndex].imagenes || [])];
      imgs[photoIndex] = safeVal;
      updated[colorIndex].imagenes = imgs;
      setColores(updated);
    }
  };

  // Manejo de Multiselección de Categorías y Subcategorías
  const toggleSubcategoria = (subId: string) => {
    setSelectedSubcategoriasIds((prev) => {
      if (prev.includes(subId)) {
        return prev.filter((id) => id !== subId);
      } else {
        const sub = subcategorias.find((s) => s.id === subId);
        if (sub) {
          const subCatIds = Array.from(new Set([sub.categoria_id, ...(sub.categorias_ids || [])].filter(Boolean)));
          setSelectedCategoriasIds((catsPrev) => {
            const nextCats = [...catsPrev];
            subCatIds.forEach((cid) => {
              if (!nextCats.includes(cid)) nextCats.push(cid);
            });
            return nextCats;
          });
        }
        return [...prev, subId];
      }
    });
  };

  const toggleCategoria = (catId: string) => {
    setSelectedCategoriasIds((prev) => {
      if (prev.includes(catId)) {
        const remainingCats = prev.filter((id) => id !== catId);
        // Desmarcar también subcategorías que dependían exclusivamente de esta categoría
        setSelectedSubcategoriasIds((subPrev) =>
          subPrev.filter((sid) => {
            const sub = subcategorias.find((s) => s.id === sid);
            if (!sub) return true;
            const subAllCats = [sub.categoria_id, ...(sub.categorias_ids || [])].filter(Boolean);
            return subAllCats.some((cid) => remainingCats.includes(cid));
          })
        );
        return remainingCats;
      } else {
        return [...prev, catId];
      }
    });
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
    if (talles.length === 0) {
      setError('Seleccioná al menos un talle disponible para el producto.');
      return;
    }
    if (selectedSubcategoriasIds.length === 0 && selectedCategoriasIds.length === 0) {
      setError('Por favor asigná al menos una categoría o subcategoría para la prenda.');
      return;
    }

    const cleanGeneralUrls = (imagenes || [])
      .map((u) => (typeof u === 'string' ? u.trim() : ''))
      .filter(Boolean);

    const cleanColores: ColorVariant[] = (colores || [])
      .filter((c) => Boolean(c && (c.name || '').trim()))
      .map((c) => ({
        name: c.name.trim(),
        titulo: c.titulo?.trim() || undefined,
        hex: c.hex?.trim() || '#161616',
        imagenes: (c.imagenes || [])
          .map((u) => (typeof u === 'string' ? u.trim() : ''))
          .filter(Boolean),
      }));

    // Priorizar el color_principal al inicio de cleanColores
    const effectiveColorPrincipal = (colorPrincipal || '').trim() || cleanColores[0]?.name || '';
    if (effectiveColorPrincipal && cleanColores.length > 1) {
      const cIdx = cleanColores.findIndex(
        (c) => (c?.name || '').trim().toLowerCase() === effectiveColorPrincipal.toLowerCase()
      );
      if (cIdx > 0) {
        const [matched] = cleanColores.splice(cIdx, 1);
        cleanColores.unshift(matched);
      }
    }

    // Reunir todas las fotos
    const allCollectedUrls = [...cleanGeneralUrls];
    cleanColores.forEach((c) => {
      (c.imagenes || []).forEach((u) => {
        if (u && !allCollectedUrls.includes(u)) {
          allCollectedUrls.push(u);
        }
      });
    });

    // Priorizar la imagen_principal al inicio de la lista general
    const effectiveMainImage = (imagenPrincipal || '').trim() || allCollectedUrls[0] || '';
    if (effectiveMainImage) {
      const existingIdx = allCollectedUrls.indexOf(effectiveMainImage);
      if (existingIdx > 0) {
        allCollectedUrls.splice(existingIdx, 1);
        allCollectedUrls.unshift(effectiveMainImage);
      } else if (existingIdx === -1) {
        allCollectedUrls.unshift(effectiveMainImage);
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        precio: Number(precio),
        precio_anterior: precioAnterior ? Number(precioAnterior) : null,
        subcategoria_id: selectedSubcategoriasIds[0] || null,
        subcategorias_ids: selectedSubcategoriasIds,
        categorias_ids: selectedCategoriasIds,
        tipo_oferta_id: tipoOfertaId || null,
        imagenes_url: allCollectedUrls,
        imagen_principal: effectiveMainImage || null,
        color_principal: effectiveColorPrincipal || null,
        colores: cleanColores,
        talles,
        permite_cuotas: permiteCuotas,
        permite_transferencia_descuento: permiteTransferencia,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-beige-300 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-beige-200 bg-beige-50">
          <div>
            <h3 className="font-montserrat font-black text-lg text-navy uppercase">
              {product ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h3>
            <p className="text-xs text-navy/60 font-light">
              Los cambios se sincronizan en tiempo real con Supabase y la tienda online.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-navy/50 hover:text-navy rounded-lg hover:bg-beige-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Nombre */}
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
              className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy font-medium"
            />
          </div>

          {/* 2. Descripción */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                Descripción del producto
              </label>
              <span className="text-[10px] text-navy/50 font-light">
                Aparece en la página del producto al entrar a la prenda
              </span>
            </div>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Pieza confeccionada en frisa pesada de algodón peinado 380g. Silueta oversized unisex con costuras dobles reforzadas y teñido reactivo antipilling."
              className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg p-3 text-navy focus:outline-none focus:border-navy resize-y leading-relaxed"
            />
          </div>

          {/* 3. Precios & Stock */}
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
                className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy font-semibold"
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

          {/* 4. Opciones de Promociones de Pago (Casillas activables) */}
          <div className="p-3.5 bg-beige-50/80 rounded-xl border border-beige-200 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-navy block">
              Promociones y Facilidades de Pago en Web
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start space-x-2.5 cursor-pointer select-none p-2.5 rounded-lg bg-white border border-beige-300/80 hover:border-navy transition-colors">
                <input
                  type="checkbox"
                  checked={permiteCuotas}
                  onChange={(e) => setPermiteCuotas(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-navy focus:ring-navy border-beige-300 cursor-pointer"
                />
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-navy">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>3 Cuotas fijas sin interés</span>
                  </div>
                  <span className="text-[10px] text-navy/60 font-light block mt-0.5">
                    {permiteCuotas ? 'Visible en la ficha del producto' : 'Oculto (no se muestra en la web)'}
                  </span>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 cursor-pointer select-none p-2.5 rounded-lg bg-white border border-beige-300/80 hover:border-navy transition-colors">
                <input
                  type="checkbox"
                  checked={permiteTransferencia}
                  onChange={(e) => setPermiteTransferencia(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-navy focus:ring-navy border-beige-300 cursor-pointer"
                />
                <div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-navy">
                    <Percent className="w-3.5 h-3.5" />
                    <span>10% OFF en transferencia</span>
                  </div>
                  <span className="text-[10px] text-navy/60 font-light block mt-0.5">
                    {permiteTransferencia ? 'Visible en la ficha del producto' : 'Oculto (no se muestra en la web)'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* 5. Talles Disponibles */}
          <div className="p-3.5 bg-beige-50/80 rounded-xl border border-beige-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Talles Disponibles para esta Prenda *
                </label>
                <p className="text-[11px] text-navy/60 font-light">
                  Hacé clic para marcar o desmarcar qué talles figuran en la tienda.
                </p>
              </div>
              <div className="flex space-x-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTalles(['S', 'M', 'L', 'XL'])}
                  className="px-2 py-0.5 bg-white border border-beige-300 rounded text-navy/70 hover:text-navy hover:border-navy transition-colors cursor-pointer"
                >
                  S-XL estándar
                </button>
              </div>
            </div>

            {/* Chips de talles */}
            <div className="flex items-center flex-wrap gap-2 pt-1">
              {STANDARD_SIZES.map((size) => {
                const isSelected = talles.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleTalle(size)}
                    className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-navy text-white shadow-xs'
                        : 'bg-white text-navy/70 border border-beige-300 hover:border-navy hover:text-navy'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{size}</span>
                  </button>
                );
              })}

              {/* Talles personalizados agregados */}
              {talles
                .filter((s) => !STANDARD_SIZES.includes(s))
                .map((custom) => (
                  <button
                    key={custom}
                    type="button"
                    onClick={() => toggleTalle(custom)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold bg-navy text-white shadow-xs cursor-pointer"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>{custom}</span>
                    <X className="w-3 h-3 ml-1 opacity-70 hover:opacity-100" />
                  </button>
                ))}
            </div>

            {/* Agregar talle adicional */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                value={customTalle}
                onChange={(e) => setCustomTalle(e.target.value)}
                placeholder="Otro talle (ej: 28, 30, XS)..."
                className="text-xs bg-white border border-beige-300 rounded-lg px-3 py-1.5 text-navy focus:outline-none focus:border-navy max-w-[180px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTalle(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomTalle}
                className="px-3 py-1.5 bg-beige-200 hover:bg-beige-300 text-navy font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                + Agregar talle
              </button>
            </div>
          </div>

          {/* 6. Categorías y Subcategorías Asignadas (Multiselección) */}
          <div className="p-4 bg-beige-50/80 rounded-xl border border-beige-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-navy" />
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                    Categorías y Subcategorías Asignadas *
                  </label>
                </div>
                <p className="text-[11px] text-navy/60 font-light mt-0.5">
                  Podés asignar la prenda a más de una categoría o subcategoría para que aparezca en todas ellas en la tienda y menús.
                </p>
              </div>

              {/* Conteo activo */}
              <div className="flex items-center space-x-2 text-[11px] text-navy/70">
                <span className="px-2 py-0.5 bg-white border border-beige-300 rounded font-semibold">
                  {selectedCategoriasIds.length} categoría(s)
                </span>
                <span className="px-2 py-0.5 bg-white border border-beige-300 rounded font-semibold">
                  {selectedSubcategoriasIds.length} subcat(s)
                </span>
              </div>
            </div>

            {/* Badges de Asignaciones Actuales (con opción de remover) */}
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-white rounded-lg border border-beige-300 min-h-[42px]">
              {selectedCategoriasIds.length === 0 && selectedSubcategoriasIds.length === 0 ? (
                <span className="text-[11px] text-navy/40 italic">
                  Ninguna categoría ni subcategoría seleccionada aún.
                </span>
              ) : (
                <>
                  {/* Badges de Categorías */}
                  {selectedCategoriasIds.map((catId) => {
                    const c = categorias.find((cat) => cat.id === catId);
                    return (
                      <span
                        key={`cat-badge-${catId}`}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-navy text-white shadow-2xs"
                      >
                        <span className="text-[9px] uppercase tracking-wider text-beige-300 font-normal">
                          Cat:
                        </span>
                        <span>{c?.nombre || 'Categoría'}</span>
                        <button
                          type="button"
                          onClick={() => toggleCategoria(catId)}
                          className="hover:text-red-300 transition-colors cursor-pointer ml-0.5"
                          title="Quitar categoría"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}

                  {/* Badges de Subcategorías */}
                  {selectedSubcategoriasIds.map((subId) => {
                    const s = subcategorias.find((sub) => sub.id === subId);
                    return (
                      <span
                        key={`sub-badge-${subId}`}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-beige-200 text-navy border border-beige-300"
                      >
                        <span className="text-[9px] uppercase tracking-wider text-navy/60 font-normal">
                          Sub:
                        </span>
                        <span>{s?.nombre || 'Subcategoría'}</span>
                        <button
                          type="button"
                          onClick={() => toggleSubcategoria(subId)}
                          className="hover:text-red-600 transition-colors cursor-pointer ml-0.5"
                          title="Quitar subcategoría"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </>
              )}
            </div>

            {/* Listado de Categorías y sus Subcategorías para seleccionar */}
            <div className="space-y-3 pt-1">
              {(categorias || []).map((cat) => {
                const isCatSelected = selectedCategoriasIds.includes(cat.id);
                const subsOfCat = (subcategorias || []).filter(
                  (s) => s.categoria_id === cat.id || s.categorias_ids?.includes(cat.id)
                );

                return (
                  <div
                    key={cat.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isCatSelected
                        ? 'bg-white border-navy/50 shadow-xs'
                        : 'bg-white/70 border-beige-300 hover:border-beige-400'
                    }`}
                  >
                    {/* Header de Categoría con Checkbox de Categoría Entera */}
                    <div className="flex items-center justify-between pb-2 border-b border-beige-200">
                      <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isCatSelected}
                          onChange={() => toggleCategoria(cat.id)}
                          className="w-4 h-4 rounded text-navy focus:ring-navy border-beige-300 cursor-pointer"
                        />
                        <span className="text-xs font-montserrat font-bold text-navy uppercase tracking-wide">
                          Categoría: {cat.nombre}
                        </span>
                      </label>
                      <span className="text-[10px] text-navy/50">
                        {isCatSelected ? 'Categoría entera activa' : 'Clic para asignar categoría entera'}
                      </span>
                    </div>

                    {/* Subcategorías de esta categoría */}
                    {subsOfCat.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-navy/60 block mb-1.5">
                          Subcategorías de {cat.nombre}:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {subsOfCat.map((sub) => {
                            const isSubSelected = selectedSubcategoriasIds.includes(sub.id);
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => toggleSubcategoria(sub.id)}
                                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                  isSubSelected
                                    ? 'bg-navy text-white border-navy font-bold shadow-2xs'
                                    : 'bg-beige-50 text-navy/80 border-beige-300 hover:bg-beige-100 hover:border-navy/40'
                                }`}
                              >
                                {isSubSelected ? (
                                  <Check className="w-3 h-3 stroke-[3]" />
                                ) : (
                                  <Plus className="w-3 h-3 text-navy/40" />
                                )}
                                <span>{sub.nombre}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tipo de Oferta / Badge */}
            <div className="pt-3 border-t border-beige-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                Tipo de Oferta / Badge (Opcional)
              </label>
              <select
                value={tipoOfertaId}
                onChange={(e) => setTipoOfertaId(e.target.value)}
                className="w-full sm:w-1/2 text-xs bg-white border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
              >
                <option value="">-- Sin oferta especial --</option>
                {(tiposOferta || []).map((to) => (
                  <option key={to.id} value={to.id}>
                    {to.nombre} ({to.etiqueta_badge})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 7. Destacado */}
          <div className="flex items-center space-x-3 p-3 bg-beige-50 rounded-xl border border-beige-200">
            <input
              type="checkbox"
              id="destacado"
              checked={destacado}
              onChange={(e) => setDestacado(e.target.checked)}
              className="w-4 h-4 rounded text-navy focus:ring-navy border-beige-300 cursor-pointer"
            />
            <label htmlFor="destacado" className="text-xs font-semibold text-navy cursor-pointer select-none">
              Marcar como <strong>Producto Destacado</strong> (solo los productos marcados aquí figuran en la sección de Destacados de la Home)
            </label>
          </div>

          {/* 8. IMAGEN PRINCIPAL EN LA GRILLA DE PRODUCTOS */}
          <div className="pt-4 border-t border-beige-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                    Imagen Principal en la Grilla de Productos *
                  </label>
                </div>
                <p className="text-[11px] text-navy/60 font-light mt-0.5">
                  Esta foto es la portada que verán los clientes en la grilla del catálogo, tienda y página de inicio. Podés seleccionarla con un clic de cualquier foto cargada abajo o elegirla del menú.
                </p>
              </div>
            </div>

            <div className="p-4 bg-beige-50/80 rounded-xl border border-beige-300 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-16 h-20 rounded-xl bg-white border border-beige-300 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-xs">
                  {effectivePreviewMainImage ? (
                    <img
                      src={effectivePreviewMainImage}
                      alt="Portada de grilla"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-navy/30" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-navy text-white">
                    <Star className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                    <span>Portada Activa en Catálogo</span>
                  </span>
                  <p className="text-xs font-montserrat font-bold text-navy truncate max-w-xs sm:max-w-md">
                    {effectivePreviewMainImage
                      ? allAvailablePhotos.find((p) => p.url === effectivePreviewMainImage)?.label || 'URL fijada'
                      : 'Sin foto asignada aún'}
                  </p>
                  <p className="text-[10px] text-navy/50 font-mono truncate max-w-xs sm:max-w-md">
                    {effectivePreviewMainImage || 'Cargá fotos en las secciones de abajo para elegir la portada.'}
                  </p>
                </div>
              </div>

              {allAvailablePhotos.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-navy/70 whitespace-nowrap">
                    Cambiar portada:
                  </span>
                  <select
                    value={imagenPrincipal}
                    onChange={(e) => setImagenPrincipal(e.target.value)}
                    className="text-xs bg-white border border-beige-300 rounded-lg px-3 py-2 text-navy font-semibold focus:outline-none focus:border-navy max-w-xs cursor-pointer shadow-2xs"
                  >
                    <option value="">-- Primera foto disponible --</option>
                    {allAvailablePhotos.map((photo, pIdx) => (
                      <option key={pIdx} value={photo.url}>
                        {photo.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 9. VARIEDAD DE COLORES & FOTOS POR COLOR */}
          <div className="pt-4 border-t border-beige-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-navy" />
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                    Variedad de Colores y Fotos Específicas
                  </label>
                </div>
                <p className="text-[11px] text-navy/60 font-light mt-0.5">
                  Definí los colores de la prenda. Podés marcar cuál color aparece seleccionado primero por defecto.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCustomColor}
                className="inline-flex items-center space-x-1 text-xs font-bold text-navy hover:text-navy-500 bg-beige-100 hover:bg-beige-200 px-3 py-1.5 rounded-lg border border-beige-300 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Color personalizado</span>
              </button>
            </div>

            {/* Presets de colores rápidos */}
            <div className="flex items-center flex-wrap gap-1.5 p-2 bg-beige-50/70 rounded-xl border border-beige-200">
              <span className="text-[10px] uppercase font-bold text-navy/60 mr-1">
                Colores frecuentes:
              </span>
              {PRESET_COLORS.map((p) => {
                const pName = (p?.name || '').trim();
                const isSelected = (colores || []).some(
                  (c) => (c?.name || '').trim().toLowerCase() === pName.toLowerCase()
                );
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleAddPresetColor(p)}
                    disabled={isSelected}
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                      isSelected
                        ? 'opacity-40 bg-white border-beige-300 text-navy cursor-not-allowed'
                        : 'bg-white hover:bg-beige-200 border-beige-300 text-navy cursor-pointer hover:border-navy'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/20"
                      style={{ backgroundColor: p.hex }}
                    />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Selector de Color que aparece primero por defecto */}
            {colores.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-beige-50 rounded-xl border border-beige-300 gap-2 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-montserrat font-bold text-navy uppercase tracking-wide">
                      Color que aparece primero por defecto:
                    </span>
                    <p className="text-[11px] text-navy/60 font-light">
                      Este color vendrá seleccionado de entrada en la grilla y cuando el cliente abra la prenda.
                    </p>
                  </div>
                </div>
                <select
                  value={colorPrincipal}
                  onChange={(e) => setColorPrincipal(e.target.value)}
                  className="text-xs bg-white border border-beige-300 rounded-lg px-3 py-2 text-navy font-bold focus:outline-none focus:border-navy cursor-pointer"
                >
                  {(colores || [])
                    .filter((c) => Boolean(c && (c.name || '').trim()))
                    .map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} {c.titulo ? `(${c.titulo})` : ''}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Lista de Colores Configurados */}
            {colores.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-beige-300 text-center text-xs text-navy/50 font-light">
                No definiste colores específicos todavía. Hacé clic en uno de los colores frecuentes arriba o en "+ Color personalizado".
              </div>
            ) : (
              <div className="space-y-4">
                {(colores || []).map((colorItem, cIdx) => {
                  const colorName = (colorItem?.name || '').trim();
                  const currentMain = (colorPrincipal || '').trim();
                  const isMainColor =
                    (Boolean(currentMain) && currentMain.toLowerCase() === colorName.toLowerCase()) ||
                    (!currentMain && cIdx === 0);
                  const colorPhotos = Array.isArray(colorItem?.imagenes) ? colorItem.imagenes : [''];

                  return (
                    <div
                      key={cIdx}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        isMainColor
                          ? 'border-navy bg-white shadow-xs'
                          : 'border-beige-300 bg-beige-50/50'
                      }`}
                    >
                      {/* Header de este color */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-2 flex-1">
                          {/* Selector nativo de color */}
                          <div className="relative">
                            <input
                              type="color"
                              value={colorItem.hex}
                              onChange={(e) => handleColorChange(cIdx, 'hex', e.target.value)}
                              className="w-8 h-8 rounded-lg border border-beige-300 cursor-pointer overflow-hidden p-0"
                              title="Elegir tono"
                            />
                          </div>

                          {/* Nombre del color */}
                          <input
                            type="text"
                            value={colorItem.name}
                            onChange={(e) => handleColorChange(cIdx, 'name', e.target.value)}
                            placeholder="Color (ej: Negro)"
                            className="w-32 sm:w-36 text-xs bg-white border border-beige-300 rounded-lg px-2.5 py-1.5 text-navy font-semibold focus:outline-none focus:border-navy"
                          />

                          {/* Título en la tienda para este color */}
                          <input
                            type="text"
                            value={colorItem.titulo || ''}
                            onChange={(e) => handleColorChange(cIdx, 'titulo', e.target.value)}
                            placeholder={`Título en la web (ej: Conjunto Veelvet ${colorItem.name || ''})`}
                            title="Título exclusivo para este color en el catálogo y ficha"
                            className="flex-1 text-xs bg-white border border-beige-300 rounded-lg px-2.5 py-1.5 text-navy focus:outline-none focus:border-navy"
                          />

                          {/* Código HEX */}
                          <input
                            type="text"
                            value={colorItem.hex}
                            onChange={(e) => handleColorChange(cIdx, 'hex', e.target.value)}
                            placeholder="#161616"
                            className="w-16 sm:w-20 text-xs font-mono bg-white border border-beige-300 rounded-lg px-2 py-1.5 text-navy focus:outline-none focus:border-navy"
                          />

                          {/* Botón / Badge Color Principal */}
                          {isMainColor ? (
                            <span
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-navy text-white shadow-2xs flex-shrink-0"
                              title="Este color aparece primero por defecto"
                            >
                              <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                              <span className="hidden sm:inline">Color Primero</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setColorPrincipal(colorItem.name)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-white text-navy/70 border border-beige-300 hover:border-navy hover:text-navy transition-colors cursor-pointer flex-shrink-0"
                              title="Hacer que este color aparezca primero por defecto"
                            >
                              <Star className="w-3 h-3 text-navy/30" />
                              <span className="hidden sm:inline">Poner primero</span>
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveColor(cIdx)}
                          className="p-1.5 text-navy/40 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar este color"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* URLs de fotos para este color */}
                      <div className="pl-4 border-l-2 border-beige-300 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-navy/70">
                            Fotos de la prenda en color {colorItem.name || 'este tono'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddColorPhoto(cIdx)}
                            className="text-[11px] font-bold text-navy hover:text-navy-500 inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Agregar foto a este color</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {colorPhotos.map((url, pIdx) => {
                            const cleanUrl = (typeof url === 'string' ? url : '').trim();
                            const currentMainImg = (imagenPrincipal || '').trim();
                            const isThisPhotoMain =
                              Boolean(cleanUrl) &&
                              (cleanUrl === currentMainImg ||
                                (!currentMainImg && effectivePreviewMainImage === cleanUrl));

                            return (
                              <div key={pIdx} className="flex items-center space-x-2">
                                {/* Thumbnail preview */}
                                <div className="w-9 h-9 rounded-lg bg-white border border-beige-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {cleanUrl ? (
                                    <img
                                      src={cleanUrl}
                                      alt="Preview color"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <ImageIcon className="w-3.5 h-3.5 text-navy/30" />
                                  )}
                                </div>

                                {/* Input URL */}
                                <input
                                  type="url"
                                  value={url || ''}
                                  onChange={(e) => handleColorPhotoChange(cIdx, pIdx, e.target.value)}
                                  placeholder={`https://pub-xxxx.r2.dev/${(colorName || 'color').toLowerCase().replace(/\s+/g, '-')}-${pIdx + 1}.jpg`}
                                  className="flex-1 text-xs bg-white border border-beige-300 rounded-lg px-3 py-1.5 text-navy focus:outline-none focus:border-navy"
                                />

                                {/* Botón marcar portada de grilla */}
                                {cleanUrl && (
                                  isThisPhotoMain ? (
                                    <span
                                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-navy text-white flex-shrink-0 shadow-2xs"
                                      title="Esta foto es la portada principal de la grilla de productos"
                                    >
                                      <Star className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                                      <span className="hidden sm:inline">Portada Grilla</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setImagenPrincipal(cleanUrl)}
                                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-navy/70 hover:text-navy bg-white border border-beige-300 hover:border-navy transition-colors cursor-pointer flex-shrink-0"
                                      title="Usar esta foto como la portada principal en la grilla de productos"
                                    >
                                      Hacer portada
                                    </button>
                                  )
                                )}

                                {/* Botón borrar foto de este color */}
                                {colorPhotos.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveColorPhoto(cIdx, pIdx)}
                                    className="p-1.5 text-navy/40 hover:text-red-600 transition-colors cursor-pointer"
                                    title="Eliminar URL"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 10. FOTOS GENERALES / LOOKBOOK (OPCIONAL) */}
          <div className="pt-4 border-t border-beige-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Fotos Generales o Lookbook Adicionales (Opcional)
                </label>
                <p className="text-[11px] text-navy/60 font-light">
                  Podés agregar más URLs de fotos si querés imágenes de catálogo adicionales.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddGeneralImage}
                className="inline-flex items-center space-x-1 text-xs font-bold text-navy hover:text-navy-500 bg-beige-100 hover:bg-beige-200 px-2.5 py-1.5 rounded-lg border border-beige-300 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar foto</span>
              </button>
            </div>

            <div className="space-y-2.5 mt-2">
              {(imagenes || []).map((url, idx) => {
                const cleanUrl = (typeof url === 'string' ? url : '').trim();
                const currentMainImg = (imagenPrincipal || '').trim();
                const isThisPhotoMain =
                  Boolean(cleanUrl) &&
                  (cleanUrl === currentMainImg ||
                    (!currentMainImg && effectivePreviewMainImage === cleanUrl));

                return (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-lg bg-beige-100 border border-beige-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {cleanUrl ? (
                        <img
                          src={cleanUrl}
                          alt="Preview general"
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
                      value={url || ''}
                      onChange={(e) => handleGeneralImageChange(idx, e.target.value)}
                      placeholder={`https://pub-xxxx.r2.dev/lookbook-${idx + 1}.jpg`}
                      className="flex-1 text-xs bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy focus:outline-none focus:border-navy"
                    />

                    {/* Botón marcar portada de grilla */}
                    {cleanUrl && (
                      isThisPhotoMain ? (
                        <span
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-navy text-white flex-shrink-0 shadow-2xs"
                          title="Esta foto es la portada principal de la grilla de productos"
                        >
                          <Star className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                          <span className="hidden sm:inline">Portada Grilla</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setImagenPrincipal(cleanUrl)}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-navy/70 hover:text-navy bg-white border border-beige-300 hover:border-navy transition-colors cursor-pointer flex-shrink-0"
                          title="Usar esta foto como la portada principal en la grilla de productos"
                        >
                          Hacer portada
                        </button>
                      )
                    )}

                    {(imagenes || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGeneralImage(idx)}
                        className="p-2 text-navy/40 hover:text-red-600 transition-colors cursor-pointer"
                        title="Eliminar URL"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-beige-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-navy/70 hover:text-navy uppercase tracking-wider cursor-pointer"
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
