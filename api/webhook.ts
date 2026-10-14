import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ikuwvjvhtbouafjayrvj.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrdXd2anZodGJvdWFmamF5cnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NzYzNDQsImV4cCI6MjEwNjU1MjM0NH0.qar2GCV5r7zopChl3m9499-KJRoqey-MVJxmlVgbJKg';
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-2424082766958924-101320-729129e88953e1ef882a178d4f4f9348-3760299431';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(200).send('Webhook endpoint activo. Esperando notificaciones POST.');
  }

  try {
    const { body, query } = req;
    console.log('Notificación recibida de Mercado Pago:', { query, body });

    // Mercado Pago puede enviar el ID de pago en query params o en el body
    const paymentId =
      query['data.id'] ||
      query.id ||
      body?.data?.id ||
      body?.id;

    const action = query.type || body?.type || query.topic || body?.topic;

    if (!paymentId || (action && action !== 'payment')) {
      // Notificación de otro tipo (ej: merchant_order), respondemos 200 para que MP no reintente
      return res.status(200).json({ received: true });
    }

    // ========================================================
    // SEGURIDAD CRÍTICA (Anti-Falsificación / Anti-Spoofing):
    // Consultar directamente a la API oficial de Mercado Pago
    // usando la clave privada para comprobar el estado REAL
    // ========================================================
    const mpCheckResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
    });

    if (!mpCheckResponse.ok) {
      console.error('No se pudo verificar el pago en la API de Mercado Pago:', paymentId);
      return res.status(200).json({ received: true });
    }

    const paymentData = await mpCheckResponse.json();
    const orderNumber = paymentData.external_reference;
    const paymentStatus = paymentData.status; // 'approved', 'rejected', 'in_process', 'pending'

    console.log(`Pago verificado en MP: ID ${paymentId} | Orden ${orderNumber} | Estado: ${paymentStatus}`);

    if (orderNumber) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      let estadoInterno: 'pendiente' | 'aprobado' | 'rechazado' = 'pendiente';
      if (paymentStatus === 'approved') estadoInterno = 'aprobado';
      else if (paymentStatus === 'rejected') estadoInterno = 'rechazado';

      await supabase
        .from('pedidos')
        .update({
          estado_pago: estadoInterno,
          mp_payment_id: String(paymentId),
          mp_status: paymentStatus,
          mp_status_detail: paymentData.status_detail || '',
          updated_at: new Date().toISOString(),
        })
        .eq('order_number', orderNumber);
    }

    // Siempre responder 200 rápido a Mercado Pago para confirmar recepción
    return res.status(200).json({ status: 'ok' });
  } catch (err: any) {
    console.error('Error al procesar webhook de Mercado Pago:', err);
    // Respondemos 200 para evitar que Mercado Pago sature reintentando por errores internos
    return res.status(200).json({ error: err.message });
  }
}
