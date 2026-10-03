/**
 * constants.ts
 * Configuración global del comercio y canales de comunicación oficiales.
 */

export const BRAND_NAME = 'Veelvet';
export const BRAND_TAGLINE = 'Simplemente Veelvet.';
export const BRAND_INSTAGRAM = 'veelvet.shop';
export const BRAND_INSTAGRAM_URL = 'https://instagram.com/veelvet.shop';

// Canal oficial de WhatsApp de Veelvet
export const WHATSAPP_NUMBER = '5491136291392';
export const WHATSAPP_RAW_INPUT = '1136291392';
export const WHATSAPP_DISPLAY = '+54 9 11 3629-1392';
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/**
 * Genera un enlace directo a WhatsApp con mensaje codificado.
 */
export function getWhatsAppLink(message: string): string {
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}
