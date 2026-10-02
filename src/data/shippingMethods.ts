export interface ShippingMethod {
  id: string;
  name: string;
  carrier: 'andreani' | 'correo_argentino' | 'veelvet_express' | 'showroom';
  tagline: string;
  deliveryTime: string;
  price: number;
  freeAbove?: number;
  highlight?: string;
  badge?: string;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'ship-veelvet',
    name: 'Envío por Veelvet (Quilmes & GBA Sur)',
    carrier: 'veelvet_express',
    tagline: 'Cadetería propia directa en 24 a 48 hs hábiles.',
    deliveryTime: '24 - 48 hs',
    price: 3500,
    freeAbove: 90000,
    highlight: 'El más rápido en zona sur y CABA',
    badge: 'RECOMENDADO',
  },
  {
    id: 'ship-andreani-domicilio',
    name: 'Andreani a Domicilio',
    carrier: 'andreani',
    tagline: 'Envío seguro a cualquier punto de la República Argentina.',
    deliveryTime: '3 - 5 días hábiles',
    price: 5900,
    freeAbove: 100000,
    highlight: 'Seguimiento satelital en tiempo real',
  },
  {
    id: 'ship-andreani-sucursal',
    name: 'Andreani a Sucursal',
    carrier: 'andreani',
    tagline: 'Retirá en la sucursal Andreani más cercana a tu hogar.',
    deliveryTime: '2 - 4 días hábiles',
    price: 4400,
    freeAbove: 100000,
  },
  {
    id: 'ship-correo-argentino',
    name: 'Correo Argentino Clásico',
    carrier: 'correo_argentino',
    tagline: 'Cobertura nacional integral en toda la Argentina.',
    deliveryTime: '4 - 7 días hábiles',
    price: 4900,
    freeAbove: 100000,
  },
  {
    id: 'ship-showroom-retiro',
    name: 'Retiro Gratis en Showroom Quilmes',
    carrier: 'showroom',
    tagline: 'Coordiná tu visita, probátelo y retiralo en el acto.',
    deliveryTime: 'Inmediato (con turno)',
    price: 0,
    highlight: 'Sin costo • Asesoramiento personalizado',
    badge: 'GRATIS',
  },
];
