import type { BudgetItem, CommunityPost, Destination, Profile } from '@/types/domain';

const UPDATED_AT = '2026-08-27T00:00:00.000Z';

export const seedProfile: Profile = {
  id: 'demo-profile',
  name: 'Edgar González',
  username: '@edgar_itini',
  avatar: '🥾',
  bio: 'Apasionado por las caminatas, la fotografía de naturaleza y las comunidades de Estelí.',
  homeRegion: 'Estelí, Nicaragua',
};

export const seedBudgetItems: BudgetItem[] = [
  { id: 'seed-lodging', name: 'Hospedaje local', amount: 450, category: 'Hospedaje', createdAt: UPDATED_AT },
  { id: 'seed-guide', name: 'Guía comunitario', amount: 350, category: 'Guía', createdAt: UPDATED_AT },
  { id: 'seed-transport', name: 'Transporte ida y vuelta', amount: 120, category: 'Transporte', createdAt: UPDATED_AT },
];

export const seedCommunityPosts: CommunityPost[] = [
  {
    id: 'post-estanzuela-rain',
    author: 'María José R.',
    role: 'Mochilera Verificada',
    avatar: '🥾',
    destinationId: 'estanzuela',
    destinationName: 'Cascada La Estanzuela',
    rating: 5,
    text: '¡La caída de agua está preciosa por las lluvias recientes! El sendero está súper limpio y bien marcado. Les recomiendo ir con calzado de buen agarre.',
    likes: 18,
    liked: false,
    comments: [
      { id: 'comment-1', author: 'Carlos M.', text: '¿Hay cobro de entrada actualmente?' },
      { id: 'comment-2', author: 'María José R.', text: '¡Hola Carlos! C$ 50 córdobas para nacionales.' },
    ],
    photoUri: null,
    createdAt: '2026-08-27T08:00:00.000Z',
  },
  {
    id: 'post-tisey-guide',
    author: 'Guillermo "Memo" L.',
    role: 'Guía Comunitario',
    avatar: '⛰️',
    destinationId: 'tisey',
    destinationName: 'Cerro El Tisey',
    rating: 5,
    text: 'La ruta está despejada y el mirador tiene excelente visibilidad. Recomendamos iniciar antes de las 7:00 a. m. y llevar dos litros de agua.',
    likes: 12,
    liked: false,
    comments: [],
    photoUri: null,
    createdAt: '2026-08-27T05:00:00.000Z',
  },
];

export const seedDestinations: Destination[] = [
  {
    id: 'estanzuela', slug: 'cascada-la-estanzuela', name: 'Cascada La Estanzuela',
    summary: 'Cascada y sendero de bosque a pocos kilómetros de Estelí.',
    description: 'Una caída de agua rodeada de vegetación y roca volcánica, ideal para una caminata corta y una visita de bajo impacto.',
    latitude: 13.0969, longitude: -86.3650, distanceKm: 5.2, durationMinutes: 90,
    elevationGainM: 120, difficulty: 'Fácil', entranceFeeCordobas: 50, capacityDaily: 80,
    sustainabilityScore: 88, communityContributionPct: 70,
    impactSummary: 'La tarifa y el consumo local apoyan el mantenimiento del sendero y a familias de la zona.',
    localRules: ['Mantenerse en el sendero marcado', 'Evitar música a volumen alto', 'No extraer plantas, piedras ni fauna'],
    wasteGuidance: ['Llevar de regreso todos los residuos', 'Usar botella reutilizable', 'Evitar plásticos de un solo uso'],
    communityBenefits: ['Empleo para guías locales', 'Compra directa de alimentos', 'Mantenimiento comunitario del acceso'],
    routeCoordinates: [
      { latitude: 13.0919, longitude: -86.3538 }, { latitude: 13.0782, longitude: -86.3687 },
      { latitude: 13.0643, longitude: -86.3822 }, { latitude: 13.0969, longitude: -86.3650 },
    ],
    verificationStatus: 'demo', updatedAt: UPDATED_AT,
  },
  {
    id: 'tisey', slug: 'cerro-el-tisey', name: 'Cerro El Tisey',
    summary: 'Ruta de montaña con vistas amplias de la cordillera y la cadena volcánica.',
    description: 'Una experiencia exigente dentro del paisaje protegido Tisey–Estanzuela, recomendada con guía local y salida temprana.',
    latitude: 12.9850, longitude: -86.3703, distanceKm: 14.1, durationMinutes: 300,
    elevationGainM: 680, difficulty: 'Avanzado', entranceFeeCordobas: 80, capacityDaily: 45,
    sustainabilityScore: 92, communityContributionPct: 75,
    impactSummary: 'La visita guiada fortalece el empleo rural y reduce el riesgo de erosión por rutas improvisadas.',
    localRules: ['Ingresar con guía en rutas avanzadas', 'Registrar entrada y salida', 'No encender fogatas'],
    wasteGuidance: ['Empacar alimentos sin envolturas innecesarias', 'No dejar residuos orgánicos', 'Usar sanitarios designados'],
    communityBenefits: ['Guianza certificada', 'Conservación del bosque', 'Ingresos para fincas y comedores'],
    routeCoordinates: [
      { latitude: 13.0919, longitude: -86.3538 }, { latitude: 13.057, longitude: -86.361 },
      { latitude: 13.025, longitude: -86.368 }, { latitude: 12.9850, longitude: -86.3703 },
    ],
    verificationStatus: 'demo', updatedAt: UPDATED_AT,
  },
  {
    id: 'jalacate', slug: 'finca-el-jalacate', name: 'Finca El Jalacate',
    summary: 'Arte tallado en piedra y memoria cultural en un entorno rural.',
    description: 'Una visita cultural vinculada al legado del escultor Alberto Gutiérrez y al paisaje de la reserva.',
    latitude: 12.9858, longitude: -86.3376, distanceKm: 6.8, durationMinutes: 120,
    elevationGainM: 180, difficulty: 'Fácil', entranceFeeCordobas: 60, capacityDaily: 60,
    sustainabilityScore: 90, communityContributionPct: 85,
    impactSummary: 'El turismo cultural apoya directamente a la familia anfitriona y conserva un patrimonio artístico local.',
    localRules: ['Solicitar permiso antes de fotografiar personas', 'No tocar las esculturas', 'Respetar áreas privadas de la finca'],
    wasteGuidance: ['Consumir productos servidos en vajilla reutilizable', 'Separar residuos cuando haya estaciones disponibles'],
    communityBenefits: ['Preservación del patrimonio', 'Venta directa de productos', 'Narración de historia local'],
    routeCoordinates: [
      { latitude: 13.0919, longitude: -86.3538 }, { latitude: 13.051, longitude: -86.359 },
      { latitude: 12.9858, longitude: -86.3376 },
    ],
    verificationStatus: 'demo', updatedAt: UPDATED_AT,
  },
  {
    id: 'garnacha', slug: 'comunidad-la-garnacha', name: 'Comunidad La Garnacha',
    summary: 'Turismo comunitario, bosque de pinos y producción local de quesos.',
    description: 'Una comunidad de montaña donde naturaleza, gastronomía y economía solidaria forman parte de la experiencia.',
    latitude: 12.9711, longitude: -86.3636, distanceKm: 12.5, durationMinutes: 240,
    elevationGainM: 450, difficulty: 'Medio', entranceFeeCordobas: 70, capacityDaily: 70,
    sustainabilityScore: 95, communityContributionPct: 90,
    impactSummary: 'La mayor parte del gasto permanece en la comunidad mediante alimentos, guianza y productos elaborados localmente.',
    localRules: ['Respetar los horarios de producción', 'Caminar únicamente por zonas autorizadas', 'Cuidar las fuentes de agua'],
    wasteGuidance: ['Preferir compras sin empaque', 'Llevar bolsa reutilizable', 'Depositar residuos solo en puntos indicados'],
    communityBenefits: ['Comercio justo', 'Empleo juvenil', 'Protección de fuentes de agua'],
    routeCoordinates: [
      { latitude: 13.0919, longitude: -86.3538 }, { latitude: 13.042, longitude: -86.349 },
      { latitude: 12.9711, longitude: -86.3636 },
    ],
    verificationStatus: 'demo', updatedAt: UPDATED_AT,
  },
  {
    id: 'duende', slug: 'mirador-cueva-del-duende', name: 'Mirador Cueva del Duende',
    summary: 'Sendero de leyendas, bosque de montaña y miradores rocosos.',
    description: 'Una ruta de dificultad media que combina interpretación cultural y paisaje, con especial cuidado en bordes y miradores.',
    latitude: 12.9712, longitude: -86.3808, distanceKm: 9.3, durationMinutes: 180,
    elevationGainM: 310, difficulty: 'Medio', entranceFeeCordobas: 70, capacityDaily: 40,
    sustainabilityScore: 86, communityContributionPct: 72,
    impactSummary: 'Visitar con guía ayuda a proteger zonas frágiles y mantiene viva la tradición oral de la comunidad.',
    localRules: ['No acercarse a bordes sin protección', 'Seguir instrucciones del guía', 'Evitar visitas nocturnas no autorizadas'],
    wasteGuidance: ['No abandonar papel ni residuos orgánicos', 'Usar recipientes reutilizables'],
    communityBenefits: ['Guianza cultural', 'Protección de miradores', 'Difusión responsable de leyendas locales'],
    routeCoordinates: [
      { latitude: 13.0919, longitude: -86.3538 }, { latitude: 13.057, longitude: -86.381 },
      { latitude: 12.9712, longitude: -86.3808 },
    ],
    verificationStatus: 'demo', updatedAt: UPDATED_AT,
  },
];
