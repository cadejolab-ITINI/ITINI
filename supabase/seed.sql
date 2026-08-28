insert into public.destinations (
  id, slug, name, summary, description, latitude, longitude, distance_km,
  duration_minutes, elevation_gain_m, difficulty, entrance_fee_cordobas,
  capacity_daily, sustainability_score, community_contribution_pct,
  impact_summary, local_rules, waste_guidance, community_benefits,
  verification_status, published
) values
(
  'estanzuela', 'cascada-la-estanzuela', 'Cascada La Estanzuela',
  'Cascada y sendero de bosque a pocos kilómetros de Estelí.',
  'Caída de agua rodeada de vegetación y roca volcánica.',
  13.0528, -86.3915, 5.2, 90, 120, 'Fácil', 50, 80, 88, 70,
  'La tarifa y el consumo local apoyan el mantenimiento del sendero y a familias de la zona.',
  '["Mantenerse en el sendero marcado", "No extraer flora ni fauna"]',
  '["Llevar de regreso todos los residuos", "Usar botella reutilizable"]',
  '["Empleo para guías locales", "Compra directa de alimentos"]',
  'demo', false
),
(
  'tisey', 'cerro-el-tisey', 'Cerro El Tisey',
  'Ruta de montaña con vistas amplias de la cordillera.',
  'Experiencia exigente recomendada con guía local y salida temprana.',
  12.9968, -86.3718, 14.1, 300, 680, 'Avanzado', 80, 45, 92, 75,
  'La visita guiada fortalece el empleo rural y reduce la erosión por rutas improvisadas.',
  '["Ingresar con guía", "Registrar entrada y salida", "No encender fogatas"]',
  '["No dejar residuos orgánicos", "Usar sanitarios designados"]',
  '["Guianza certificada", "Conservación del bosque"]',
  'demo', false
),
(
  'jalacate', 'finca-el-jalacate', 'Finca El Jalacate',
  'Arte tallado en piedra y memoria cultural.',
  'Visita cultural vinculada al legado del escultor Alberto Gutiérrez.',
  13.0108, -86.3669, 6.8, 120, 180, 'Fácil', 60, 60, 90, 85,
  'El turismo cultural apoya directamente a la familia anfitriona.',
  '["Pedir permiso antes de fotografiar personas", "No tocar las esculturas"]',
  '["Preferir vajilla reutilizable"]',
  '["Preservación del patrimonio", "Venta directa de productos"]',
  'demo', false
),
(
  'garnacha', 'comunidad-la-garnacha', 'Comunidad La Garnacha',
  'Turismo comunitario, bosque de pinos y producción local.',
  'Naturaleza, gastronomía y economía solidaria en una comunidad de montaña.',
  12.9865, -86.3425, 12.5, 240, 450, 'Medio', 70, 70, 95, 90,
  'La mayor parte del gasto permanece en la comunidad.',
  '["Respetar horarios de producción", "Cuidar las fuentes de agua"]',
  '["Preferir compras sin empaque", "Llevar bolsa reutilizable"]',
  '["Comercio justo", "Empleo juvenil", "Protección del agua"]',
  'demo', false
),
(
  'duende', 'mirador-cueva-del-duende', 'Mirador Cueva del Duende',
  'Sendero de leyendas, bosque y miradores rocosos.',
  'Ruta de dificultad media que combina interpretación cultural y paisaje.',
  13.0324, -86.3981, 9.3, 180, 310, 'Medio', 70, 40, 86, 72,
  'Visitar con guía ayuda a proteger zonas frágiles y la tradición oral.',
  '["No acercarse a bordes sin protección", "Seguir instrucciones del guía"]',
  '["No abandonar residuos", "Usar recipientes reutilizables"]',
  '["Guianza cultural", "Protección de miradores"]',
  'demo', false
)
on conflict (id) do update set
  name = excluded.name,
  summary = excluded.summary,
  description = excluded.description,
  updated_at = timezone('utc', now());

-- Mantener published=false hasta que coordenadas, precios, capacidad y normas
-- sean validados con administradores de los sitios y actores institucionales.
