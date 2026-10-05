import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { SHIPPING_METHODS, ShippingMethod } from '../data/shippingMethods';
import { SectionTitle } from '../components/common/SectionTitle';
import { Truck, MapPin, CheckCircle2, ShieldCheck, CreditCard, ArrowLeft, ArrowRight, Lock, MessageCircle } from 'lucide-react';
import { WHATSAPP_DISPLAY, getWhatsAppLink } from '../config/constants';
import confetti from 'canvas-confetti';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getSubtotal, getDiscount, clearCart, getFreeShippingProgress } = useCartStore();

  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(SHIPPING_METHODS[0]);
  const [paymentMethod, setPaymentMethod] = useState<'transferencia' | 'tarjeta' | 'mercadopago'>('transferencia');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [whatsappOrderUrl, setWhatsappOrderUrl] = useState('');
  const [orderItemsSnapshot, setOrderItemsSnapshot] = useState<typeof items>([]);

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
  const freeShipping = getFreeShippingProgress();

  // If free shipping applies, shipping cost is 0
  const shippingCost = freeShipping.isFree ? 0 : selectedShipping.price;

  // Extra 10% off if bank transfer is selected
  const transferDiscount = paymentMethod === 'transferencia' ? (subtotal - discount) * 0.1 : 0;
  const finalTotal = subtotal - discount - transferDiscount + shippingCost;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const randomId = 'VVT-' + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(randomId);

    // Snapshot cart items before clearing
    const currentItems = [...items];
    setOrderItemsSnapshot(currentItems);

    const itemsSummary = currentItems
      .map(
        (item) =>
          `• ${item.quantity}x ${item.product.name} (Talle: ${item.size} | Color: ${item.colorName}) - ${formatPrice(
            item.product.price * item.quantity
          )}`
      )
      .join('\n');

    const paymentLabel =
      paymentMethod === 'transferencia'
        ? 'Transferencia Bancaria (10% OFF aplicado)'
        : paymentMethod === 'tarjeta'
        ? 'Tarjeta en cuotas'
        : 'Mercado Pago';

    const orderMessage =
      `*NUEVO PEDIDO VEELVET* 🛍️\n` +
      `*Orden:* #${randomId}\n\n` +
      `👤 *Datos del Comprador:*\n` +
      `• Nombre: ${formData.name} ${formData.lastName}\n` +
      `• DNI: ${formData.dni}\n` +
      `• Teléfono: ${formData.phone}\n` +
      `• Email: ${formData.email}\n` +
      `• Entrega: ${formData.street} ${formData.number}${formData.floor ? ' Depto ' + formData.floor : ''}, ${formData.city}, ${formData.province} (CP ${formData.postalCode})\n` +
      (formData.notes ? `• Notas: ${formData.notes}\n` : '') +
      `\n📦 *Prendas del Pedido:*\n${itemsSummary}\n\n` +
      `🚚 *Método de Envío:* ${selectedShipping.name} (${shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)})\n` +
      `💳 *Medio de Pago:* ${paymentLabel}\n` +
      (transferDiscount > 0 ? `🎁 *Descuento Transferencia:* -${formatPrice(transferDiscount)}\n` : '') +
      (discount > 0 ? `🎟️ *Descuento Cupón:* -${formatPrice(discount)}\n` : '') +
      `💰 *TOTAL A PAGAR:* ${formatPrice(finalTotal)}\n\n` +
      `¡Hola Veelvet! 👋 Acabo de realizar este pedido en la tienda online. Les envío los datos para coordinar el pago y la entrega. ¡Muchas gracias!`;

    const waUrl = getWhatsAppLink(orderMessage);
    setWhatsappOrderUrl(waUrl);
    setOrderComplete(true);

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1B2A4A', '#F0EDE3', '#2F4A8A', '#D9CFB4'],
      });
    } catch {
      // ignore
    }

    // Automatically redirect to WhatsApp in a new tab/window
    try {
      window.open(waUrl, '_blank');
    } catch (err) {
      console.warn('Popup blocked, customer can click the button:', err);
    }

    clearCart();
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
        subtitle="Completá tus datos de entrega y seleccioná el medio de pago. No se realizará ningún cobro real (entorno de demostración)."
        align="center"
      />

      {orderComplete ? (
        /* Order Confirmed Screen */
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-beige-300 shadow-xl max-w-2xl mx-auto text-center space-y-6">
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
              Hemos generado tu orden con éxito y te enviamos los detalles a WhatsApp oficial de Veelvet para coordinar el pago y despacho.
            </p>
          </div>

          {/* Receipt Summary Card */}
          <div className="bg-beige-100 p-6 rounded-2xl border border-beige-300 text-left space-y-3 text-xs sm:text-sm text-navy">
            <div className="flex justify-between pb-2 border-b border-beige-200">
              <span className="text-navy/70">Método de entrega:</span>
              <strong className="text-right">{selectedShipping.name}</strong>
            </div>
            <div className="flex justify-between pb-2 border-b border-beige-200">
              <span className="text-navy/70">Medio de pago:</span>
              <strong className="capitalize">
                {paymentMethod === 'transferencia' ? 'Transferencia Bancaria (10% OFF)' : paymentMethod === 'tarjeta' ? 'Tarjeta en cuotas' : 'Mercado Pago'}
              </strong>
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
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs space-y-4">
              <h3 className="font-montserrat font-black text-lg text-navy uppercase flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>Datos de Contacto</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>
            </div>

            {/* 2. Shipping Method Selection */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs space-y-4">
              <h3 className="font-montserrat font-black text-lg text-navy uppercase flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Método de Envío</span>
              </h3>

              <div className="space-y-3">
                {SHIPPING_METHODS.map((method) => {
                  const isFree = freeShipping.isFree;
                  const effectivePrice = isFree ? 0 : method.price;

                  return (
                    <label
                      key={method.id}
                      onClick={() => setSelectedShipping(method)}
                      className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedShipping.id === method.id
                          ? 'border-navy bg-beige-50/70 shadow-xs'
                          : 'border-beige-200 hover:border-beige-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          checked={selectedShipping.id === method.id}
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
                        {effectivePrice === 0 ? 'GRATIS' : formatPrice(effectivePrice)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Shipping Address (If not picking up at showroom) */}
            {selectedShipping.carrier !== 'showroom' && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs space-y-4">
                <h3 className="font-montserrat font-black text-lg text-navy uppercase flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>Dirección de Entrega</span>
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
                      placeholder="Ej: Quilmes Oeste"
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
              </div>
            )}

            {/* 4. Payment Method Selection */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs space-y-4">
              <h3 className="font-montserrat font-black text-lg text-navy uppercase flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center font-bold">
                  {selectedShipping.carrier === 'showroom' ? '3' : '4'}
                </span>
                <span>Forma de Pago</span>
              </h3>

              <div className="space-y-3">
                {/* Transferencia */}
                <label
                  onClick={() => setPaymentMethod('transferencia')}
                  className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'transferencia'
                      ? 'border-navy bg-beige-50 shadow-xs'
                      : 'border-beige-200 bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'transferencia'}
                      onChange={() => setPaymentMethod('transferencia')}
                      className="mt-1 text-navy"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-montserrat font-bold text-xs uppercase text-navy">
                          Transferencia Bancaria Inmediata
                        </span>
                        <span className="text-[10px] font-black uppercase text-green-800 bg-green-100 px-2 py-0.5 rounded">
                          10% OFF
                        </span>
                      </div>
                      <p className="text-[11px] text-navy/60 mt-0.5 font-light">
                        Te enviamos los datos de CBU/Alias. Enviar el comprobante por WhatsApp.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Tarjetas */}
                <label
                  onClick={() => setPaymentMethod('tarjeta')}
                  className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'tarjeta'
                      ? 'border-navy bg-beige-50 shadow-xs'
                      : 'border-beige-200 bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'tarjeta'}
                      onChange={() => setPaymentMethod('tarjeta')}
                      className="mt-1 text-navy"
                    />
                    <div>
                      <span className="font-montserrat font-bold text-xs uppercase text-navy">
                        Tarjeta de Crédito / Débito
                      </span>
                      <p className="text-[11px] text-navy/60 mt-0.5 font-light">
                        Hasta 3 cuotas fijas sin interés con Visa, Mastercard y Cabal.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Mercado Pago */}
                <label
                  onClick={() => setPaymentMethod('mercadopago')}
                  className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'mercadopago'
                      ? 'border-navy bg-beige-50 shadow-xs'
                      : 'border-beige-200 bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'mercadopago'}
                      onChange={() => setPaymentMethod('mercadopago')}
                      className="mt-1 text-navy"
                    />
                    <div>
                      <span className="font-montserrat font-bold text-xs uppercase text-navy">
                        Mercado Pago
                      </span>
                      <p className="text-[11px] text-navy/60 mt-0.5 font-light">
                        Dinero en cuenta, débito o crédito mediante checkout oficial.
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
                        className="w-12 h-14 object-cover rounded-md bg-white border border-beige-300 flex-shrink-0"
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
                {transferDiscount > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>10% OFF Transferencia</span>
                    <span>-{formatPrice(transferDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Envío ({selectedShipping.name})</span>
                  <span>{shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-lg font-montserrat font-black text-navy pt-3 border-t border-beige-300">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 bg-navy hover:bg-navy-500 text-white font-montserrat font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-md cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Confirmar pedido ({formatPrice(finalTotal)})</span>
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-navy/60 text-center">
                <ShieldCheck className="w-4 h-4 text-navy/70" />
                <span>Sitio seguro con encriptación SSL de 256 bits</span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
