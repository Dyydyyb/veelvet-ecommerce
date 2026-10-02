export interface CareInstruction {
  id: string;
  title: string;
  description: string;
  icon: string;
  tip: string;
}

export const CARE_INSTRUCTIONS: CareInstruction[] = [
  {
    id: 'care-01',
    title: 'Lavar con agua fría',
    description: 'Utilizá agua a temperatura máxima de 30°C o ciclo para prendas delicadas.',
    icon: 'ThermometerSnowflake',
    tip: 'El agua fría previene el encogimiento del algodón peinado y mantiene la elasticidad natural de las fibras.',
  },
  {
    id: 'care-02',
    title: 'Lavar con colores similares',
    description: 'Separá prendas claras de oscuras y lavá siempre del revés.',
    icon: 'Sparkles',
    tip: 'Lavar la prenda del revés protege la textura exterior suave y el lustre de la estampa o bordado.',
  },
  {
    id: 'care-03',
    title: 'Planchar del revés',
    description: 'Plancha a temperatura media y siempre con la prenda dada vuelta.',
    icon: 'Flame',
    tip: 'Evitá el contacto directo de la plancha caliente sobre estampas, logos engomados o cierres metálicos.',
  },
  {
    id: 'care-04',
    title: 'Secar al aire (evitar secarropas)',
    description: 'Colgá la prenda a la sombra extendida horizontalmente.',
    icon: 'Wind',
    tip: 'El calor excesivo del secarropas daña la estructura del algodón pesado y puede deformar la caída holgada.',
  },
  {
    id: 'care-05',
    title: 'Guardar tu prenda limpia y seca',
    description: 'Doblá tu prenda prolijamente en un espacio fresco y sin humedad.',
    icon: 'ShieldCheck',
    tip: 'Para buzos y hoodies pesados, recomendamos doblar en lugar de colgar para no estirar los hombros con perchas finas.',
  },
];
