import { supabase, Categoria, Subcategoria, TipoOferta, Producto, ColorVariant, MenuLateralItem } from '../lib/supabase';
import { Product, PRODUCT_COLORS } from '../data/products';
import { MegaMenuConfig } from '../data/megaMenuData';

function parseRawProduct(raw: any): Producto {
  let urls: string[] = [];
  let descripcion: string = raw.descripcion || '';
  let colores: ColorVariant[] = Array.isArray(raw.colores) ? raw.colores : [];
  let talles: string[] = Array.isArray(raw.talles) ? raw.talles : [];
  let permite_cuotas: boolean = raw.permite_cuotas !== undefined ? Boolean(raw.permite_cuotas) : true;
  let permite_transferencia_descuento: boolean =
    raw.permite_transferencia_descuento !== undefined ? Boolean(raw.permite_transferencia_descuento) : true;
  let subcategorias_ids: string[] = Array.isArray(raw.subcategorias_ids) ? [...raw.subcategorias_ids] : [];
  let categorias_ids: string[] = Array.isArray(raw.categorias_ids) ? [...raw.categorias_ids] : [];

  if (Array.isArray(raw.imagenes_url)) {
    urls = raw.imagenes_url.filter(Boolean);
  } else if (raw.imagenes_url && typeof raw.imagenes_url === 'object') {
    if (Array.isArray(raw.imagenes_url.urls)) {
      urls = raw.imagenes_url.urls.filter(Boolean);
    }
    if (!descripcion && raw.imagenes_url.descripcion) {
      descripcion = raw.imagenes_url.descripcion;
    }
    if (colores.length === 0 && Array.isArray(raw.imagenes_url.colores)) {
      colores = raw.imagenes_url.colores;
    }
    if (talles.length === 0 && Array.isArray(raw.imagenes_url.talles)) {
      talles = raw.imagenes_url.talles;
    }
    if (raw.imagenes_url.permite_cuotas !== undefined) {
      permite_cuotas = Boolean(raw.imagenes_url.permite_cuotas);
    }
    if (raw.imagenes_url.permite_transferencia_descuento !== undefined) {
      permite_transferencia_descuento = Boolean(raw.imagenes_url.permite_transferencia_descuento);
    }
    if (Array.isArray(raw.imagenes_url.subcategorias_ids)) {
      subcategorias_ids = Array.from(new Set([...subcategorias_ids, ...raw.imagenes_url.subcategorias_ids]));
    }
    if (Array.isArray(raw.imagenes_url.categorias_ids)) {
      categorias_ids = Array.from(new Set([...categorias_ids, ...raw.imagenes_url.categorias_ids]));
    }
  }

  // Si tiene subcategoria_id pero no estaba en la lista, asegurar que esté
  if (raw.subcategoria_id && !subcategorias_ids.includes(raw.subcategoria_id)) {
    subcategorias_ids.push(raw.subcategoria_id);
  }
  // Si tiene categoría padre asociada y no estaba en la lista, asegurar que esté
  if (raw.subcategoria?.categoria_id && !categorias_ids.includes(raw.subcategoria.categoria_id)) {
    categorias_ids.push(raw.subcategoria.categoria_id);
  }
  // Si la subcategoría tiene múltiples categorías asociadas
  if (Array.isArray(raw.subcategoria?.categorias_ids)) {
    raw.subcategoria.categorias_ids.forEach((cid: string) => {
      if (cid && !categorias_ids.includes(cid)) categorias_ids.push(cid);
    });
  }

  return {
    ...raw,
    imagenes_url: urls,
    descripcion: descripcion || null,
    colores,
    talles: talles.length > 0 ? talles : ['S', 'M', 'L', 'XL'],
    permite_cuotas,
    permite_transferencia_descuento,
    subcategorias_ids,
    categorias_ids,
  };
}

export interface AppFeaturedConfig {
  featured_categories: string[];
  featured_subcategories: string[];
  category_images?: Record<string, string>;
  subcategory_images?: Record<string, string>;
  subcategory_categorias?: Record<string, string[]>; // id_subcategoria -> [id_cat1, id_cat2, ...]
  menu_lateral_subcategories?: MenuLateralItem[];
  menu_lateral_items?: MenuLateralItem[];
}

export const SupabaseService = {
  // ==========================================
  // Helper: Configuración Persistente en Supabase (Categorías, Subcategorías Destacadas, Imágenes y Menú Lateral)
  // ==========================================
  async getFeaturedConfig(): Promise<AppFeaturedConfig> {
    try {
      const { data } = await supabase
        .from('tipos_oferta')
        .select('etiqueta_badge')
        .eq('nombre', '__CONFIG_FEATURED__')
        .maybeSingle();

      if (data?.etiqueta_badge) {
        const parsed = JSON.parse(data.etiqueta_badge);
        return {
          featured_categories: Array.isArray(parsed.featured_categories) ? parsed.featured_categories : [],
          featured_subcategories: Array.isArray(parsed.featured_subcategories) ? parsed.featured_subcategories : [],
          category_images: typeof parsed.category_images === 'object' && parsed.category_images !== null ? parsed.category_images : {},
          subcategory_images: typeof parsed.subcategory_images === 'object' && parsed.subcategory_images !== null ? parsed.subcategory_images : {},
          subcategory_categorias: typeof parsed.subcategory_categorias === 'object' && parsed.subcategory_categorias !== null ? parsed.subcategory_categorias : {},
          menu_lateral_subcategories: Array.isArray(parsed.menu_lateral_subcategories) ? parsed.menu_lateral_subcategories : undefined,
          menu_lateral_items: Array.isArray(parsed.menu_lateral_items)
            ? parsed.menu_lateral_items
            : Array.isArray(parsed.menu_lateral_subcategories)
            ? parsed.menu_lateral_subcategories
            : undefined,
        };
      }
    } catch (err) {
      console.warn('Error al leer configuración de destacados desde Supabase:', err);
    }
    return { featured_categories: [], featured_subcategories: [], category_images: {}, subcategory_images: {}, subcategory_categorias: {} };
  },

  async saveFeaturedConfig(config: AppFeaturedConfig): Promise<void> {
    try {
      const { data: existing } = await supabase
        .from('tipos_oferta')
        .select('id')
        .eq('nombre', '__CONFIG_FEATURED__')
        .maybeSingle();

      const payload = {
        nombre: '__CONFIG_FEATURED__',
        etiqueta_badge: JSON.stringify(config),
        color_badge: '#000000',
      };

      if (existing?.id) {
        await supabase.from('tipos_oferta').update(payload).eq('id', existing.id);
      } else {
        await supabase.from('tipos_oferta').insert([payload]);
      }
    } catch (err) {
      console.error('Error al guardar configuración de destacados en Supabase:', err);
    }
  },

  // ==========================================
  // 1. Categorías
  // ==========================================
  async getCategorias(): Promise<Categoria[]> {
    const [{ data: cats, error }, featuredConfig] = await Promise.all([
      supabase.from('categorias').select('*').order('orden', { ascending: true }),
      this.getFeaturedConfig(),
    ]);

    if (error) {
      console.warn('Error fetching categorias de Supabase:', error.message);
      return [];
    }
    return (cats || []).map((c) => ({
      ...c,
      destacada: Boolean(c.destacada || featuredConfig.featured_categories.includes(c.id)),
      imagen_url: featuredConfig.category_images?.[c.id] || c.imagen_url || '',
    }));
  },

  async createCategoria(nombre: string, orden: number, destacada: boolean = false, imagen_url?: string): Promise<Categoria> {
    let res = await supabase
      .from('categorias')
      .insert([{ nombre, orden }])
      .select()
      .single();

    if (res.error) throw new Error(res.error.message);

    if (res.data?.id) {
      const config = await this.getFeaturedConfig();
      let changed = false;
      if (destacada) {
        if (!config.featured_categories.includes(res.data.id)) {
          config.featured_categories.push(res.data.id);
          changed = true;
        }
      }
      if (imagen_url?.trim()) {
        if (!config.category_images) config.category_images = {};
        config.category_images[res.data.id] = imagen_url.trim();
        changed = true;
      }
      if (changed) {
        await this.saveFeaturedConfig(config);
      }
    }
    return {
      ...res.data,
      destacada,
      imagen_url: imagen_url?.trim() || '',
    };
  },

  async updateCategoria(id: string, nombre: string, orden: number, destacada?: boolean, imagen_url?: string): Promise<Categoria> {
    const payload: any = { nombre, orden };
    let res = await supabase
      .from('categorias')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (res.error) throw new Error(res.error.message);

    const config = await this.getFeaturedConfig();
    let changed = false;

    if (typeof destacada === 'boolean') {
      if (destacada) {
        if (!config.featured_categories.includes(id)) config.featured_categories.push(id);
      } else {
        config.featured_categories = config.featured_categories.filter((cid) => cid !== id);
      }
      changed = true;
    }

    if (typeof imagen_url === 'string') {
      if (!config.category_images) config.category_images = {};
      config.category_images[id] = imagen_url.trim();
      changed = true;
    }

    if (changed) {
      await this.saveFeaturedConfig(config);
    }

    return {
      ...res.data,
      destacada: typeof destacada === 'boolean' ? destacada : config.featured_categories.includes(id),
      imagen_url: typeof imagen_url === 'string' ? imagen_url.trim() : (config.category_images?.[id] || ''),
    };
  },

  async updateCategoriaImagen(id: string, imagen_url: string): Promise<void> {
    const config = await this.getFeaturedConfig();
    if (!config.category_images) config.category_images = {};
    config.category_images[id] = imagen_url.trim();
    await this.saveFeaturedConfig(config);
  },

  async toggleCategoriaDestacada(id: string, currentState: boolean): Promise<Categoria> {
    const targetState = !currentState;
    const config = await this.getFeaturedConfig();
    if (targetState) {
      if (!config.featured_categories.includes(id)) {
        config.featured_categories.push(id);
      }
    } else {
      config.featured_categories = config.featured_categories.filter((cid) => cid !== id);
    }
    await this.saveFeaturedConfig(config);

    // Intento de actualizar columna nativa si existe en postgres (ignorar error si no existe)
    try {
      await supabase.from('categorias').update({ destacada: targetState }).eq('id', id);
    } catch (_) {}

    const { data } = await supabase.from('categorias').select('*').eq('id', id).single();
    return {
      ...(data || { id, nombre: '', orden: 1 }),
      destacada: targetState,
      imagen_url: config.category_images?.[id] || '',
    };
  },

  async deleteCategoria(id: string): Promise<void> {
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    if (error) throw new Error(error.message);

    // Limpiar de configuración si estaba
    const config = await this.getFeaturedConfig();
    let changed = false;
    if (config.featured_categories.includes(id)) {
      config.featured_categories = config.featured_categories.filter((cid) => cid !== id);
      changed = true;
    }
    if (config.category_images && config.category_images[id]) {
      delete config.category_images[id];
      changed = true;
    }
    if (config.subcategory_categorias) {
      for (const [subId, catList] of Object.entries(config.subcategory_categorias)) {
        if (catList.includes(id)) {
          config.subcategory_categorias[subId] = catList.filter((cid) => cid !== id);
          changed = true;
        }
      }
    }
    if (config.menu_lateral_subcategories) {
      const filtered = config.menu_lateral_subcategories.filter((item) => item.id !== id);
      if (filtered.length !== config.menu_lateral_subcategories.length) {
        config.menu_lateral_subcategories = filtered;
        config.menu_lateral_items = filtered;
        changed = true;
      }
    }
    if (changed) {
      await this.saveFeaturedConfig(config);
    }
  },

  // ==========================================
  // 2. Subcategorías
  // ==========================================
  async getSubcategorias(): Promise<Subcategoria[]> {
    const [{ data: subs, error }, featuredConfig, cats] = await Promise.all([
      supabase
        .from('subcategorias')
        .select('*, categoria:categorias(*)')
        .order('nombre', { ascending: true }),
      this.getFeaturedConfig(),
      this.getCategorias(),
    ]);

    if (error) {
      console.warn('Error fetching subcategorias de Supabase:', error.message);
      return [];
    }
    return (subs || []).map((s) => {
      const extraCatIds = featuredConfig.subcategory_categorias?.[s.id] || [];
      const allCatIds = Array.from(new Set([s.categoria_id, ...extraCatIds].filter(Boolean)));
      const resolvedCats = allCatIds
        .map((cid) => cats.find((c) => c.id === cid))
        .filter(Boolean) as Categoria[];

      return {
        ...s,
        destacada: Boolean(s.destacada || featuredConfig.featured_subcategories.includes(s.id)),
        imagen_url: featuredConfig.subcategory_images?.[s.id] || s.imagen_url || '',
        categorias_ids: allCatIds,
        categorias: resolvedCats,
      };
    });
  },

  async toggleSubcategoriaDestacada(id: string, currentState: boolean): Promise<Subcategoria> {
    const targetState = !currentState;
    const config = await this.getFeaturedConfig();
    if (targetState) {
      if (!config.featured_subcategories.includes(id)) {
        config.featured_subcategories.push(id);
      }
    } else {
      config.featured_subcategories = config.featured_subcategories.filter((sid) => sid !== id);
    }
    await this.saveFeaturedConfig(config);

    // Intento de actualizar columna nativa si existe en postgres
    try {
      await supabase.from('subcategorias').update({ destacada: targetState }).eq('id', id);
    } catch (_) {}

    const [cats, { data }] = await Promise.all([
      this.getCategorias(),
      supabase
        .from('subcategorias')
        .select('*, categoria:categorias(*)')
        .eq('id', id)
        .single(),
    ]);

    const extraCatIds = config.subcategory_categorias?.[id] || [];
    const allCatIds = Array.from(new Set([data?.categoria_id, ...extraCatIds].filter(Boolean)));
    const resolvedCats = allCatIds
      .map((cid) => cats.find((c) => c.id === cid))
      .filter(Boolean) as Categoria[];

    return {
      ...(data || { id, categoria_id: '', nombre: '', slug: '' }),
      destacada: targetState,
      imagen_url: config.subcategory_images?.[id] || '',
      categorias_ids: allCatIds,
      categorias: resolvedCats,
    };
  },

  async createSubcategoria(
    categoria_id: string,
    nombre: string,
    slug?: string,
    imagen_url?: string,
    categorias_ids?: string[]
  ): Promise<Subcategoria> {
    const computedSlug = slug?.trim() || nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const cleanCatIds = Array.isArray(categorias_ids) && categorias_ids.length > 0
      ? Array.from(new Set(categorias_ids.filter(Boolean)))
      : [categoria_id];
    const primaryCatId = cleanCatIds[0] || categoria_id;

    const { data, error } = await supabase
      .from('subcategorias')
      .insert([{ categoria_id: primaryCatId, nombre, slug: computedSlug }])
      .select('*, categoria:categorias(*)')
      .single();

    if (error) throw new Error(error.message);

    if (data?.id) {
      const config = await this.getFeaturedConfig();
      let changed = false;
      if (imagen_url?.trim()) {
        if (!config.subcategory_images) config.subcategory_images = {};
        config.subcategory_images[data.id] = imagen_url.trim();
        changed = true;
      }
      if (cleanCatIds.length > 0) {
        if (!config.subcategory_categorias) config.subcategory_categorias = {};
        config.subcategory_categorias[data.id] = cleanCatIds;
        changed = true;
      }
      if (changed) {
        await this.saveFeaturedConfig(config);
      }
    }

    const cats = await this.getCategorias();
    const resolvedCats = cleanCatIds
      .map((cid) => cats.find((c) => c.id === cid))
      .filter(Boolean) as Categoria[];

    return {
      ...data,
      imagen_url: imagen_url?.trim() || '',
      categorias_ids: cleanCatIds,
      categorias: resolvedCats,
    };
  },

  async updateSubcategoria(
    id: string,
    categoria_id: string,
    nombre: string,
    slug?: string,
    imagen_url?: string,
    categorias_ids?: string[]
  ): Promise<Subcategoria> {
    const computedSlug = slug?.trim() || nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const cleanCatIds = Array.isArray(categorias_ids) && categorias_ids.length > 0
      ? Array.from(new Set(categorias_ids.filter(Boolean)))
      : [categoria_id];
    const primaryCatId = cleanCatIds[0] || categoria_id;

    const { data, error } = await supabase
      .from('subcategorias')
      .update({ categoria_id: primaryCatId, nombre, slug: computedSlug })
      .eq('id', id)
      .select('*, categoria:categorias(*)')
      .single();

    if (error) throw new Error(error.message);

    const config = await this.getFeaturedConfig();
    let changed = false;

    if (typeof imagen_url === 'string') {
      if (!config.subcategory_images) config.subcategory_images = {};
      config.subcategory_images[id] = imagen_url.trim();
      changed = true;
    }

    if (!config.subcategory_categorias) config.subcategory_categorias = {};
    config.subcategory_categorias[id] = cleanCatIds;
    changed = true;

    if (changed) {
      await this.saveFeaturedConfig(config);
    }

    const cats = await this.getCategorias();
    const resolvedCats = cleanCatIds
      .map((cid) => cats.find((c) => c.id === cid))
      .filter(Boolean) as Categoria[];

    return {
      ...data,
      destacada: config.featured_subcategories.includes(id),
      imagen_url: typeof imagen_url === 'string' ? imagen_url.trim() : (config.subcategory_images?.[id] || ''),
      categorias_ids: cleanCatIds,
      categorias: resolvedCats,
    };
  },

  async updateSubcategoriaImagen(id: string, imagen_url: string): Promise<void> {
    const config = await this.getFeaturedConfig();
    if (!config.subcategory_images) config.subcategory_images = {};
    config.subcategory_images[id] = imagen_url.trim();
    await this.saveFeaturedConfig(config);
  },

  async deleteSubcategoria(id: string): Promise<void> {
    const { error } = await supabase.from('subcategorias').delete().eq('id', id);
    if (error) throw new Error(error.message);

    // Limpiar de configuración si estaba
    const config = await this.getFeaturedConfig();
    let changed = false;
    if (config.featured_subcategories.includes(id)) {
      config.featured_subcategories = config.featured_subcategories.filter((sid) => sid !== id);
      changed = true;
    }
    if (config.subcategory_images && config.subcategory_images[id]) {
      delete config.subcategory_images[id];
      changed = true;
    }
    if (config.subcategory_categorias && config.subcategory_categorias[id]) {
      delete config.subcategory_categorias[id];
      changed = true;
    }
    if (config.menu_lateral_subcategories) {
      const filtered = config.menu_lateral_subcategories.filter((item) => item.id !== id);
      if (filtered.length !== config.menu_lateral_subcategories.length) {
        config.menu_lateral_subcategories = filtered;
        changed = true;
      }
    }
    if (changed) {
      await this.saveFeaturedConfig(config);
    }
  },

  // ==========================================
  // Helper: Gestión del Menú Lateral de Colección (Header Mega Menú)
  // Soporta tanto categorías enteras como subcategorías individuales
  // ==========================================
  async getMenuLateralItems(): Promise<MenuLateralItem[]> {
    const config = await this.getFeaturedConfig();
    const rawItems = config.menu_lateral_items || config.menu_lateral_subcategories;
    if (Array.isArray(rawItems) && rawItems.length > 0) {
      return [...rawItems].sort((a, b) => a.orden - b.orden);
    }
    // Si aún no está configurado, devolver las primeras subcategorías
    const subs = await this.getSubcategorias();
    return subs.slice(0, 4).map((s, idx) => ({ id: s.id, orden: idx + 1, tipo: 'subcategoria' as const }));
  },

  async getMenuLateralSubcategorias(): Promise<MenuLateralItem[]> {
    return this.getMenuLateralItems();
  },

  async saveMenuLateralItems(items: MenuLateralItem[]): Promise<void> {
    const config = await this.getFeaturedConfig();
    const normalized = items.map((it, idx) => ({
      id: it.id,
      orden: typeof it.orden === 'number' ? it.orden : idx + 1,
      tipo: it.tipo || 'subcategoria',
    }));
    config.menu_lateral_items = normalized;
    config.menu_lateral_subcategories = normalized;
    await this.saveFeaturedConfig(config);
  },

  async saveMenuLateralSubcategorias(items: MenuLateralItem[]): Promise<void> {
    return this.saveMenuLateralItems(items);
  },

  // ==========================================
  // 3. Tipos de Oferta
  // ==========================================
  async getTiposOferta(): Promise<TipoOferta[]> {
    const { data, error } = await supabase
      .from('tipos_oferta')
      .select('*')
      .not('nombre', 'like', '__%')
      .order('nombre', { ascending: true });

    if (error) {
      console.warn('Error fetching tipos_oferta de Supabase:', error.message);
      return [];
    }
    return data || [];
  },

  async createTipoOferta(nombre: string, etiqueta_badge: string, color_badge?: string): Promise<TipoOferta> {
    const { data, error } = await supabase
      .from('tipos_oferta')
      .insert([{ nombre, etiqueta_badge, color_badge: color_badge || 'bg-navy text-white' }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateTipoOferta(id: string, nombre: string, etiqueta_badge: string, color_badge?: string): Promise<TipoOferta> {
    const { data, error } = await supabase
      .from('tipos_oferta')
      .update({ nombre, etiqueta_badge, color_badge })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteTipoOferta(id: string): Promise<void> {
    const { error } = await supabase.from('tipos_oferta').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // ==========================================
  // 4. Productos
  // ==========================================
  async getProductos(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        subcategoria:subcategorias(id, nombre, slug, categoria:categorias(id, nombre, orden)),
        tipo_oferta:tipos_oferta(id, nombre, etiqueta_badge, color_badge)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching productos de Supabase:', error.message);
      return [];
    }

    return (data || []).map((p) => parseRawProduct(p));
  },

  async getProductoById(id: string): Promise<Producto | null> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        subcategoria:subcategorias(id, nombre, slug, categoria:categorias(id, nombre, orden)),
        tipo_oferta:tipos_oferta(id, nombre, etiqueta_badge, color_badge)
      `)
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return parseRawProduct(data);
  },

  async createProducto(payload: {
    nombre: string;
    precio: number;
    precio_anterior?: number | null;
    subcategoria_id?: string | null;
    subcategorias_ids?: string[];
    categorias_ids?: string[];
    tipo_oferta_id?: string | null;
    imagenes_url: string[];
    colores?: ColorVariant[];
    descripcion?: string | null;
    talles?: string[];
    permite_cuotas?: boolean;
    permite_transferencia_descuento?: boolean;
    destacado?: boolean;
    stock?: number;
  }): Promise<Producto> {
    const cleanUrls = (payload.imagenes_url || []).map((u) => u.trim()).filter(Boolean);
    const cleanColores = (payload.colores || []).filter((c) => c && c.name?.trim());
    const cleanDescripcion = payload.descripcion?.trim() || '';
    const cleanTalles = payload.talles && payload.talles.length > 0 ? payload.talles : ['S', 'M', 'L', 'XL'];
    const permiteCuotas = payload.permite_cuotas !== undefined ? Boolean(payload.permite_cuotas) : true;
    const permiteTransferencia =
      payload.permite_transferencia_descuento !== undefined
        ? Boolean(payload.permite_transferencia_descuento)
        : true;

    const cleanSubIds = Array.isArray(payload.subcategorias_ids)
      ? Array.from(new Set(payload.subcategorias_ids.filter(Boolean)))
      : payload.subcategoria_id ? [payload.subcategoria_id] : [];
    const cleanCatIds = Array.isArray(payload.categorias_ids)
      ? Array.from(new Set(payload.categorias_ids.filter(Boolean)))
      : [];

    const insertObj: any = {
      nombre: payload.nombre.trim(),
      precio: payload.precio,
      precio_anterior: payload.precio_anterior || null,
      subcategoria_id: cleanSubIds[0] || payload.subcategoria_id || null,
      tipo_oferta_id: payload.tipo_oferta_id || null,
      destacado: Boolean(payload.destacado),
      stock: Number(payload.stock) || 0,
      imagenes_url: {
        urls: cleanUrls,
        colores: cleanColores,
        descripcion: cleanDescripcion,
        talles: cleanTalles,
        permite_cuotas: permiteCuotas,
        permite_transferencia_descuento: permiteTransferencia,
        subcategorias_ids: cleanSubIds,
        categorias_ids: cleanCatIds,
      },
    };

    let res = await supabase
      .from('productos')
      .insert([insertObj])
      .select(`
        *,
        subcategoria:subcategorias(id, nombre, slug, categoria:categorias(id, nombre, orden)),
        tipo_oferta:tipos_oferta(id, nombre, etiqueta_badge, color_badge)
      `)
      .single();

    // Fallback si la columna imagenes_url solo acepta array nativo
    if (res.error && res.error.message.includes('array')) {
      insertObj.imagenes_url = cleanUrls;
      res = await supabase
        .from('productos')
        .insert([insertObj])
        .select(`
          *,
          subcategoria:subcategorias(id, nombre, slug, categoria:categorias(id, nombre, orden)),
          tipo_oferta:tipos_oferta(id, nombre, etiqueta_badge, color_badge)
        `)
        .single();
    }

    if (res.error) throw new Error(res.error.message);
    return parseRawProduct(res.data);
  },

  async updateProducto(
    id: string,
    payload: {
      nombre?: string;
      precio?: number;
      precio_anterior?: number | null;
      subcategoria_id?: string | null;
      subcategorias_ids?: string[];
      categorias_ids?: string[];
      tipo_oferta_id?: string | null;
      imagenes_url?: string[];
      colores?: ColorVariant[];
      descripcion?: string | null;
      talles?: string[];
      permite_cuotas?: boolean;
      permite_transferencia_descuento?: boolean;
      destacado?: boolean;
      stock?: number;
    }
  ): Promise<Producto> {
    const updateObj: any = {};
    if (payload.nombre !== undefined) updateObj.nombre = payload.nombre.trim();
    if (payload.precio !== undefined) updateObj.precio = payload.precio;
    if (payload.precio_anterior !== undefined) updateObj.precio_anterior = payload.precio_anterior;
    if (payload.subcategorias_ids !== undefined && payload.subcategorias_ids.length > 0) {
      updateObj.subcategoria_id = payload.subcategorias_ids[0];
    } else if (payload.subcategoria_id !== undefined) {
      updateObj.subcategoria_id = payload.subcategoria_id;
    }
    if (payload.tipo_oferta_id !== undefined) updateObj.tipo_oferta_id = payload.tipo_oferta_id;
    if (payload.destacado !== undefined) updateObj.destacado = Boolean(payload.destacado);
    if (payload.stock !== undefined) updateObj.stock = Number(payload.stock);

    if (
      payload.imagenes_url !== undefined ||
      payload.colores !== undefined ||
      payload.descripcion !== undefined ||
      payload.talles !== undefined ||
      payload.permite_cuotas !== undefined ||
      payload.permite_transferencia_descuento !== undefined ||
      payload.subcategorias_ids !== undefined ||
      payload.categorias_ids !== undefined
    ) {
      const cleanUrls = (payload.imagenes_url || []).map((u) => u.trim()).filter(Boolean);
      const cleanColores = (payload.colores || []).filter((c) => c && c.name?.trim());
      const cleanDescripcion = payload.descripcion !== undefined ? (payload.descripcion?.trim() || '') : '';
      const cleanTalles = payload.talles && payload.talles.length > 0 ? payload.talles : ['S', 'M', 'L', 'XL'];
      const permiteCuotas = payload.permite_cuotas !== undefined ? Boolean(payload.permite_cuotas) : true;
      const permiteTransferencia =
        payload.permite_transferencia_descuento !== undefined
          ? Boolean(payload.permite_transferencia_descuento)
          : true;

      const cleanSubIds = Array.isArray(payload.subcategorias_ids)
        ? Array.from(new Set(payload.subcategorias_ids.filter(Boolean)))
        : payload.subcategoria_id ? [payload.subcategoria_id] : [];
      const cleanCatIds = Array.isArray(payload.categorias_ids)
        ? Array.from(new Set(payload.categorias_ids.filter(Boolean)))
        : [];

      updateObj.imagenes_url = {
        urls: cleanUrls,
        colores: cleanColores,
        descripcion: cleanDescripcion,
        talles: cleanTalles,
        permite_cuotas: permiteCuotas,
        permite_transferencia_descuento: permiteTransferencia,
        subcategorias_ids: cleanSubIds,
        categorias_ids: cleanCatIds,
      };
    }

    const { data, error } = await supabase
      .from('productos')
      .update(updateObj)
      .eq('id', id)
      .select(`
        *,
        subcategoria:subcategorias(id, nombre, slug, categoria:categorias(id, nombre, orden)),
        tipo_oferta:tipos_oferta(id, nombre, etiqueta_badge, color_badge)
      `)
      .single();

    if (error) throw new Error(error.message);
    return parseRawProduct(data);
  },

  async deleteProducto(id: string): Promise<void> {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async toggleProductoDestacado(id: string, currentState: boolean): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .update({ destacado: !currentState })
      .eq('id', id)
      .select(`
        *,
        subcategoria:subcategorias(id, nombre, slug, categoria:categorias(id, nombre, orden)),
        tipo_oferta:tipos_oferta(id, nombre, etiqueta_badge, color_badge)
      `)
      .single();

    if (error) throw new Error(error.message);
    return parseRawProduct(data);
  },

  // ==========================================
  // 5. Adaptador de Supabase al Frontend Público
  // ==========================================
  adaptSupabaseProductToFrontend(p: Producto, allCats?: Categoria[], allSubs?: Subcategoria[]): Product {
    const defaultImg = '/assets/images/hero-look.jpg';
    const parsed = parseRawProduct(p);

    // Unificar todas las fotos disponibles (generales + variantes de color)
    const allUrls: string[] = [...parsed.imagenes_url];
    if (parsed.colores && parsed.colores.length > 0) {
      parsed.colores.forEach((c) => {
        if (Array.isArray(c.imagenes)) {
          c.imagenes.forEach((imgUrl) => {
            if (imgUrl && !allUrls.includes(imgUrl)) {
              allUrls.push(imgUrl);
            }
          });
        }
      });
    }

    const finalImagesList = allUrls.length > 0 ? allUrls : [defaultImg];

    // Mapear variedad de colores
    let productColors: { name: string; hex: string; class: string; images: string[] }[] = [];
    if (parsed.colores && parsed.colores.length > 0) {
      productColors = parsed.colores.map((c) => ({
        name: c.name,
        titulo: c.titulo,
        hex: c.hex,
        class: `bg-[${c.hex}]`,
        images: Array.isArray(c.imagenes) && c.imagenes.length > 0 ? c.imagenes : finalImagesList,
      }));
    } else {
      productColors = [
        { name: 'Negro Washed', hex: '#161616', class: 'bg-[#161616]', images: finalImagesList },
        { name: 'Gris Melange', hex: '#9B9B9B', class: 'bg-[#9B9B9B]', images: finalImagesList },
      ];
    }

    // Datos de categoría y subcategoría de Supabase
    const cat = p.subcategoria?.categoria;
    const sub = p.subcategoria;
    const rawCatName = cat?.nombre || '';
    const categorySlug = rawCatName ? rawCatName.toLowerCase().replace(/\s+/g, '-') : 'general';

    // Múltiples categorías y subcategorías
    const categoryIds: string[] = [];
    const categoryNames: string[] = [];
    const categories: string[] = [];
    const subcategoryIds: string[] = [];
    const subcategoryNames: string[] = [];
    const subcategorySlugs: string[] = [];

    // Helper para registrar una categoría
    const registerCat = (cid: string, cname?: string) => {
      if (!cid) return;
      if (!categoryIds.includes(cid)) categoryIds.push(cid);
      let name = cname;
      if (!name && allCats) {
        const found = allCats.find((c) => c.id === cid);
        if (found) name = found.nombre;
      }
      if (name) {
        if (!categoryNames.includes(name)) categoryNames.push(name);
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        if (!categories.includes(slug)) categories.push(slug);
      }
    };

    // Helper para registrar una subcategoría y HEREDAR AUTOMÁTICAMENTE todas sus categorías a la prenda
    const registerSub = (sid: string, sname?: string, sslug?: string) => {
      if (!sid) return;
      if (!subcategoryIds.includes(sid)) subcategoryIds.push(sid);
      const sObj = allSubs
        ? allSubs.find((s) => s.id === sid)
        : p.subcategoria?.id === sid
        ? p.subcategoria
        : undefined;
      const name = sname || sObj?.nombre;
      const slug = sslug || sObj?.slug;
      if (name && !subcategoryNames.includes(name)) subcategoryNames.push(name);
      if (slug && !subcategorySlugs.includes(slug)) subcategorySlugs.push(slug);

      // Heredar todas las categorías de la subcategoría:
      // 1. Primaria
      if (sObj?.categoria_id) {
        registerCat(sObj.categoria_id, sObj.categoria?.nombre);
      }
      // 2. Múltiples categorías (categorias_ids y categorias)
      if (Array.isArray(sObj?.categorias_ids)) {
        sObj.categorias_ids.forEach((cid) => {
          const cObj = sObj.categorias?.find((c) => c.id === cid);
          registerCat(cid, cObj?.nombre);
        });
      }
    };

    // 1. Subcategoría y Categoría primaria del producto
    if (sub) {
      registerSub(sub.id, sub.nombre, sub.slug);
    } else if (p.subcategoria_id) {
      registerSub(p.subcategoria_id);
    }
    if (cat) {
      registerCat(cat.id, cat.nombre);
    }

    // 2. Subcategorías asignadas adicionales (con herencia de todas sus categorías)
    if (Array.isArray(parsed.subcategorias_ids)) {
      parsed.subcategorias_ids.forEach((sid) => {
        registerSub(sid);
      });
    }

    // 3. Categorías asignadas adicionales directamente
    if (Array.isArray(parsed.categorias_ids)) {
      parsed.categorias_ids.forEach((cid) => {
        registerCat(cid);
      });
    }

    // Inferencia de tipo de prenda para guía de talles
    let measureType: 'buzo' | 'pantalon' | 'conjunto' = 'buzo';
    const lowerName = p.nombre.toLowerCase();
    const lowerCat = rawCatName.toLowerCase();
    if (
      lowerCat.includes('pantalon') ||
      lowerCat.includes('bottom') ||
      lowerName.includes('pantalon') ||
      lowerName.includes('cargo')
    ) {
      measureType = 'pantalon';
    } else if (
      lowerCat.includes('conjunto') ||
      lowerName.includes('conjunto') ||
      lowerName.includes('set') ||
      lowerName.includes('tracksuit')
    ) {
      measureType = 'conjunto';
    }

    const displayedCats = categoryNames.length > 0 ? categoryNames.join(' / ') : rawCatName || 'Colección';
    const displayedSubs = subcategoryNames.length > 0 ? subcategoryNames.join(', ') : sub?.nombre || '';

    return {
      id: p.id,
      slug: sub?.slug ? `${sub.slug}-${p.id.slice(0, 6)}` : `prod-${p.id.slice(0, 8)}`,
      name: p.nombre,
      subtitle: `${displayedCats}${displayedSubs ? ` • ${displayedSubs}` : ''} • Unisex`,
      category: categorySlug,
      categoryId: cat?.id || categoryIds[0] || '',
      categoryName: rawCatName || categoryNames[0] || '',
      categoryIds,
      categoryNames,
      categories,
      subcategoryId: sub?.id || subcategoryIds[0] || '',
      subcategoryName: sub?.nombre || subcategoryNames[0] || '',
      subcategorySlug: sub?.slug || subcategorySlugs[0] || '',
      subcategoryIds,
      subcategoryNames,
      subcategorySlugs,
      price: Number(p.precio),
      compareAtPrice: p.precio_anterior ? Number(p.precio_anterior) : undefined,
      description:
        parsed.descripcion?.trim() ||
        `Pieza oficial Veelvet confeccionada en frisa de alta densidad. Silueta holgada y diseño urbano contemporáneo.`,
      composition: '100% Algodón peinado pesado 380g con proceso antipilling y teñido reactivo.',
      fit: 'Boxy / Oversized unisex. Recomendamos llevar tu talle habitual para un calce relajado.',
      images: {
        primary: finalImagesList[0] || defaultImg,
        secondary: finalImagesList[1] || finalImagesList[0] || defaultImg,
        lookbook: finalImagesList[2] || finalImagesList[0] || defaultImg,
      },
      allImages: finalImagesList,
      colors: productColors,
      sizes: parsed.talles && parsed.talles.length > 0 ? parsed.talles : ['S', 'M', 'L', 'XL'],
      inStock: p.stock > 0,
      tag: p.tipo_oferta?.etiqueta_badge as any,
      rating: 4.9,
      reviewsCount: 34,
      featured: Boolean(p.destacado),
      measureType,
      allowInstallments: parsed.permite_cuotas !== false,
      allowTransferDiscount: parsed.permite_transferencia_descuento !== false,
    };
  },

  /**
   * Construye dinámicamente las 4 columnas del Mega Menú con los datos reales de Supabase.
   */
  async buildMegaMenuFromSupabase(): Promise<MegaMenuConfig | null> {
    try {
      const [categorias, subcategorias, tiposOferta, featuredConfig] = await Promise.all([
        this.getCategorias(),
        this.getSubcategorias(),
        this.getTiposOferta(),
        this.getFeaturedConfig(),
      ]);

      if (categorias.length === 0 && subcategorias.length === 0) {
        return null; // fallback a megaMenuData local
      }

      // Columna 1: Tipos de Oferta y Subcategorías/Categorías de la sección lateral izquierda
      const col1OfferItems = tiposOferta.map((to) => ({
        name: to.nombre,
        href: `/tienda?filter=${encodeURIComponent(to.etiqueta_badge.toLowerCase())}`,
        badge: to.etiqueta_badge,
        badgeColor: to.color_badge || 'bg-navy text-white',
        highlight: true,
      }));

      // Sección lateral izquierda: Soporta tanto categorías enteras como subcategorías individuales
      type MenuItemEntry = { name: string; href: string; badge?: string; badgeColor?: string; highlight?: boolean };
      let lateralItemsList: MenuItemEntry[] = [];
      const rawLateral = featuredConfig.menu_lateral_items || featuredConfig.menu_lateral_subcategories;

      if (Array.isArray(rawLateral) && rawLateral.length > 0) {
        const sorted = [...rawLateral].sort((a, b) => a.orden - b.orden);
        const collected: MenuItemEntry[] = [];

        for (const item of sorted) {
          // 1. Si está marcado como categoría o coincide con ID de categoría
          if (
            item.tipo === 'categoria' ||
            (categorias.some((c) => c.id === item.id) && !subcategorias.some((s) => s.id === item.id))
          ) {
            const cat = categorias.find((c) => c.id === item.id);
            if (cat) {
              collected.push({
                name: cat.nombre,
                href: `/tienda?cat=${encodeURIComponent(cat.nombre.toLowerCase())}`,
                badge: 'CATEGORÍA',
                badgeColor: 'bg-beige-300 text-navy font-bold',
                highlight: true,
              });
              continue;
            }
          }

          // 2. Si es subcategoría
          const sub = subcategorias.find((s) => s.id === item.id);
          if (sub) {
            collected.push({
              name: sub.nombre,
              href: `/tienda?cat=${sub.categoria?.nombre.toLowerCase() || 'todos'}&sub=${sub.slug}`,
            });
            continue;
          }

          // 3. Fallback buscar en categorías
          const catFallback = categorias.find((c) => c.id === item.id);
          if (catFallback) {
            collected.push({
              name: catFallback.nombre,
              href: `/tienda?cat=${encodeURIComponent(catFallback.nombre.toLowerCase())}`,
              badge: 'CATEGORÍA',
              badgeColor: 'bg-beige-300 text-navy font-bold',
              highlight: true,
            });
          }
        }

        lateralItemsList = collected;
      } else {
        lateralItemsList = subcategorias.slice(0, 5).map((s) => ({
          name: s.nombre,
          href: `/tienda?cat=${s.categoria?.nombre.toLowerCase() || 'todos'}&sub=${s.slug}`,
        }));
      }

      const columns: MegaMenuConfig['columns'] = [
        {
          id: 'destacados',
          items: [...col1OfferItems, ...lateralItemsList],
        },
      ];

      // Columnas 2, 3, 4 basadas en las categorías principales (Top, Bottom, Accesorios)
      categorias.forEach((cat) => {
        const catSubs = subcategorias.filter(
          (s) => s.categoria_id === cat.id || s.categorias_ids?.includes(cat.id)
        );
        columns.push({
          id: cat.nombre.toLowerCase().replace(/\s+/g, '-'),
          title: cat.nombre,
          hasUnderline: true,
          items: catSubs.map((s) => ({
            name: s.nombre,
            href: `/tienda?cat=${cat.nombre.toLowerCase()}&sub=${s.slug}`,
          })),
        });
      });

      return { columns };
    } catch (err) {
      console.warn('Error construyendo mega menú dinámico de Supabase:', err);
      return null;
    }
  },

  // ==========================================
  // 6. Sembrador de Datos Iniciales (Seed Helper)
  // ==========================================
  async seedInitialData(): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Crear Categorías (Top y Bottom destacadas)
      const top = await this.createCategoria('Top', 1, true);
      const bottom = await this.createCategoria('Bottom', 2, true);
      const accesorios = await this.createCategoria('Accesorios', 3, false);

      // 2. Crear Subcategorías
      const subsTop = ['Campera', 'Remeras', 'Musculosas', 'Camisas', 'Hoodies', 'Zip Up'];
      const subsBottom = ['Sastrero', 'Cargos', 'Denim', 'Sweatpant', 'Shorts'];
      const subsAcc = ['Morrales', 'Bijou', 'Medias', 'Ver todo'];

      const createdSubs: Record<string, Subcategoria> = {};
      for (const s of subsTop) {
        createdSubs[s] = await this.createSubcategoria(top.id, s);
      }
      for (const s of subsBottom) {
        createdSubs[s] = await this.createSubcategoria(bottom.id, s);
      }
      for (const s of subsAcc) {
        createdSubs[s] = await this.createSubcategoria(accesorios.id, s);
      }

      // 3. Crear Tipos de Oferta
      const ofertaHot = await this.createTipoOferta('Precios únicos', 'HOT', 'bg-red-600 text-white');
      const ofertaDrop = await this.createTipoOferta('Final Count Unit 03', 'DROP', 'bg-navy text-white');
      const ofertaSale = await this.createTipoOferta('Sale Final Hasta 60%Off', '-60%', 'bg-amber-600 text-white');
      const ofertaBestSeller = await this.createTipoOferta('Best Seller', 'BEST SELLER', 'bg-beige-300 text-navy');

      // 4. Crear Productos iniciales de Veelvet
      await this.createProducto({
        nombre: 'Buzo con Cierre Boxy Heavy',
        precio: 68000,
        precio_anterior: 79000,
        subcategoria_id: createdSubs['Zip Up']?.id || null,
        tipo_oferta_id: ofertaBestSeller.id,
        imagenes_url: [
          '/assets/images/buzo-negro.jpg',
          '/assets/images/hero-look.jpg',
        ],
        destacado: true,
        stock: 25,
      });

      await this.createProducto({
        nombre: 'Pantalón Ancho Wide Leg',
        precio: 62000,
        precio_anterior: 72000,
        subcategoria_id: createdSubs['Cargos']?.id || null,
        tipo_oferta_id: ofertaDrop.id,
        imagenes_url: [
          '/assets/images/pantalon-beige.jpg',
          '/assets/images/hero-look.jpg',
        ],
        destacado: true,
        stock: 18,
      });

      await this.createProducto({
        nombre: 'Conjunto Veelvet Boxy Tracksuit',
        precio: 119000,
        precio_anterior: 130000,
        subcategoria_id: createdSubs['Campera']?.id || null,
        tipo_oferta_id: ofertaSale.id,
        imagenes_url: [
          '/assets/images/hero-look.jpg',
          '/assets/images/buzo-negro.jpg',
        ],
        destacado: true,
        stock: 12,
      });

      await this.createProducto({
        nombre: 'Buzo con Cierre Chocolate Earth',
        precio: 68000,
        subcategoria_id: createdSubs['Hoodies']?.id || null,
        tipo_oferta_id: ofertaHot.id,
        imagenes_url: [
          '/assets/images/buzo-negro.jpg',
          '/assets/images/pantalon-beige.jpg',
        ],
        destacado: false,
        stock: 15,
      });

      return {
        success: true,
        message: '¡Datos iniciales de Veelvet sembrados con éxito en Supabase!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Error al sembrar datos.',
      };
    }
  },
};
