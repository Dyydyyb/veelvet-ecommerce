export interface BuzoMeasurements {
  talle: 'S' | 'M' | 'L' | 'XL';
  anchoA: string;   // Ancho (A)
  largoB: string;   // Largo (B)
  mangaC: string;   // Manga (C)
  hombroD: string;  // Hombro (D)
}

export interface PantalonMeasurements {
  talle: 'S' | 'M' | 'L' | 'XL';
  cinturaA: string;    // Cintura (A)
  botaMangaB: string;  // Bota manga (B)
  largoC: string;      // Largo (C)
  tiroD: string;       // Tiro (D)
}

export const BUZO_MEASUREMENTS: BuzoMeasurements[] = [
  { talle: 'S', anchoA: '74 cm', largoB: '70 cm', mangaC: '42 cm', hombroD: '34 cm' },
  { talle: 'M', anchoA: '76 cm', largoB: '72 cm', mangaC: '43 cm', hombroD: '35 cm' },
  { talle: 'L', anchoA: '78 cm', largoB: '74 cm', mangaC: '44 cm', hombroD: '36 cm' },
  { talle: 'XL', anchoA: '80 cm', largoB: '76 cm', mangaC: '45 cm', hombroD: '37 cm' },
];

export const PANTALON_MEASUREMENTS: PantalonMeasurements[] = [
  { talle: 'S', cinturaA: '70 cm', botaMangaB: '22 cm', largoC: '100 cm', tiroD: '33 cm' },
  { talle: 'M', cinturaA: '72 cm', botaMangaB: '23 cm', largoC: '102 cm', tiroD: '33,5 cm' },
  { talle: 'L', cinturaA: '74 cm', botaMangaB: '24 cm', largoC: '104 cm', tiroD: '34 cm' },
  { talle: 'XL', cinturaA: '76 cm', botaMangaB: '25 cm', largoC: '106 cm', tiroD: '34,5 cm' },
];

export const MEASURING_TIPS = [
  {
    title: 'Medí sobre una prenda plana',
    description: 'Tomá un buzo o pantalón que te calce cómodo, colocalo estirado sobre una mesa firme y medí de costura a costura sin estirar la tela.',
  },
  {
    title: 'Ancho de pecho (A en Buzos)',
    description: 'Medí de sisa a sisa justo 2 cm por debajo de la costura de la manga.',
  },
  {
    title: 'Largo total (B en Buzos / C en Pantalones)',
    description: 'Para buzos, desde el punto más alto del hombro hasta el borde inferior. Para pantalones, desde el borde superior de la cintura hasta el dobladillo inferior.',
  },
  {
    title: 'Cintura con elástico (A en Pantalones)',
    description: 'Las medidas de cintura representan el elástico relajado. Cuentan con cordón interno que permite ajustar o expandir hasta 10 cm con total confort.',
  },
];
