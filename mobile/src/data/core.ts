export type Guide = {
  id: string;
  name: string;
  base: string;
  rating: number;
  credential: string;
  specialty: string;
  skills: string[];
  phone: string;
};

export const guides: Guide[] = [
  {
    id: 'edgar-guide',
    name: 'Edgar González',
    base: 'Reserva Natural Tisey',
    rating: 5,
    credential: 'INTUR #8831',
    specialty: 'Senderismo de Alta Montaña, Fotografía de Naturaleza',
    skills: ['Primeros Auxilios Avanzados', 'Orientación GPS', 'Supervivencia'],
    phone: '+50588830001',
  },
  {
    id: 'cesar-guide',
    name: 'Cesar Castillo',
    base: 'Cascada La Estanzuela',
    rating: 4.9,
    credential: 'INTUR #7714',
    specialty: 'Senderismo familiar y observación de aves',
    skills: ['Primeros Auxilios', 'Interpretación ambiental', 'Inglés'],
    phone: '+50588830002',
  },
  {
    id: 'kassandra-guide',
    name: 'Kassandra Guadalupe',
    base: 'La Garnacha',
    rating: 5,
    credential: 'INTUR #9042',
    specialty: 'Turismo comunitario, gastronomía y cultura local',
    skills: ['Atención al visitante', 'Historia local', 'Comercio justo'],
    phone: '+50588830003',
  },
  {
    id: 'dixon-guide',
    name: 'Dixon Osmayner',
    base: 'Miraflor',
    rating: 4.8,
    credential: 'INTUR #6921',
    specialty: 'Avistamiento de fauna y recorridos de bosque nuboso',
    skills: ['Ornitología', 'Orientación GPS', 'Primeros Auxilios'],
    phone: '+50588830004',
  },
];

export const verifiedPrices = [
  { id: 'entry-estanzuela', name: 'Entrada Cascada La Estanzuela', amount: 50, category: 'Entrada' as const },
  { id: 'guide-tisey', name: 'Guía Comunitario Tisey (por grupo)', amount: 350, category: 'Guía' as const },
  { id: 'lunch-garnacha', name: 'Almuerzo Campestre La Garnacha', amount: 180, category: 'Alimentación' as const },
  { id: 'transport-miraflor', name: 'Traslado Colectivo Miraflor', amount: 60, category: 'Transporte' as const },
];
