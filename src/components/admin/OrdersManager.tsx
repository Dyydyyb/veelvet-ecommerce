import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Truck,
  MapPin,
  ExternalLink,
  Plus,
  RefreshCw,
  MessageCircle,
  Trash2,
  Eye,
  Edit2,
  Copy,
  DollarSign,
  User,
  Phone,
  Mail,
  Calendar,
  X,
  Check
} from 'lucide-react';
import { supabase, Pedido, PedidoItem, Producto } from '../../lib/supabase';
import { OrderService } from '../../services/orderService';
import { getWhatsAppLink } from '../../config/constants';

interface OrdersManagerProps {
  productos: Producto[];
}

export function OrdersManager({ productos }: OrdersManagerProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'aprobado' | 'pendiente' | 'rechazado'>('todos');
  const [rlsBlocked, setRlsBlocked] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Modal States
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Manual Order Form State
  const [manualForm, setManualForm] = useState({
    cliente_nombre: '',
    cliente_apellido: '',
    cliente_email: '',
    cliente_telefono: '',
    cliente_dni: '',
    direccion_calle: '',
    direccion_numero: '',
    direccion_piso_depto: '',
    direccion_ciudad: '',
    direccion_provincia: 'Buenos Aires',
    direccion_cp: '',
    metodo_envio: 'Retiro en Showroom Quilmes Oeste',
    costo_envio: 0,
    estado_pago: 'aprobado' as 'pendiente' | 'aprobado' | 'rechazado',
    notas: '',
  });

  const [manualItems, setManualItems] = useState<PedidoItem[]>([]);
  const [selectedProdId, setSelectedProdId] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Negro');
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number>(0);

  const loadPedidos = async () => {
    setLoading(true);
    const data = await OrderService.getPedidos();
    setPedidos(data);
    setLoading(false);

    // Sonda para verificar si RLS en Supabase bloquea los inserts en la tabla pedidos
    try {
      const probeOrder = {
        order_number: '__probe_' + Date.now(),
        cliente_nombre: 'probe',
        cliente_email: 'probe@veelvet.com',
        metodo_envio: 'probe',
        items: [],
        subtotal: 0,
        total: 0,
      };
      const { error } = await supabase.from('pedidos').insert([probeOrder]);
      if (error && error.code === '42501') {
        setRlsBlocked(true);
      } else if (!error) {
        setRlsBlocked(false);
        await supabase.from('pedidos').delete().eq('order_number', probeOrder.order_number);
      }
    } catch {
      // Ignorar fallos de red
    }
  };

  useEffect(() => {
    loadPedidos();
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Reciente';
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateString;
    }
  };

  // Filtered orders
  const filteredPedidos = useMemo(() => {
    return pedidos.filter((p) => {
      if (statusFilter !== 'todos' && p.estado_pago !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = p.order_number?.toLowerCase().includes(q);
        const matchName = `${p.cliente_nombre} ${p.cliente_apellido || ''}`.toLowerCase().includes(q);
        const matchEmail = p.cliente_email?.toLowerCase().includes(q);
        const matchPhone = p.cliente_telefono?.toLowerCase().includes(q);
        const matchDni = p.cliente_dni?.toLowerCase().includes(q);
        const matchCity = p.direccion_ciudad?.toLowerCase().includes(q);
        return matchNumber || matchName || matchEmail || matchPhone || matchDni || matchCity;
      }
      return true;
    });
  }, [pedidos, statusFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const totalCount = pedidos.length;
    const aprobados = pedidos.filter((p) => p.estado_pago === 'aprobado');
    const pendientes = pedidos.filter((p) => p.estado_pago === 'pendiente');
    const totalFacturado = aprobados.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
    return {
      totalCount,
      aprobadosCount: aprobados.length,
      pendientesCount: pendientes.length,
      totalFacturado,
    };
  }, [pedidos]);

  // Handle status update
  const handleUpdateStatus = async (
    orderNumber: string,
    newStatus: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado'
  ) => {
    const ok = await OrderService.updatePedidoPayment(orderNumber, newStatus);
    if (ok) {
      setPedidos((prev) =>
        prev.map((p) => (p.order_number === orderNumber ? { ...p, estado_pago: newStatus } : p))
      );
      if (selectedPedido && selectedPedido.order_number === orderNumber) {
        setSelectedPedido({ ...selectedPedido, estado_pago: newStatus });
      }
      setActionSuccess(`Estado de orden #${orderNumber} actualizado a ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  // Handle delete order
  const handleDeletePedido = async (p: Pedido) => {
    if (!window.confirm(`¿Seguro que deseás eliminar el pedido #${p.order_number}?`)) return;
    const ok = await OrderService.deletePedido({ id: p.id, order_number: p.order_number });
    if (ok) {
      setPedidos((prev) =>
        prev.filter((item) => {
          if (p.order_number && item.order_number === p.order_number) return false;
          if (p.id && item.id === p.id) return false;
          return true;
        })
      );
      if (
        selectedPedido &&
        (selectedPedido.order_number === p.order_number || (p.id && selectedPedido.id === p.id))
      ) {
        setSelectedPedido(null);
      }
      setActionSuccess(`Pedido #${p.order_number} eliminado correctamente`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  // WhatsApp link for order
  const getOrderWhatsAppLink = (p: Pedido) => {
    const phone = p.cliente_telefono?.replace(/\D/g, '') || '';
    const msg = `¡Hola ${p.cliente_nombre}! Te escribimos desde Veelvet Official respecto a tu orden #${p.order_number}. Total: ${formatPrice(p.total)}.`;
    return `https://wa.me/${phone.startsWith('54') ? phone : '549' + phone}?text=${encodeURIComponent(msg)}`;
  };

  // Add Item to Manual Order
  const handleAddManualItem = () => {
    if (!selectedProdId) return;
    const prod = productos.find((p) => p.id === selectedProdId);
    if (!prod) return;

    const unitPrice = customPrice > 0 ? customPrice : prod.precio;
    const newItem: PedidoItem = {
      productId: prod.id,
      name: prod.nombre,
      size: selectedSize,
      colorName: selectedColor,
      price: unitPrice,
      quantity: selectedQty,
      image: Array.isArray(prod.imagenes_url) ? prod.imagenes_url[0] : prod.imagenes_url?.urls?.[0] || '',
    };

    setManualItems((prev) => [...prev, newItem]);
    setSelectedProdId('');
    setCustomPrice(0);
    setSelectedQty(1);
  };

  // Submit Manual Order
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualItems.length === 0) {
      alert('Debés agregar al menos una prenda al pedido.');
      return;
    }

    const subtotal = manualItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const total = subtotal + Number(manualForm.costo_envio || 0);
    const orderNumber = `VVT-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPedido: Pedido = {
      order_number: orderNumber,
      cliente_nombre: manualForm.cliente_nombre,
      cliente_apellido: manualForm.cliente_apellido,
      cliente_email: manualForm.cliente_email,
      cliente_telefono: manualForm.cliente_telefono,
      cliente_dni: manualForm.cliente_dni,
      direccion_calle: manualForm.direccion_calle,
      direccion_numero: manualForm.direccion_numero,
      direccion_piso_depto: manualForm.direccion_piso_depto,
      direccion_ciudad: manualForm.direccion_ciudad,
      direccion_provincia: manualForm.direccion_provincia,
      direccion_cp: manualForm.direccion_cp,
      notas: manualForm.notas,
      metodo_envio: manualForm.metodo_envio,
      costo_envio: Number(manualForm.costo_envio || 0),
      items: manualItems,
      subtotal,
      descuento: 0,
      total,
      estado_pago: manualForm.estado_pago,
      mp_status_detail: 'Generado manualmente desde panel administrador',
    };

    const saved = await OrderService.createPedido(newPedido);
    if (saved) {
      setPedidos((prev) => [saved, ...prev]);
      setIsManualModalOpen(false);
      setManualItems([]);
      setManualForm({
        cliente_nombre: '',
        cliente_apellido: '',
        cliente_email: '',
        cliente_telefono: '',
        cliente_dni: '',
        direccion_calle: '',
        direccion_numero: '',
        direccion_piso_depto: '',
        direccion_ciudad: '',
        direccion_provincia: 'Buenos Aires',
        direccion_cp: '',
        metodo_envio: 'Retiro en Showroom Quilmes Oeste',
        costo_envio: 0,
        estado_pago: 'aprobado',
        notas: '',
      });
      setActionSuccess(`¡Pedido manual #${orderNumber} creado exitosamente!`);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-fade-in">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="p-1 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* RLS Warning / Setup Banner */}
      {rlsBlocked && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs animate-fade-in">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Activar sincronización de pedidos en Supabase</p>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                Para que todos los pedidos e intentos de compra se guarden en la base de datos central de Supabase, ejecutá una única vez la siguiente instrucción en tu Supabase SQL Editor.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={() => {
                navigator.clipboard.writeText('ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;');
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 3000);
              }}
              className="px-3.5 py-2 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-lg transition-colors flex items-center space-x-1.5 text-xs cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSql ? '¡Comando copiado!' : 'Copiar comando SQL'}</span>
            </button>
            <a
              href="https://supabase.com/dashboard/project/ikuwvjvhtbouafjayrvj/sql"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-navy text-white font-bold rounded-lg hover:bg-navy-500 transition-colors flex items-center space-x-1.5 text-xs"
            >
              <span>Abrir Supabase SQL</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Metrics Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-beige-300 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy/60">Total Pedidos</p>
            <p className="font-montserrat font-black text-2xl text-navy mt-1">{metrics.totalCount}</p>
          </div>
          <div className="w-12 h-12 bg-beige-100 rounded-xl flex items-center justify-center text-navy">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Approved Orders */}
        <div className="bg-white p-5 rounded-2xl border border-beige-300 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-green-700">Pagados / Aprobados</p>
            <p className="font-montserrat font-black text-2xl text-green-700 mt-1">{metrics.aprobadosCount}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-beige-300 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pendientes</p>
            <p className="font-montserrat font-black text-2xl text-amber-700 mt-1">{metrics.pendientesCount}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-beige-300 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-navy/60">Total Cobrado</p>
            <p className="font-montserrat font-black text-xl text-navy mt-1">{formatPrice(metrics.totalFacturado)}</p>
          </div>
          <div className="w-12 h-12 bg-beige-100 rounded-xl flex items-center justify-center text-navy">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Action Button */}
      <div className="bg-white p-5 rounded-2xl border border-beige-300 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-navy/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por orden, cliente, email o DNI..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-beige-50 border border-beige-300 rounded-lg text-navy focus:outline-none focus:border-navy"
          />
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Status Filters */}
          <div className="flex bg-beige-100 p-1 rounded-lg border border-beige-300 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'todos' ? 'bg-navy text-white shadow-xs' : 'text-navy/70 hover:text-navy'
              }`}
            >
              Todos ({pedidos.length})
            </button>
            <button
              onClick={() => setStatusFilter('aprobado')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'aprobado' ? 'bg-green-700 text-white shadow-xs' : 'text-navy/70 hover:text-navy'
              }`}
            >
              Aprobados ({metrics.aprobadosCount})
            </button>
            <button
              onClick={() => setStatusFilter('pendiente')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'pendiente' ? 'bg-amber-600 text-white shadow-xs' : 'text-navy/70 hover:text-navy'
              }`}
            >
              Pendientes ({metrics.pendientesCount})
            </button>
          </div>

          <button
            onClick={loadPedidos}
            disabled={loading}
            className="p-2 border border-beige-300 text-navy hover:bg-beige-100 rounded-lg transition-colors cursor-pointer"
            title="Recargar pedidos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Create Manual Order CTA */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-navy hover:bg-navy-500 text-white text-xs font-montserrat font-bold uppercase tracking-wider px-4 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generar Pedido Manual</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-beige-300 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-navy/60 font-semibold flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-navy" />
            <span>Cargando pedidos de Supabase...</span>
          </div>
        ) : filteredPedidos.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-navy/30 mx-auto mb-3" />
            <p className="font-montserrat font-bold text-navy text-sm uppercase">No hay pedidos para mostrar</p>
            <p className="text-xs text-navy/60 mt-1 font-light">
              {searchQuery ? 'No encontramos pedidos que coincidan con la búsqueda.' : 'Los pedidos de Mercado Pago y manuales aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-beige-100 border-b border-beige-300 text-navy font-montserrat font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Orden / Fecha</th>
                  <th className="py-3.5 px-4">Comprador</th>
                  <th className="py-3.5 px-4">Prendas</th>
                  <th className="py-3.5 px-4">Entrega</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200/80">
                {filteredPedidos.map((p) => {
                  const itemCount = p.items?.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0) || 0;
                  return (
                    <tr key={p.id || p.order_number} className="hover:bg-beige-50/70 transition-colors">
                      {/* Order number & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-navy text-xs block">#{p.order_number}</span>
                        <span className="text-[10px] text-navy/50">{formatDate(p.created_at)}</span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-navy block">
                          {p.cliente_nombre} {p.cliente_apellido || ''}
                        </span>
                        <span className="text-[10px] text-navy/60 block">{p.cliente_email}</span>
                        {p.cliente_telefono && (
                          <span className="text-[10px] text-navy/50 font-mono block">Tel: {p.cliente_telefono}</span>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          {p.items?.[0]?.image && (
                            <img
                              src={p.items[0].image}
                              alt={p.items[0].name}
                              className="w-8 h-10 object-cover rounded bg-beige-200 border border-beige-300"
                            />
                          )}
                          <div>
                            <span className="font-semibold text-navy line-clamp-1 max-w-[160px]">
                              {p.items?.[0]?.name || 'Prenda'}
                            </span>
                            <span className="text-[10px] text-navy/50">
                              {itemCount} {itemCount === 1 ? 'prenda' : 'prendas'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Shipping */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-navy block line-clamp-1">{p.metodo_envio}</span>
                        {p.direccion_ciudad && (
                          <span className="text-[10px] text-navy/50 block">
                            {p.direccion_ciudad}, {p.direccion_provincia || ''}
                          </span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-mono font-bold text-navy text-xs">
                        {formatPrice(p.total)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={p.estado_pago}
                          onChange={(e) => handleUpdateStatus(p.order_number, e.target.value as any)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border cursor-pointer ${
                            p.estado_pago === 'aprobado'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : p.estado_pago === 'pendiente'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="aprobado">Aprobado</option>
                          <option value="rechazado">Rechazado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* View Detail */}
                          <button
                            onClick={() => setSelectedPedido(p)}
                            className="p-1.5 text-navy/70 hover:text-navy hover:bg-beige-200 rounded-md transition-colors"
                            title="Ver detalle completo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* WhatsApp */}
                          {p.cliente_telefono && (
                            <a
                              href={getOrderWhatsAppLink(p)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors"
                              title="Enviar mensaje de WhatsApp al comprador"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDeletePedido(p)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Eliminar orden"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Detalle Completo de la Orden */}
      {selectedPedido && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF7F0] border border-beige-300 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setSelectedPedido(null)}
              className="absolute top-5 right-5 p-2 text-navy/50 hover:text-navy hover:bg-beige-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="border-b border-beige-300 pb-4 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-navy/60 font-mono">
                Orden #{selectedPedido.order_number}
              </span>
              <h2 className="font-montserrat font-black text-xl text-navy uppercase mt-0.5">
                Detalle del Pedido
              </h2>
              <p className="text-xs text-navy/60">Registrado el {formatDate(selectedPedido.created_at)}</p>
            </div>

            {/* Content Grid */}
            <div className="space-y-6">
              {/* Comprador Box */}
              <div className="bg-white p-4 rounded-xl border border-beige-300/80 text-xs space-y-2">
                <h4 className="font-montserrat font-bold uppercase tracking-wider text-navy text-[11px] mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-navy/60" /> Datos del Comprador
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-navy">
                  <p><strong>Nombre:</strong> {selectedPedido.cliente_nombre} {selectedPedido.cliente_apellido || ''}</p>
                  <p><strong>DNI:</strong> {selectedPedido.cliente_dni || 'No informado'}</p>
                  <p><strong>Email:</strong> {selectedPedido.cliente_email}</p>
                  <p><strong>Teléfono:</strong> {selectedPedido.cliente_telefono || 'No informado'}</p>
                </div>
              </div>

              {/* Entrega Box */}
              <div className="bg-white p-4 rounded-xl border border-beige-300/80 text-xs space-y-2">
                <h4 className="font-montserrat font-bold uppercase tracking-wider text-navy text-[11px] mb-2 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-navy/60" /> Método de Entrega & Destino
                </h4>
                <p className="font-semibold text-navy">{selectedPedido.metodo_envio}</p>
                {selectedPedido.direccion_calle && (
                  <p className="text-navy/80">
                    {selectedPedido.direccion_calle} {selectedPedido.direccion_numero}
                    {selectedPedido.direccion_piso_depto ? ` (Depto ${selectedPedido.direccion_piso_depto})` : ''}, {selectedPedido.direccion_ciudad}, {selectedPedido.direccion_provincia} (CP {selectedPedido.direccion_cp})
                  </p>
                )}
                {selectedPedido.notas && (
                  <p className="text-navy/70 italic bg-beige-50 p-2 rounded border border-beige-200 mt-2">
                    <strong>Notas del cliente:</strong> "{selectedPedido.notas}"
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="bg-white p-4 rounded-xl border border-beige-300/80 text-xs space-y-3">
                <h4 className="font-montserrat font-bold uppercase tracking-wider text-navy text-[11px] mb-2">
                  Prendas del Pedido ({selectedPedido.items?.length || 0})
                </h4>
                {selectedPedido.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-beige-100 pb-2">
                    <div className="flex items-center space-x-2.5">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded bg-beige-200" />
                      )}
                      <div>
                        <p className="font-bold text-navy">{item.name}</p>
                        <p className="text-[10px] text-navy/60">
                          Talle: {item.size} • Color: {item.colorName} • Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-navy">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                {/* Total breakdown */}
                <div className="pt-2 border-t border-beige-200 space-y-1 text-xs">
                  <div className="flex justify-between text-navy/70">
                    <span>Subtotal prendas</span>
                    <span>{formatPrice(selectedPedido.subtotal)}</span>
                  </div>
                  {selectedPedido.costo_envio > 0 && (
                    <div className="flex justify-between text-navy/70">
                      <span>Costo de envío</span>
                      <span>{formatPrice(selectedPedido.costo_envio)}</span>
                    </div>
                  )}
                  {selectedPedido.descuento > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Descuento aplicado</span>
                      <span>-{formatPrice(selectedPedido.descuento)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-navy pt-2 border-t border-beige-300">
                    <span>Total de la Orden</span>
                    <span className="font-mono font-black">{formatPrice(selectedPedido.total)}</span>
                  </div>
                </div>
              </div>

              {/* Mercado Pago Data if available */}
              {(selectedPedido.mp_payment_id || selectedPedido.mp_preference_id) && (
                <div className="bg-beige-100 p-3.5 rounded-xl border border-beige-300 text-[11px] space-y-1 text-navy/80 font-mono">
                  <p className="font-bold text-navy uppercase text-[10px]">Detalle Mercado Pago:</p>
                  {selectedPedido.mp_payment_id && <p>• Payment ID: #{selectedPedido.mp_payment_id}</p>}
                  {selectedPedido.mp_preference_id && <p>• Preference ID: {selectedPedido.mp_preference_id}</p>}
                  {selectedPedido.mp_status_detail && <p>• Detalle Estado: {selectedPedido.mp_status_detail}</p>}
                </div>
              )}
            </div>

            {/* Actions bottom */}
            <div className="mt-6 pt-4 border-t border-beige-300 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-navy uppercase">Cambiar estado:</span>
                <select
                  value={selectedPedido.estado_pago}
                  onChange={(e) => handleUpdateStatus(selectedPedido.order_number, e.target.value as any)}
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-beige-300 bg-white text-navy cursor-pointer"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleDeletePedido(selectedPedido)}
                  className="inline-flex items-center space-x-1.5 border border-red-200 text-red-600 hover:text-red-800 hover:bg-red-50 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar este pedido"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar pedido</span>
                </button>

                {selectedPedido.cliente_telefono && (
                  <a
                    href={getOrderWhatsAppLink(selectedPedido)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg shadow-xs hover:bg-[#20ba59]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Contactar por WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Generar Pedido Manual */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF7F0] border border-beige-300 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsManualModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-navy/50 hover:text-navy hover:bg-beige-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-beige-300 pb-4 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-navy/60 font-montserrat">
                Panel Administrador
              </span>
              <h2 className="font-montserrat font-black text-xl text-navy uppercase mt-0.5">
                Generar Pedido Manual
              </h2>
              <p className="text-xs text-navy/60">
                Crea una orden directamente en el sistema con prendas del catálogo o personalizadas.
              </p>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-6">
              {/* Step A: Add Items */}
              <div className="bg-white p-5 rounded-2xl border border-beige-300 space-y-4">
                <h4 className="font-montserrat font-bold text-xs uppercase text-navy tracking-wider">
                  1. Agregar Prendas a la Orden
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* Select Product */}
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Prenda</label>
                    <select
                      value={selectedProdId}
                      onChange={(e) => {
                        setSelectedProdId(e.target.value);
                        const p = productos.find((prod) => prod.id === e.target.value);
                        if (p) setCustomPrice(p.precio);
                      }}
                      className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy"
                    >
                      <option value="">-- Seleccionar prenda --</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} ({formatPrice(p.precio)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Size */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Talle</label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy"
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>
                  </div>

                  {/* Color */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Color</label>
                    <input
                      type="text"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      placeholder="Negro / Gris..."
                      className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy"
                    />
                  </div>

                  {/* Qty & Price */}
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Cant.</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(Math.max(1, Number(e.target.value)))}
                      className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-2 py-2 text-navy"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddManualItem}
                      className="w-full py-2 bg-navy hover:bg-navy-500 text-white font-montserrat font-bold text-xs uppercase rounded-lg transition-colors cursor-pointer"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>

                {/* Items snapshot table in modal */}
                {manualItems.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-beige-200 space-y-2">
                    <p className="text-[11px] font-bold uppercase text-navy/70">Prendas en el pedido:</p>
                    {manualItems.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-beige-50 p-2.5 rounded-lg border border-beige-200">
                        <div>
                          <span className="font-bold text-navy">{it.name}</span>
                          <span className="text-navy/60 text-[10px] ml-2">
                            Talle: {it.size} • {it.colorName} • x{it.quantity}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-bold text-navy">{formatPrice(it.price * it.quantity)}</span>
                          <button
                            type="button"
                            onClick={() => setManualItems(manualItems.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step B: Buyer details */}
              <div className="bg-white p-5 rounded-2xl border border-beige-300 space-y-4">
                <h4 className="font-montserrat font-bold text-xs uppercase text-navy tracking-wider">
                  2. Datos del Comprador
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={manualForm.cliente_nombre}
                      onChange={(e) => setManualForm({ ...manualForm, cliente_nombre: e.target.value })}
                      placeholder="Juan"
                      className="w-full bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Apellido</label>
                    <input
                      type="text"
                      value={manualForm.cliente_apellido}
                      onChange={(e) => setManualForm({ ...manualForm, cliente_apellido: e.target.value })}
                      placeholder="Pérez"
                      className="w-full bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={manualForm.cliente_email}
                      onChange={(e) => setManualForm({ ...manualForm, cliente_email: e.target.value })}
                      placeholder="juan@gmail.com"
                      className="w-full bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      value={manualForm.cliente_telefono}
                      onChange={(e) => setManualForm({ ...manualForm, cliente_telefono: e.target.value })}
                      placeholder="11 5555 4444"
                      className="w-full bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">DNI</label>
                    <input
                      type="text"
                      value={manualForm.cliente_dni}
                      onChange={(e) => setManualForm({ ...manualForm, cliente_dni: e.target.value })}
                      placeholder="38123456"
                      className="w-full bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Estado de Pago Inicial</label>
                    <select
                      value={manualForm.estado_pago}
                      onChange={(e) => setManualForm({ ...manualForm, estado_pago: e.target.value as any })}
                      className="w-full bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy font-bold"
                    >
                      <option value="aprobado">Aprobado / Ya Pagado</option>
                      <option value="pendiente">Pendiente de Pago</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step C: Shipping & Destination */}
              <div className="bg-white p-5 rounded-2xl border border-beige-300 space-y-4">
                <h4 className="font-montserrat font-bold text-xs uppercase text-navy tracking-wider">
                  3. Entrega y Envío
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Método de Entrega</label>
                    <select
                      value={manualForm.metodo_envio}
                      onChange={(e) => setManualForm({ ...manualForm, metodo_envio: e.target.value })}
                      className="w-full bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy"
                    >
                      <option value="Retiro en Showroom Quilmes Oeste">Retiro en Showroom Quilmes Oeste</option>
                      <option value="Envío a Domicilio (Correo Argentino)">Envío a Domicilio (Correo Argentino)</option>
                      <option value="Envío a Sucursal (Correo Argentino)">Envío a Sucursal (Correo Argentino)</option>
                      <option value="Envío por Moto Mensajería">Envío por Moto Mensajería</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Costo de Envío ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={manualForm.costo_envio}
                      onChange={(e) => setManualForm({ ...manualForm, costo_envio: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Calle y Número</label>
                    <input
                      type="text"
                      value={manualForm.direccion_calle}
                      onChange={(e) => setManualForm({ ...manualForm, direccion_calle: e.target.value })}
                      placeholder="Av. Calchaquí 1234"
                      className="w-full bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Localidad / Ciudad</label>
                    <input
                      type="text"
                      value={manualForm.direccion_ciudad}
                      onChange={(e) => setManualForm({ ...manualForm, direccion_ciudad: e.target.value })}
                      placeholder="Quilmes"
                      className="w-full bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Provincia</label>
                    <input
                      type="text"
                      value={manualForm.direccion_provincia}
                      onChange={(e) => setManualForm({ ...manualForm, direccion_provincia: e.target.value })}
                      placeholder="Buenos Aires"
                      className="w-full bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Código Postal</label>
                    <input
                      type="text"
                      value={manualForm.direccion_cp}
                      onChange={(e) => setManualForm({ ...manualForm, direccion_cp: e.target.value })}
                      placeholder="1878"
                      className="w-full bg-beige-50 border border-beige-300 rounded-lg px-3 py-2 text-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-navy/70 mb-1">Notas Internas</label>
                  <textarea
                    rows={2}
                    value={manualForm.notas}
                    onChange={(e) => setManualForm({ ...manualForm, notas: e.target.value })}
                    placeholder="Detalles especiales de empaquetado o entrega..."
                    className="w-full bg-beige-50 border border-beige-300 rounded-lg p-2.5 text-xs text-navy"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-navy/70 hover:text-navy hover:bg-beige-200 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={manualItems.length === 0}
                  className="px-6 py-2.5 bg-navy hover:bg-navy-500 disabled:opacity-50 text-white text-xs font-montserrat font-bold uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
                >
                  Guardar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
