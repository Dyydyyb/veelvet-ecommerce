import { supabase, Pedido } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'veelvet_pedidos_backup';

function getLocalPedidos(): Pedido[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPedidos(pedidos: Pedido[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pedidos));
  } catch (e) {
    console.warn('No se pudo guardar en almacenamiento local:', e);
  }
}

export const OrderService = {
  /**
   * Guarda un nuevo pedido o intento de pedido en Supabase y respaldo local.
   * Se ejecuta de forma inmediata garantizando que ningún intento de compra se pierda.
   */
  async createPedido(pedido: Pedido): Promise<Pedido> {
    const pedidoConFecha: Pedido = {
      ...pedido,
      created_at: pedido.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Guardar siempre en caché local de contingencia
    try {
      const current = getLocalPedidos();
      const existingIdx = current.findIndex((p) => p.order_number === pedido.order_number);
      if (existingIdx >= 0) {
        current[existingIdx] = { ...current[existingIdx], ...pedidoConFecha };
      } else {
        current.unshift(pedidoConFecha);
      }
      saveLocalPedidos(current);
    } catch (e) {
      console.warn('Error en respaldo local de pedido:', e);
    }

    // 2. Guardar en Supabase (con upsert para evitar duplicados si se llama de nuevo)
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .upsert(
          [
            {
              order_number: pedido.order_number,
              cliente_nombre: pedido.cliente_nombre,
              cliente_apellido: pedido.cliente_apellido || '',
              cliente_email: pedido.cliente_email,
              cliente_telefono: pedido.cliente_telefono || '',
              cliente_dni: pedido.cliente_dni || '',
              direccion_calle: pedido.direccion_calle || '',
              direccion_numero: pedido.direccion_numero || '',
              direccion_piso_depto: pedido.direccion_piso_depto || '',
              direccion_ciudad: pedido.direccion_ciudad || '',
              direccion_provincia: pedido.direccion_provincia || '',
              direccion_cp: pedido.direccion_cp || '',
              notas: pedido.notas || '',
              metodo_envio: pedido.metodo_envio,
              costo_envio: pedido.costo_envio || 0,
              items: pedido.items,
              subtotal: pedido.subtotal,
              descuento: pedido.descuento || 0,
              total: pedido.total,
              estado_pago: pedido.estado_pago || 'pendiente',
              mp_preference_id: pedido.mp_preference_id || null,
              mp_payment_id: pedido.mp_payment_id || null,
              mp_status: pedido.mp_status || null,
              mp_status_detail: pedido.mp_status_detail || null,
            },
          ],
          { onConflict: 'order_number' }
        )
        .select()
        .single();

      if (error) {
        console.warn(
          'Aviso: Supabase rechazó el insert en "pedidos" (verifique si falta ejecutar "ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;"):',
          error.message
        );
        return pedidoConFecha;
      }

      return data as Pedido;
    } catch (err) {
      console.error('Error al persistir pedido en Supabase:', err);
      return pedidoConFecha;
    }
  },

  /**
   * Obtiene un pedido por su número único de orden
   */
  async getPedidoByOrderNumber(orderNumber: string): Promise<Pedido | null> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (data) return data as Pedido;

      if (error) {
        console.warn('Error al buscar en Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Fallo de red al buscar en Supabase:', err);
    }

    // Fallback a almacenamiento local
    const local = getLocalPedidos();
    return local.find((p) => p.order_number === orderNumber) || null;
  },

  /**
   * Actualiza el estado de pago del pedido tras confirmación de Mercado Pago
   */
  async updatePedidoPayment(
    orderNumber: string,
    status: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado',
    mpPaymentId?: string,
    mpStatusDetail?: string
  ): Promise<boolean> {
    // 1. Actualizar en almacenamiento local
    try {
      const current = getLocalPedidos();
      const idx = current.findIndex((p) => p.order_number === orderNumber);
      if (idx >= 0) {
        current[idx].estado_pago = status;
        if (mpPaymentId) current[idx].mp_payment_id = mpPaymentId;
        if (mpStatusDetail) current[idx].mp_status_detail = mpStatusDetail;
        current[idx].updated_at = new Date().toISOString();
        saveLocalPedidos(current);
      }
    } catch (e) {
      console.warn('Error actualizando estado local:', e);
    }

    // 2. Actualizar en Supabase
    try {
      const payload: any = {
        estado_pago: status,
        updated_at: new Date().toISOString(),
      };
      if (mpPaymentId) payload.mp_payment_id = mpPaymentId;
      if (mpStatusDetail) payload.mp_status_detail = mpStatusDetail;

      const { error } = await supabase
        .from('pedidos')
        .update(payload)
        .eq('order_number', orderNumber);

      if (error) {
        console.warn('Aviso al actualizar estado del pedido en Supabase:', error.message);
        return true; // Se mantiene true si ya se actualizó en local
      }

      return true;
    } catch (err) {
      console.error('Error al actualizar pedido en Supabase:', err);
      return true;
    }
  },

  /**
   * Obtiene todos los pedidos registrados en el sistema, ordenados por fecha descendente.
   * Fusiona automáticamente los pedidos de Supabase con los del almacenamiento local.
   */
  async getPedidos(): Promise<Pedido[]> {
    let remotePedidos: Pedido[] = [];
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        remotePedidos = data as Pedido[];
      } else if (error) {
        console.warn('Aviso al consultar tabla pedidos en Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Error al obtener lista de pedidos desde Supabase:', err);
    }

    const localPedidos = getLocalPedidos();

    // Fusionar por order_number dando prioridad a Supabase si existe
    const mergedMap = new Map<string, Pedido>();

    // Primero agregamos los locales
    localPedidos.forEach((p) => {
      if (p.order_number) mergedMap.set(p.order_number, p);
    });

    // Luego sobreescribimos o añadimos con los de Supabase
    remotePedidos.forEach((p) => {
      if (p.order_number) mergedMap.set(p.order_number, p);
    });

    // Intentar sincronizar pedidos locales pendientes a Supabase en segundo plano
    if (localPedidos.length > 0) {
      const remoteOrderNumbers = new Set(remotePedidos.map((r) => r.order_number));
      const unSynced = localPedidos.filter((l) => !remoteOrderNumbers.has(l.order_number));
      if (unSynced.length > 0) {
        // Intento silencioso en background
        setTimeout(async () => {
          for (const unsync of unSynced) {
            try {
              await supabase.from('pedidos').upsert([unsync], { onConflict: 'order_number' });
            } catch {
              // Si falla por RLS, se mantiene en local
            }
          }
        }, 1000);
      }
    }

    const result = Array.from(mergedMap.values());
    // Ordenar de más reciente a más antiguo
    result.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return result;
  },

  /**
   * Actualiza cualquier campo de un pedido por su ID o número de orden
   */
  async updatePedido(id: string, updates: Partial<Pedido>): Promise<boolean> {
    try {
      const current = getLocalPedidos();
      const idx = current.findIndex((p) => p.id === id || (updates.order_number && p.order_number === updates.order_number));
      if (idx >= 0) {
        current[idx] = { ...current[idx], ...updates, updated_at: new Date().toISOString() };
        saveLocalPedidos(current);
      }
    } catch (e) {
      console.warn('Error actualizando pedido en local:', e);
    }

    try {
      const { error } = await supabase
        .from('pedidos')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.warn('Aviso al actualizar pedido en Supabase:', error.message);
      }
      return true;
    } catch (err) {
      console.error('Error al actualizar pedido:', err);
      return true;
    }
  },

  /**
   * Elimina un pedido del sistema
   */
  async deletePedido(id: string): Promise<boolean> {
    try {
      const current = getLocalPedidos();
      saveLocalPedidos(current.filter((p) => p.id !== id));
    } catch (e) {
      console.warn('Error eliminando de local:', e);
    }

    try {
      const { error } = await supabase.from('pedidos').delete().eq('id', id);
      if (error) {
        console.warn('Aviso al eliminar pedido en Supabase:', error.message);
      }
      return true;
    } catch (err) {
      console.error('Error al eliminar pedido:', err);
      return true;
    }
  },
};
