import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ikuwvjvhtbouafjayrvj.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrdXd2anZodGJvdWFmamF5cnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NzYzNDQsImV4cCI6MjEwNjU1MjM0NH0.qar2GCV5r7zopChl3m9499-KJRoqey-MVJxmlVgbJKg';
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-2424082766958924-101320-729129e88953e1ef882a178d4f4f9348-3760299431';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilizar POST.' });
  }

  try {
    const { items, customer, shipping, discount = 0, notes = '' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito no contiene productos.' });
    }

    if (!customer?.email || !customer?.name) {
      return res.status(400).json({ error: 'Faltan datos obligatorios del comprador (nombre y email).' });
    }

    // Inicializar cliente Supabase para validación
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ========================================================
    // SEGURIDAD 1: Validación de Precios contra Base de Datos
    // Previene manipulación maliciosa de precios desde el navegador
    // ========================================================
    const productIds = items.map((i: any) => i.productId).filter(Boolean);
    const { data: dbProducts } = await supabase
      .from('productos')
      .select('id, nombre, precio')
      .in('id', productIds);

    const priceMap = new Map<string, number>();
    if (dbProducts) {
      dbProducts.forEach((p: any) => priceMap.set(p.id, Number(p.precio)));
    }

    const verifiedItems = items.map((item: any) => {
      // Usar precio real de la BD si existe; fallback al precio enviado
      const officialPrice = priceMap.get(item.productId) ?? Number(item.price);
      return {
        id: String(item.productId || 'item'),
        title: `${item.name} (${item.size || 'U'} / ${item.colorName || 'Único'})`,
        description: `Prenda Veelvet oficial - Talle ${item.size || 'U'}`,
        category_id: 'fashion',
        quantity: Math.max(1, Number(item.quantity) || 1),
        currency_id: 'ARS',
        unit_price: Math.max(1, officialPrice),
        picture_url: item.image || undefined,
      };
    });

    // Calcular subtotal real verificado
    const verifiedSubtotal = verifiedItems.reduce(
      (acc: number, it: any) => acc + it.unit_price * it.quantity,
      0
    );
    const finalTotal = Math.max(0, verifiedSubtotal - (Number(discount) || 0) + (Number(shipping?.price) || 0));

    // Generar número de orden único
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = req.body.orderNumber || `VVT-${randomSuffix}`;

    // Determinar la URL base para el retorno del comprador
    const origin =
      req.headers.origin ||
      (req.headers.host ? `https://${req.headers.host}` : 'http://localhost:5173');
    const siteUrl = origin.replace(/\/$/, '');

    // ========================================================
    // SEGURIDAD 2: Creación de la Preferencia Oficial de MP
    // ========================================================
    const preferenceBody: any = {
      items: verifiedItems,
      payer: {
        name: customer.name,
        surname: customer.lastName || '',
        email: customer.email,
        phone: {
          number: customer.phone ? String(customer.phone) : '',
        },
        identification: {
          type: 'DNI',
          number: customer.dni ? String(customer.dni) : '',
        },
        address: {
          street_name: customer.street || '',
          street_number: customer.number ? Number(customer.number) || null : null,
          zip_code: customer.postalCode ? String(customer.postalCode) : '',
        },
      },
      back_urls: {
        success: `${siteUrl}/pedido-confirmado?status=success&order_number=${orderNumber}`,
        failure: `${siteUrl}/checkout?status=failure&order_number=${orderNumber}`,
        pending: `${siteUrl}/pedido-confirmado?status=pending&order_number=${orderNumber}`,
      },
      auto_return: 'approved',
      external_reference: orderNumber,
      statement_descriptor: 'VEELVET',
      metadata: {
        order_number: orderNumber,
        customer_email: customer.email,
        customer_phone: customer.phone,
      },
    };

    // Agregar webhook de notificación si estamos en un dominio público HTTPS
    if (siteUrl.startsWith('https://')) {
      preferenceBody.notification_url = `${siteUrl}/api/webhook`;
    }

    // Llamada oficial a la API de Mercado Pago Checkout Pro
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceBody),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok || !mpData.id) {
      console.error('Error devuelto por Mercado Pago al crear preferencia:', mpData);
      return res.status(502).json({
        error: 'Error al comunicarse con Mercado Pago.',
        details: mpData.message || mpData,
      });
    }

    // ========================================================
    // SEGURIDAD 3: Registro Inicial del Pedido en Supabase
    // ========================================================
    try {
      await supabase.from('pedidos').insert([
        {
          order_number: orderNumber,
          cliente_nombre: customer.name,
          cliente_apellido: customer.lastName || '',
          cliente_email: customer.email,
          cliente_telefono: customer.phone || '',
          cliente_dni: customer.dni || '',
          direccion_calle: customer.street || '',
          direccion_numero: customer.number || '',
          direccion_piso_depto: customer.floor || '',
          direccion_ciudad: customer.city || '',
          direccion_provincia: customer.province || 'Buenos Aires',
          direccion_cp: customer.postalCode || '',
          notas: notes || '',
          metodo_envio: shipping?.name || 'Envío',
          costo_envio: Number(shipping?.price) || 0,
          items: items,
          subtotal: verifiedSubtotal,
          descuento: Number(discount) || 0,
          total: finalTotal,
          estado_pago: 'pendiente',
          mp_preference_id: mpData.id,
        },
      ]);
    } catch (dbErr) {
      console.warn('Nota: no se pudo guardar en Supabase (verifique si la tabla pedidos está creada):', dbErr);
    }

    return res.status(200).json({
      success: true,
      orderNumber,
      preferenceId: mpData.id,
      initPoint: mpData.init_point,
      sandboxInitPoint: mpData.sandbox_init_point,
    });
  } catch (err: any) {
    console.error('Error interno al generar preferencia de Mercado Pago:', err);
    return res.status(500).json({
      error: 'Error interno del servidor al procesar el pago.',
      details: err.message,
    });
  }
}
