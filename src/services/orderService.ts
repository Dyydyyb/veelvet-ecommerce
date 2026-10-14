import { supabase, Pedido } from '../lib/supabase';

export const OrderService = {
  /**
   * Guarda un nuevo pedido en Supabase con estado inicial 'pendiente'
   */
  async createPedido(pedido: Pedido): Promise<Pedido | null> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .insert([
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
          },
        ])
        .select()
        .single();

      if (error) {
        console.warn('Aviso al insertar en tabla pedidos (puede requerir crear la tabla en Supabase):', error.message);
        return pedido; // Devolvemos el pedido localmente para no frenar la compra
      }

      return data as Pedido;
    } catch (err) {
      console.error('Error al guardar pedido en Supabase:', err);
      return pedido;
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

      if (error) {
        console.error('Error al buscar pedido en Supabase:', error.message);
        return null;
      }

      return data as Pedido | null;
    } catch (err) {
      console.error('Error al consultar pedido:', err);
      return null;
    }
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
        console.error('Error al actualizar estado del pedido:', error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error al actualizar pedido:', err);
      return false;
    }
  },

  /**
   * Obtiene todos los pedidos registrados en el sistema, ordenados por fecha descendente
   */
  async getPedidos(): Promise<Pedido[]> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Aviso al consultar tabla pedidos:', error.message);
        return [];
      }

      return (data || []) as Pedido[];
    } catch (err) {
      console.error('Error al obtener lista de pedidos:', err);
      return [];
    }
  },

  /**
   * Actualiza cualquier campo de un pedido por su ID
   */
  async updatePedido(id: string, updates: Partial<Pedido>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error al actualizar pedido:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error al actualizar pedido:', err);
      return false;
    }
  },

  /**
   * Elimina un pedido del sistema
   */
  async deletePedido(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('pedidos').delete().eq('id', id);
      if (error) {
        console.error('Error al eliminar pedido:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error al eliminar pedido:', err);
      return false;
    }
  },
};
