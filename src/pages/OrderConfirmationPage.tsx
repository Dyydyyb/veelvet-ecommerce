import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, ShoppingBag, Truck, MapPin, MessageCircle, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCartStore } from '../store/cartStore';
import { OrderService } from '../services/orderService';
import { Pedido } from '../lib/supabase';
import { WHATSAPP_DISPLAY, getWhatsAppLink } from '../config/constants';

export function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartStore();

  const orderNumber = searchParams.get('order_number') || searchParams.get('external_reference') || '';
  const statusParam = searchParams.get('status') || searchParams.get('collection_status') || 'success';
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || '';

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  const isApproved = statusParam === 'success' || statusParam === 'approved';
  const isPending = statusParam === 'pending' || statusParam === 'in_process';
  const isFailure = statusParam === 'failure' || statusParam === 'rejected';

  useEffect(() => {
    // Vaciar el carrito si el pago fue aprobado o quedó pendiente de acreditación
    if (isApproved || isPending) {
      clearCart();
    }

    if (isApproved) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1F2A44', '#D4AF37', '#FAF7F0', '#2E7D32'],
        });
      } catch (e) {
        // Ignorar si falla confetti
      }
    }

    if (orderNumber) {
      setLoading(true);
      OrderService.getPedidoByOrderNumber(orderNumber).then((p) => {
        if (p) {
          setPedido(p);
          // Si el retorno de MP indica aprobado y en la base aún estaba pendiente, actualizarlo
          if (isApproved && p.estado_pago !== 'aprobado') {
            OrderService.updatePedidoPayment(orderNumber, 'aprobado', paymentId);
          }
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [orderNumber, isApproved, isPending, paymentId, clearCart]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const whatsappMessage = `¡Hola Veelvet! 👋 Acabo de abonar mi pedido #${orderNumber || 'Online'} con Mercado Pago.${
    paymentId ? ` (Comprobante MP: #${paymentId})` : ''
  } Les escribo para coordinar los detalles de entrega. ¡Muchas gracias!`;

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#FAF7F0] border border-beige-300 rounded-3xl p-6 sm:p-10 shadow-lg text-center"
      >
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {isApproved && (
            <div className="w-20 h-20 bg-green-100 border border-green-300 rounded-full flex items-center justify-center text-green-700 shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
          )}
          {isPending && (
            <div className="w-20 h-20 bg-amber-100 border border-amber-300 rounded-full flex items-center justify-center text-amber-700 shadow-inner">
              <Clock className="w-10 h-10 stroke-[2.5]" />
            </div>
          )}
          {isFailure && (
            <div className="w-20 h-20 bg-red-100 border border-red-300 rounded-full flex items-center justify-center text-red-700 shadow-inner">
              <AlertTriangle className="w-10 h-10 stroke-[2.5]" />
            </div>
          )}
        </div>

        {/* Title */}
        <span className="text-xs uppercase font-bold tracking-widest text-navy/60 font-montserrat">
          Mercado Pago Checkout Pro
        </span>
        <h1 className="font-montserrat font-black text-2xl sm:text-3xl text-navy uppercase tracking-tight mt-1 mb-3">
          {isApproved && '¡Pago Confirmado con Éxito!'}
          {isPending && 'Pago en Proceso de Acreditación'}
          {isFailure && 'No se pudo completar el pago'}
        </h1>

        <p className="text-sm text-navy/70 max-w-lg mx-auto mb-6 leading-relaxed">
          {isApproved &&
            'Hemos recibido tu pago a través de Mercado Pago de forma 100% segura. Tu orden ya está ingresada en el sistema de Veelvet para ser preparada.'}
          {isPending &&
            'Tu pago está siendo procesado por Mercado Pago (por ejemplo si abonaste por Rapipago o Pago Fácil). Te notificaremos cuando se acredite.'}
          {isFailure &&
            'La operación fue cancelada o rechazada por la entidad emisora. Podés reintentar con otra tarjeta o medio de pago.'}
        </p>

        {/* Order Identifier Box */}
        {orderNumber && (
          <div className="bg-[#f3eee3] border border-beige-300/90 rounded-2xl p-4 sm:p-5 mb-8 inline-block text-left w-full max-w-md mx-auto">
            <div className="flex items-center justify-between border-b border-beige-300 pb-2 mb-2 text-xs">
              <span className="font-bold text-navy/70 uppercase">Número de Pedido:</span>
              <span className="font-mono font-black text-sm text-navy tracking-wider">#{orderNumber}</span>
            </div>
            {paymentId && (
              <div className="flex items-center justify-between border-b border-beige-300 pb-2 mb-2 text-xs">
                <span className="text-navy/60 uppercase">Comprobante Mercado Pago:</span>
                <span className="font-mono text-navy/80 font-bold">#{paymentId}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-navy/60 uppercase">Estado:</span>
              <span
                className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[10px] ${
                  isApproved
                    ? 'bg-green-700 text-white'
                    : isPending
                    ? 'bg-amber-600 text-white'
                    : 'bg-red-700 text-white'
                }`}
              >
                {isApproved ? 'Aprobado' : isPending ? 'Pendiente' : 'Rechazado'}
              </span>
            </div>
          </div>
        )}

        {/* Order Details (if loaded) */}
        {pedido && (
          <div className="bg-[#f3eee3]/60 border border-beige-300/70 rounded-2xl p-5 mb-8 text-left">
            <h3 className="font-montserrat font-bold text-xs uppercase tracking-wider text-navy mb-3">
              Resumen del Pedido
            </h3>
            <div className="space-y-2 mb-4 text-xs">
              {pedido.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between border-b border-beige-200/60 pb-2">
                  <div className="flex items-center space-x-2">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded bg-beige-200" />
                    )}
                    <div>
                      <p className="font-bold text-navy line-clamp-1">{item.name}</p>
                      <p className="text-navy/60 text-[10px]">
                        Talle: {item.size} • Color: {item.colorName} • Cant: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-navy">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-beige-300 flex justify-between items-baseline text-sm">
              <span className="font-montserrat font-bold uppercase text-navy">Total Abonado:</span>
              <span className="font-montserrat font-black text-base text-navy">{formatPrice(pedido.total)}</span>
            </div>

            {/* Delivery address */}
            <div className="mt-4 pt-4 border-t border-beige-200/80 text-xs text-navy/80">
              <p className="font-bold uppercase tracking-wider text-[10px] text-navy/60 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> Entrega:
              </p>
              <p>{pedido.metodo_envio}</p>
              {pedido.direccion_calle && (
                <p className="text-navy/60 text-[11px] mt-0.5">
                  {pedido.direccion_calle} {pedido.direccion_numero}{pedido.direccion_piso_depto ? ` (Depto ${pedido.direccion_piso_depto})` : ''}, {pedido.direccion_ciudad}, {pedido.direccion_provincia} (CP {pedido.direccion_cp})
                </p>
              )}
            </div>
          </div>
        )}

        {/* WhatsApp & Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={getWhatsAppLink(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-montserrat font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Avisar a WhatsApp Veelvet</span>
          </a>

          <Link
            to="/tienda"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-navy hover:bg-navy-500 text-white text-xs font-montserrat font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <span>Volver a la Tienda</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
