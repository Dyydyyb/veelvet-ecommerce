import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Tag, MessageCircle } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { WHATSAPP_BASE_URL } from '../../config/constants';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getSubtotal,
    getDiscount,
    getTotal,
    promoCode,
    discountPercentage,
    applyPromoCode,
    removePromoCode,
    getFreeShippingProgress,
  } = useCartStore();

  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();
  const freeShipping = getFreeShippingProgress();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyPromoCode(inputCode);
    setPromoMessage({ text: res.message, isError: !res.success });
    if (res.success) setInputCode('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9995] overflow-hidden">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-navy/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-[#f3eee3] shadow-2xl flex flex-col justify-between border-l border-beige-300"
            >
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 border-b border-beige-300/80 bg-[#f3eee3]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5 text-navy" />
                    <h2 className="font-montserrat font-black text-lg text-navy uppercase tracking-tight">
                      Tu Carrito ({items.reduce((acc, i) => acc + i.quantity, 0)})
                    </h2>
                  </div>
                  <button
                    onClick={closeCart}
                    className="p-1.5 text-navy/60 hover:text-navy hover:bg-beige-200 rounded-full transition-colors"
                    aria-label="Cerrar carrito"
                  >
                    <X className="w-5 h-5 stroke-[2]" />
                  </button>
                </div>

                {/* Shipping Info Notice */}
                <div className="mt-4 pt-3 border-t border-beige-200">
                  <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-navy">
                    <Truck className="w-3.5 h-3.5 text-navy flex-shrink-0" />
                    <span>Envíos por Correo Argentino (costo a calcular) • Retiro en Showroom</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 bg-beige-100 rounded-full flex items-center justify-center text-navy/40 mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="font-montserrat font-bold text-navy uppercase tracking-tight text-base">
                      Tu carrito está vacío
                    </p>
                    <p className="text-xs text-navy/60 mt-1 max-w-xs font-light">
                      Descubrí nuestras siluetas esenciales de frisa pesada y calce unisex.
                    </p>
                    <button
                      onClick={closeCart}
                      className="mt-6 text-xs font-bold uppercase tracking-wider bg-navy text-white hover:bg-navy-500 py-3 px-6 rounded-md transition-colors"
                    >
                      Explorar colección
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex space-x-4 p-3 bg-beige-50/60 rounded-xl border border-beige-200"
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.product.images.primary}
                        alt={item.product.name}
                        className="w-20 h-24 object-cover rounded-lg bg-beige-200 border border-beige-300/80 flex-shrink-0"
                      />

                      {/* Info & Controls */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <h3 className="font-montserrat font-bold text-xs uppercase tracking-tight text-navy line-clamp-1">
                              {item.product.name}
                            </h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-navy/40 hover:text-red-600 transition-colors p-1"
                              aria-label="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Selected attributes */}
                          <div className="flex items-center space-x-2 mt-1 text-[11px] text-navy/70">
                            <span className="font-bold bg-white px-1.5 py-0.5 rounded border border-beige-300">
                              Talle {item.size}
                            </span>
                            <span className="flex items-center space-x-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-beige-400 inline-block"
                                style={{ backgroundColor: item.colorHex }}
                              />
                              <span>{item.colorName}</span>
                            </span>
                          </div>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-beige-300 rounded-md bg-white">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 text-navy/70 hover:text-navy hover:bg-beige-100 transition-colors"
                              aria-label="Restar una unidad"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-navy">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 text-navy/70 hover:text-navy hover:bg-beige-100 transition-colors"
                              aria-label="Sumar una unidad"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="font-montserrat font-black text-sm text-navy">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Drawer Footer with Calculations */}
              {items.length > 0 && (
                <div className="p-5 sm:p-6 border-t border-beige-300 bg-[#f3eee3] space-y-4">
                  {/* Promo code form */}
                  <div>
                    {promoCode ? (
                      <div className="flex items-center justify-between bg-beige-100 px-3 py-2 rounded-lg text-xs font-semibold text-navy border border-beige-300">
                        <span className="flex items-center space-x-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Cupón <strong>{promoCode}</strong> ({(discountPercentage * 100).toFixed(0)}% OFF)</span>
                        </span>
                        <button
                          onClick={removePromoCode}
                          className="text-navy/50 hover:text-red-600 text-[11px] underline"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyPromo} className="flex space-x-2">
                        <input
                          type="text"
                          value={inputCode}
                          onChange={(e) => setInputCode(e.target.value)}
                          placeholder="Cupón de descuento (ej: SIMPLEMENTE)"
                          className="flex-1 text-xs bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy uppercase placeholder:normal-case focus:outline-none focus:border-navy"
                        />
                        <button
                          type="submit"
                          className="bg-beige-200 hover:bg-beige-300 text-navy font-bold text-xs px-3.5 py-2 rounded-lg transition-colors border border-beige-300"
                        >
                          Aplicar
                        </button>
                      </form>
                    )}
                    {promoMessage && (
                      <p className={`text-[11px] mt-1.5 ${promoMessage.isError ? 'text-red-600' : 'text-green-700'}`}>
                        {promoMessage.text}
                      </p>
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-1.5 text-xs text-navy/80 pt-2 border-t border-beige-200">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-navy">{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-700 font-semibold">
                        <span>Descuento aplicado</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Envío</span>
                      <span className="text-navy/70 font-medium">A calcular al finalizar</span>
                    </div>
                    <div className="flex justify-between text-base font-montserrat font-black text-navy pt-2 border-t border-beige-300">
                      <span>Total estimado</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="w-full py-4 bg-navy hover:bg-navy-500 text-white font-montserrat font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                  >
                    <span>Iniciar compra</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* Direct WhatsApp Option */}
                  <a
                    href={`${WHATSAPP_BASE_URL}?text=${encodeURIComponent(
                      `¡Hola Veelvet! 👋 Tengo ${items.length} prenda(s) en mi carrito por un total estimado de ${formatPrice(total)} y quisiera coordinar el pedido:\n` +
                      items.map((i) => `• ${i.quantity}x ${i.product.name} (Talle: ${i.size})`).join('\n')
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-montserrat font-bold text-[11px] uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-2 border border-[#25D366]/30 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>Pedir por WhatsApp</span>
                  </a>

                  <p className="text-[10px] text-center text-navy/60">
                    Compra protegida • Cuotas sin interés • Envíos a todo el país
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
