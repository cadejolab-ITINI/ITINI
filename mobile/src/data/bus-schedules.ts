import type { BusSchedule, BusTerminal } from '@/types/domain';

// Consulta pública realizada el 04/09/2026. Estelí Buses indica que no está
// asociado a las terminales; por eso estos datos se muestran como referenciales.
export const busDataCheckedAt = '2026-09-04';

export const busTerminals: BusTerminal[] = [
  {
    id: 'cotran-norte',
    name: 'Cotran Norte',
    direction: 'Rutas hacia el norte del país',
    address: 'Del Centro Comercial Erwin, 30 m al sur, junto a la Carretera Panamericana',
    phone: '2713-2529 ext. 102',
    sourceUrl: 'https://estelibuses.web.app/terminal-norte-esteli',
    checkedAt: busDataCheckedAt,
  },
  {
    id: 'cotran-sur',
    name: 'Cotran Sur',
    direction: 'Rutas hacia el sur y occidente del país',
    address: 'Contiguo al depósito de Restaurantes Tip-Top, km 148½ Carretera Panamericana',
    phone: '2713-6162',
    sourceUrl: 'https://estelibuses.web.app/terminal-sur-esteli',
    checkedAt: busDataCheckedAt,
  },
];

const reference = (id: string, terminalId: string, terminalName: BusTerminal['name'], destination: string, departureTime: string, serviceType: string, fareCordobas: number | null, durationMinutes: number | null, notes: string, sourceUrl: string): BusSchedule => ({
  id, terminalId, terminalName, destination, departureTime, days: 'Todos los días*', serviceType,
  fareCordobas, durationMinutes, notes, sourceUrl, checkedAt: busDataCheckedAt, verificationStatus: 'reference',
});

export const busSchedules: BusSchedule[] = [
  reference('norte-managua-0515', 'cotran-norte', 'Cotran Norte', 'Managua · Mercado El Mayoreo', '05:15 a. m.', 'Expreso · Jerry', null, 144, 'Salida frente a Cotrán Norte.', 'https://estelibuses.web.app/terminal-norte-esteli/horarios-esteli-managua'),
  reference('norte-managua-0615', 'cotran-norte', 'Cotran Norte', 'Managua · Mercado El Mayoreo', '06:15 a. m.', 'Expreso · Leiva', null, 144, 'Salida frente a Cotrán Norte.', 'https://estelibuses.web.app/terminal-norte-esteli/horarios-esteli-managua'),
  reference('norte-managua-0745', 'cotran-norte', 'Cotran Norte', 'Managua · Mercado El Mayoreo', '07:45 a. m.', 'Expreso · Molina', null, 144, 'Salida frente a Cotrán Norte.', 'https://estelibuses.web.app/terminal-norte-esteli/horarios-esteli-managua'),
  reference('norte-managua-1115', 'cotran-norte', 'Cotran Norte', 'Managua · Mercado El Mayoreo', '11:15 a. m.', 'Expreso · Esquipulas', null, 144, 'Salida frente a Cotrán Norte.', 'https://estelibuses.web.app/terminal-norte-esteli/horarios-esteli-managua'),

  reference('sur-managua-0330', 'cotran-sur', 'Cotran Sur', 'Managua · Mercado El Mayoreo', '03:30 a. m.', 'Ruteado', 90, 198, 'Tarifa publicada: C$90 por persona.', 'https://estelibuses.web.app/terminal-sur-esteli/horarios-esteli-managua'),
  reference('sur-managua-0445', 'cotran-sur', 'Cotran Sur', 'Managua · Mercado El Mayoreo', '04:45 a. m.', 'Expreso', 110, 144, 'Tarifa publicada: C$110 por persona.', 'https://estelibuses.web.app/terminal-sur-esteli/horarios-esteli-managua'),
  reference('sur-managua-0645', 'cotran-sur', 'Cotran Sur', 'Managua · Mercado El Mayoreo', '06:45 a. m.', 'Expreso', 110, 144, 'Tarifa publicada: C$110 por persona.', 'https://estelibuses.web.app/terminal-sur-esteli/horarios-esteli-managua'),
  reference('sur-managua-0845', 'cotran-sur', 'Cotran Sur', 'Managua · Mercado El Mayoreo', '08:45 a. m.', 'Expreso · Moreno', 110, 144, 'Tarifa publicada: C$110 por persona.', 'https://estelibuses.web.app/terminal-sur-esteli/horarios-esteli-managua'),
  reference('sur-matagalpa-0515', 'cotran-sur', 'Cotran Sur', 'Matagalpa', '05:15 a. m.', 'Ruteado', 45, 90, 'Tarifa publicada: C$45 por persona.', 'https://estelibuses.web.app/terminal-sur-esteli/horarios-esteli-matagalpa'),
  reference('sur-matagalpa-0615', 'cotran-sur', 'Cotran Sur', 'Matagalpa', '06:15 a. m.', 'Ruteado', 45, 90, 'Tarifa publicada: C$45 por persona.', 'https://estelibuses.web.app/terminal-sur-esteli/horarios-esteli-matagalpa'),
  reference('sur-tisey-0630', 'cotran-sur', 'Cotran Sur', 'Tisey · La Estanzuela', '06:30 a. m.', 'Ruteado', 30, null, 'Tarifa indicada para salir desde Estelí: C$30 por persona.', 'https://estelibuses.web.app/terminal-sur-esteli/horarios-esteli-tisey-la-estanzuela'),
];
