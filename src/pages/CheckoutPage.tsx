import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { SHIPPING_METHODS, ShippingMethod } from '../data/shippingMethods';
import { SectionTitle } from '../components/common/SectionTitle';
import { Truck, MapPin, CheckCircle2, ShieldCheck, CreditCard, ArrowLeft, ArrowRight, Lock, MessageCircle, Clock, Users } from 'lucide-react';
import { WHATSAPP_DISPLAY, getWhatsAppLink } from '../config/constants';
import { OrderService } from '../services/orderService';
import confetti from 'canvas-confetti';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getSubtotal, getDiscount, clearCart } = useCartStore();

  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(SHIPPING_METHODS[0]);
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago'>('mercadopago');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [whatsappOrderUrl, setWhatsappOrderUrl] = useState('');
  const [orderItemsSnapshot, setOrderItemsSnapshot] = useState<typeof items>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    lastName: '',
    dni: '',
    phone: '',
    street: '',
    number: '',
    floor: '',
    city: '',
    province: 'Buenos Aires',
    postalCode: '',
    notes: '',
  });

  const subtotal = getSubtotal();
  const discount = getDiscount();

  const shippingCost = Math.max(0, Number(selectedShipping.price) || 0);
  const finalTotal = Math.max(0, subtotal - discount + shippingCost);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const setupWhatsAppFallback = (orderId: string) => {
    const currentItems = [...items];
    const itemsSummary = currentItems
      .map(
        (item) =>
          `• ${item.quantity}x ${item.product.name} (Talle: ${item.size} | Color: ${item.colorName}) - ${formatPrice(
            item.product.price * item.quantity
          )}`
      )
      .join('\n');

    const shippingInfo =
      selectedShipping.carrier === 'showroom'
        ? `• Entrega: Retiro en Showroom Quilmes Oeste (Lun a Sáb 9:00 a 17:00 hs, máx. 2 personas)`
        : `• Dirección de Entrega: ${formData.street} ${formData.number}${formData.floor ? ' Depto ' + formData.floor : ''}, ${formData.city}, ${formData.province} (CP ${formData.postalCode})`;

    const shippingLine =
      selectedShipping.carrier === 'showroom'
        ? `🚚 *Método de Entrega:* Retiro en Showroom Quilmes Oeste (GRATIS)`
        : `🚚 *Método de Envío:* Correo Argentino ($8.999 Tarifa Fija Nacional)`;

    const orderMessage =
      `*NUEVO PEDIDO VEELVET* 🛍️\n` +
      `*Orden:* #${orderId}\n\n` +
      `👤 *Datos del Comprador:*\n` +
      `• Nombre: ${formData.name} ${formData.lastName}\n` +
      `• DNI: ${formData.dni}\n` +
      `• Teléfono: ${formData.phone}\n` +
      `• Email: ${formData.email}\n` +
      `${shippingInfo}\n` +
      (formData.notes ? `• Aclaraciones de entrega: ${formData.notes}\n` : '') +
      `\n📦 *Prendas del Pedido:*\n${itemsSummary}\n\n` +
      `${shippingLine}\n` +
      `💳 *Medio de Pago:* Mercado Pago\n` +
      (discount > 0 ? `🎟️ *Descuento Cupón:* -${formatPrice(discount)}\n` : '') +
      (shippingCost > 0 ? `📦 *Costo de Envío:* ${formatPrice(shippingCost)}\n` : '') +
      `💰 *TOTAL FINAL:* ${formatPrice(finalTotal)}\n\n` +
      `¡Hola Veelvet! 👋 Acabo de realizar este pedido en la tienda online. Les envío los datos para coordinar el despacho. ¡Muchas gracias!`;

    const waUrl = getWhatsAppLink(orderMessage);
    setWhatsappOrderUrl(waUrl);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const randomId = 'VVT-' + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(randomId);

    // Snapshot cart items before any action
    const currentItems = [...items];
    setOrderItemsSnapshot(currentItems);
    setupWhatsAppFallback(randomId);

    // 1. Guardar de inmediato el pedido / intento de pedido en el sistema (Supabase + respaldo local)
    try {
      await OrderService.createPedido({
        order_number: randomId,
        cliente_nombre: formData.name,
        cliente_apellido: formData.lastName,
        cliente_email: formData.email,
        cliente_telefono: formData.phone,
        cliente_dni: formData.dni,
        direccion_calle: formData.street,
        direccion_numero: formData.number,
        direccion_piso_depto: formData.floor,
        direccion_ciudad: formData.city,
        direccion_provincia: formData.province,
        direccion_cp: formData.postalCode,
        notas: formData.notes,
        metodo_envio: selectedShipping.name,
        costo_envio: shippingCost,
        items: currentItems.map((item) => ({
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          size: item.size,
          colorName: item.colorName,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.primary || '',
        })),
        subtotal,
        descuento: discount,
        total: finalTotal,
        estado_pago: 'pendiente',
      });
    } catch (orderSaveErr) {
      console.warn('Registro preventivo del pedido:', orderSaveErr);
    }

    try {
      // 2. Llamar al backend seguro para crear la preferencia oficial de Mercado Pago
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: randomId,
          items: currentItems.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            size: item.size,
            colorName: item.colorName,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.images?.primary || '',
          })),
          customer: formData,
          shipping: selectedShipping,
          discount,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (data?.initPoint) {
        // Redirigir a Mercado Pago Checkout Pro de forma segura
        window.location.href = data.initPoint;
        return;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      throw new Error('No se pudo obtener el punto de pago de Mercado Pago.');
    } catch (err: any) {
      console.error('Error al procesar el pago con Mercado Pago:', err);
      setSubmitError(
        'Hubo un inconveniente al conectar con Mercado Pago. Tu pedido ya quedó registrado en el sistema. Podés intentar nuevamente o coordinar tu compra directamente por WhatsApp.'
      );
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="pt-36 pb-20 px-4 text-center max-w-md mx-auto min-h-screen">
        <h2 className="font-montserrat font-black text-2xl uppercase text-navy">
          No hay productos en tu carrito
        </h2>
        <p className="text-xs text-navy/70 mt-2 font-light">
          Agregá prendas desde la tienda para iniciar el proceso de checkout.
        </p>
        <Link
          to="/tienda"
          className="mt-6 inline-flex items-center space-x-2 bg-navy text-white text-xs font-bold uppercase px-6 py-3 rounded-lg hover:bg-navy-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ir a la tienda</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
      <SectionTitle
        overline="Finalizar Compra"
        title="Checkout Seguro"
        subtitle="Completá tus datos de entrega y confirmá tu pedido. Te enviaremos el link de pago oficial de Mercado Pago por WhatsApp."
        align="center"
      />

      {orderComplete ? (
        /* Order Confirmed Screen */
        <div className="bg-[#FAF7F0] rounded-3xl p-8 sm:p-12 border border-beige-300 shadow-xl max-w-2xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-beige-200 text-navy rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12 stroke-[2]" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-navy/60 font-mono">
              Pedido {orderNumber}
            </span>
            <h2 className="font-montserrat font-black text-3xl text-navy uppercase mt-1">
              ¡Gracias por tu compra!
            </h2>
            <p className="text-sm text-navy/80 font-light mt-2 max-w-md mx-auto leading-relaxed">
              Hemos generado tu orden con éxito y te enviamos los detalles a WhatsApp oficial de Veelvet para coordinar el link de Mercado Pago y el despacho.
            </p>
          </div>

          {/* Receipt Summary Card */}
          <div className="bg-beige-100 p-6 rounded-2xl border border-beige-300 text-left space-y-3 text-xs sm:text-sm text-navy">
            <div className="flex justify-between pb-2 border-b border-beige-200">
              <span className="text-navy/70">Método de entrega:</span>
              <strong className="text-right">
                {selectedShipping.name} ({shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)})
              </strong>
            </div>
            <div className="flex justify-between pb-2 border-b border-beige-200">
              <span className="text-navy/70">Medio de pago:</span>
              <strong className="capitalize">Mercado Pago</strong>
            </div>
            <div className="flex justify-between text-base font-montserrat font-black text-navy pt-2">
              <span>Total abonado:</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Primary Action: Direct WhatsApp CTA Button */}
          <div className="pt-2 space-y-3">
            <a
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-montserrat font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2.5 cursor-pointer transform hover:scale-[1.01]"
            >
              <MessageCircle className="w-5 h-5 fill-white stroke-none" />
              <span>Enviar Pedido a WhatsApp ({WHATSAPP_DISPLAY})</span>
            </a>
            <p className="text-[11px] text-navy/60 font-light">
              Si no se abrió WhatsApp automáticamente, hacé clic en el botón verde para enviar los datos de tu orden al número oficial de Veelvet.
            </p>
          </div>

          <div className="pt-3 border-t border-beige-200 flex justify-center">
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 bg-beige-200 text-navy text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-beige-300 transition-colors border border-beige-300"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      ) : (
        /* Checkout Form Grid */
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Customer and Shipping Form */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Contact Information */}
            <div className="bg-[#FAF7F0] p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs space-y-4">
              <h3 className="font-montserrat font-black text-lg text-navy uppercase flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>Datos de Contacto</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="11 1234 5678"
                    className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                    DNI del Titular *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    placeholder="Ej: 38123456"
                    className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Method Selection */}
            <div className="bg-[#FAF7F0] p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs space-y-4">
              <h3 className="font-montserrat font-black text-lg text-navy uppercase flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Método de Envío</span>
              </h3>

              <div className="space-y-3">
                {SHIPPING_METHODS.map((method) => {
                  const isSelected = selectedShipping.id === method.id;

                  return (
                    <label
                      key={method.id}
                      onClick={() => setSelectedShipping(method)}
                      className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-navy bg-beige-50/70 shadow-xs'
                          : 'border-beige-200 hover:border-beige-300 bg-[#FAF7F0]'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          checked={isSelected}
                          onChange={() => setSelectedShipping(method)}
                          className="mt-1 text-navy focus:ring-navy cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-montserrat font-bold text-xs uppercase text-navy">
                              {method.name}
                            </span>
                            {method.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-beige-200 text-navy rounded border border-beige-300">
                                {method.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-navy/60 mt-0.5 font-light">
                            {method.tagline} • Plazo: {method.deliveryTime}
                          </p>
                        </div>
                      </div>

                      <span className="font-montserrat font-black text-xs text-navy whitespace-nowrap ml-2">
                        {method.priceLabel || (method.price === 0 ? 'GRATIS' : formatPrice(method.price))}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Shipping Address or Showroom notice */}
            {selectedShipping.carrier === 'showroom' ? (
              <div className="bg-[#FAF7F0] p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs space-y-4">
                <h3 className="font-montserrat font-black text-lg text-navy uppercase flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>Retiro en Showroom Quilmes Oeste</span>
                </h3>

                <div className="p-4 bg-beige-50 rounded-xl border border-beige-200 space-y-2 text-xs text-navy">
                  <div className="flex items-center space-x-2 font-bold uppercase font-montserrat">
                    <Clock className="w-4 h-4 text-navy" />
                    <span>Lunes a Sábado de 9:00 a 17:00 hs</span>
                  </div>
                  <div className="flex items-center space-x-2 font-semibold text-navy/80">
                    <Users className="w-4 h-4 text-navy" />
                    <span>Máximo 2 personas por seguridad</span>
                  </div>
                  <p className="text-[11px] text-navy/60 font-light pt-1 leading-relaxed">
                    Al confirmar el pedido, te contactamos por WhatsApp para agendar el turno exacto de retiro y enviarte la ubicación del Showroom en Quilmes Oeste.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                      Nombre de quien retira *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Tu nombre"
                      className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Tu apellido"
                      className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAF7F0] p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs space-y-4">
                <h3 className="font-montserrat font-black text-lg text-navy uppercase flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>Dirección de Entrega (Correo Argentino)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Tu nombre"
                      className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Tu apellido"
                      className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                      Calle y Altura *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="Ej: Av. Mitre 1234"
                      className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                      Piso / Dpto
                    </label>
                    <input
                      type="text"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      placeholder="Ej: 4to B"
                      className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      placeholder="Ej: 1878"
                      className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                      Localidad *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Ej: Quilmes"
                      className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                      Provincia *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      placeholder="Buenos Aires"
                      className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                    Aclaraciones para la entrega (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ej: Entre calles, timbre blanco, dejar en portería..."
                    className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3.5 py-2.5 text-navy focus:outline-none focus:border-navy"
                  />
                </div>
              </div>
            )}

            {/* 4. Payment Method Selection */}
            <div className="bg-[#FAF7F0] p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs space-y-4">
              <h3 className="font-montserrat font-black text-lg text-navy uppercase flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold">4</span>
                <span>Forma de Pago</span>
              </h3>

              <div className="space-y-3">
                {/* Mercado Pago */}
                <label
                  onClick={() => setPaymentMethod('mercadopago')}
                  className="flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all border-navy bg-beige-50/80 shadow-xs"
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={true}
                      readOnly
                      className="mt-1 text-navy"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-montserrat font-bold text-xs uppercase text-navy">
                          Mercado Pago
                        </span>
                        <span className="text-[10px] font-bold uppercase text-navy bg-beige-200 px-2 py-0.5 rounded border border-beige-300">
                          Habilitado
                        </span>
                      </div>
                      <p className="text-[11px] text-navy/70 mt-1 font-light leading-relaxed">
                        Aboná con dinero en cuenta, tarjetas de crédito (en cuotas), débito o efectivo mediante la pasarela segura oficial de <strong>Mercado Pago Checkout Pro</strong>.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-beige-100 p-6 sm:p-7 rounded-3xl border border-beige-300 shadow-sm sticky top-28 space-y-5">
              <h3 className="font-montserrat font-black text-lg text-navy uppercase border-b border-beige-300/80 pb-3">
                Resumen de Orden ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.product.images.primary}
                        alt={item.product.name}
                        className="w-12 h-14 object-cover rounded-md bg-[#FAF7F0] border border-beige-300 flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold uppercase font-montserrat text-navy line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-navy/60 text-[11px]">
                          Talle {item.size} • {item.colorName} • Cant: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-navy ml-2">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="pt-4 border-t border-beige-300/80 space-y-2 text-xs text-navy/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Cupón de descuento</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Envío ({selectedShipping.name})</span>
                  <span className="font-semibold text-navy">
                    {shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-montserrat font-black text-navy pt-3 border-t border-beige-300">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-[10px] text-navy/70 text-right">
                    * Incluye tarifa fija de envío Correo Argentino ({formatPrice(shippingCost)})
                  </p>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-navy hover:bg-navy-500 disabled:opacity-70 text-white font-montserrat font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Conectando con Mercado Pago...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pagar con Mercado Pago ({formatPrice(finalTotal)})</span>
                  </>
                )}
              </button>

              {submitError && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-xs text-red-800 text-center space-y-1.5">
                  <p className="font-semibold">{submitError}</p>
                  {whatsappOrderUrl && (
                    <a
                      href={whatsappOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-green-800 hover:text-green-900 underline font-bold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Coordinar pedido por WhatsApp</span>
                    </a>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-navy/60 text-center">
                <ShieldCheck className="w-4 h-4 text-navy/70" />
                <span>Sitio seguro con encriptación SSL • Mercado Pago</span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
