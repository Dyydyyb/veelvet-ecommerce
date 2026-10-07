export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'showroom' | 'productos' | 'compras' | 'envios';
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-01',
    question: '¿Tienen showroom?',
    answer: 'Sí. Contamos con showroom en Quilmes Oeste para que puedas ver y probarte nuestros productos con total comodidad. Atendemos de Lunes a Sábado de 9:00 a 17:00 hs con cita previa (máximo 2 personas por seguridad).',
    category: 'showroom',
  },
  {
    id: 'faq-02',
    question: '¿Dónde están ubicados?',
    answer: 'Nuestro showroom está ubicado en Quilmes Oeste. Al reservar tu turno online te enviamos la dirección exacta y ubicación por WhatsApp.',
    category: 'showroom',
  },
  {
    id: 'faq-03',
    question: '¿Qué talles tienen?',
    answer: 'Trabajamos del S al XL en todos los productos. Cada prenda cuenta con su tabla de medidas para que elijas el talle ideal.',
    category: 'productos',
  },
  {
    id: 'faq-04',
    question: '¿Cómo compro?',
    answer: 'Podés comprar por nuestra tienda online, por Instagram (@veelvet.shop) o directamente en el showroom con cita previa.',
    category: 'compras',
  },
  {
    id: 'faq-05',
    question: '¿Las prendas son unisex?',
    answer: 'Sí. Nuestras prendas tienen un calce perfecto para todos nuestros clientes, con moldería equilibrada para lucir holgada y estilizada.',
    category: 'productos',
  },
  {
    id: 'faq-06',
    question: '¿Hacen envíos a todo el país?',
    answer: 'Sí, enviamos a todas las provincias argentinas a través de Correo Argentino (a domicilio o sucursal). El costo del envío es a calcular según código postal y peso del paquete. También podés retirar gratis en el showroom de Quilmes Oeste con turno.',
    category: 'envios',
  },
  {
    id: 'faq-07',
    question: '¿Cuáles son los medios de pago aceptados?',
    answer: 'Aceptamos Mercado Pago (por ahora), con dinero en cuenta, tarjetas de débito y crédito en cuotas. Al confirmar tu orden te compartimos el link de pago seguro por WhatsApp.',
    category: 'compras',
  },
  {
    id: 'faq-08',
    question: '¿Se pueden realizar cambios?',
    answer: 'Tenés hasta 30 días corridos a partir de la recepción para solicitar cambio por talle o modelo, siempre que la prenda se encuentre sin uso, con etiqueta y en su empaque original.',
    category: 'compras',
  },
  {
    id: 'faq-09',
    question: '¿Tienen venta mayorista?',
    answer: 'Sí. Ofrecemos precios mayoristas con mínimos de compra accesibles para locales y revendedores de todo el país. Podés consultar y pedir el catálogo en la sección Mayoristas de nuestra web.',
    category: 'compras',
  }
];
