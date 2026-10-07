export interface ShippingMethod {
  id: string;
  name: string;
  carrier: 'correo_argentino' | 'showroom' | 'andreani' | 'veelvet_express';
  tagline: string;
  deliveryTime: string;
  price: number;
  isCalculated?: boolean;
  priceLabel?: string;
  freeAbove?: number;
  highlight?: string;
  badge?: string;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'ship-correo-argentino',
    name: 'Correo Argentino',
    carrier: 'correo_argentino',
    tagline: 'Envíos a todo el país a domicilio o sucursal. Costo a calcular según destino y código postal.',
    deliveryTime: '3 - 6 días hábiles',
    price: 0,
    isCalculated: true,
    priceLabel: 'A calcular',
    highlight: 'Cobertura nacional en toda la Argentina',
    badge: 'A CALCULAR',
  },
  {
    id: 'ship-showroom-retiro',
    name: 'Retiro en Showroom Quilmes Oeste',
    carrier: 'showroom',
    tagline: 'Lunes a Sábado de 9:00 a 17:00 hs. Cita previa, máximo 2 personas por seguridad.',
    deliveryTime: 'Con cita previa',
    price: 0,
    isCalculated: false,
    priceLabel: 'GRATIS',
    highlight: 'Sin costo • Máximo 2 personas por turno',
    badge: 'GRATIS',
  },
];
