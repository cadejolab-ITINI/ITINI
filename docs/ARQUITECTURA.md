# Arquitectura del MVP ITINI

## 1. Objetivo

Entregar una aplicación instalable y demostrable que siga funcionando con conectividad irregular. El teléfono conserva una copia útil de los destinos y de los datos del usuario; la nube se incorpora como sincronización, no como requisito para abrir la app.

## 2. Decisiones principales

| Área | MVP | Evolución |
|---|---|---|
| Aplicación | Expo SDK 57, React Native, TypeScript y Expo Router | Development builds y publicación en tiendas |
| Datos locales | SQLite con WAL, migraciones y repositorios | Cifrado de campos sensibles y migraciones versionadas |
| Nube | Esquema Supabase preparado, sin dependencia en la demo | Auth, sincronización incremental, Storage y Edge Functions |
| Mapa | `react-native-maps` en Android/iOS; vista de apoyo en web | Rutas levantadas en campo, navegación y mapas descargables |
| GPS | Permiso en primer uso y seguimiento en primer plano | Registro de ruta con consentimiento y controles de batería |
| SOS | Simulación local con coordenadas reales | Integración institucional únicamente tras acuerdos y auditoría |

## 3. Flujo offline-first

1. `SQLiteProvider` abre `itini.db`.
2. `migrateDatabase` crea tablas e inserta datos iniciales.
3. `AppDataProvider` lee destinos, perfil y presupuesto desde SQLite.
4. Las pantallas nunca dependen de una petición remota para mostrar información básica.
5. Cada cambio de perfil o presupuesto se escribe primero en SQLite.
6. `sync_queue` queda preparada para enviar cambios cuando se implemente Supabase.

La política de sincronización futura será: **local primero, servidor después**, con `updated_at`, reintentos e idempotencia. Los destinos institucionalmente verificados tendrán prioridad sobre versiones antiguas del dispositivo.

## 4. Estructura modular

```text
mobile/src/
├─ app/
│  ├─ (tabs)/index.tsx          Mapa y accesos GPS/SOS
│  ├─ (tabs)/destinations.tsx   Catálogo y filtros
│  ├─ (tabs)/budget.tsx         Presupuesto persistente
│  ├─ (tabs)/profile.tsx        Perfil persistente
│  ├─ destination/[id].tsx      Ficha sostenible
│  ├─ sos.tsx                   Simulación aislada
│  └─ _layout.tsx               Fuentes, SQLite y navegación
├─ components/
│  ├─ map/EsteliMap.tsx         Mapa nativo real
│  ├─ map/EsteliMap.web.tsx     Vista web de apoyo
│  └─ ui/                       Componentes accesibles
├─ database/
│  ├─ migrations.ts             Esquema local y datos semilla
│  └─ repositories.ts           Consultas parametrizadas
├─ services/sos.ts              Contratos Demo/Institucional
└─ types/domain.ts              Modelos compartidos
```

## 5. Esquemas de datos

### SQLite en el dispositivo

| Tabla | Propósito |
|---|---|
| `profiles` | Perfil editable de la persona viajera |
| `destinations` | Datos, coordenadas y sostenibilidad disponibles offline |
| `budget_items` | Gastos del viaje |
| `sos_events` | Historial local de simulaciones; no representa emergencias reales |
| `sync_queue` | Cola para la sincronización posterior |

### PostgreSQL/Supabase

La migración `supabase/migrations/001_initial_schema.sql` incluye:

- `profiles`
- `destinations` y `destination_routes`
- `prices`
- `guides` y `guide_destinations`
- `reviews`
- `budgets` y `budget_items`
- `sos_events`

Row Level Security permite lectura pública únicamente de destinos publicados, precios verificados, guías activas y reseñas aprobadas. Cada usuario administra solo su perfil y presupuesto. Desde el cliente móvil únicamente se pueden insertar eventos SOS con `mode='demo'` y `status='simulated'`.

## 6. SOS seguro

`SosGateway` define el contrato. El MVP inyecta `DemoSosGateway`:

- Captura ubicación con permiso explícito.
- Muestra las coordenadas antes de simular.
- Exige mantener presionado 2.5 segundos.
- Guarda el evento solo en SQLite.
- No llama, no manda SMS y no transmite ubicación.

`InstitutionalSosGateway` permanece bloqueado. Para habilitarlo se exige:

1. Convenio formal y protocolo con la institución receptora.
2. Servicio backend autenticado; nunca una llamada directa desde el teléfono.
3. Idempotencia, firma de solicitudes y cifrado.
4. Confirmación humana de recepción y escalamiento.
5. Auditoría, monitoreo, pruebas de campo y revisión legal/privacidad.
6. Alternativa visible para llamadas tradicionales de emergencia.

## 7. Paso a paso para continuar

1. Validar en campo coordenadas, capacidad, tarifas y reglas.
2. Crear un proyecto Supabase y ejecutar la migración.
3. Mantener los destinos en `published=false` hasta su validación.
4. Instalar el cliente Supabase y agregar autenticación.
5. Implementar un `SyncService` que lea `sync_queue`.
6. Agregar pruebas de repositorios y recorridos críticos.
7. Configurar Google Maps para el APK Android.
8. Generar un APK `preview`, probarlo en dos teléfonos y ensayar la demo offline.

## 8. Criterios de aceptación del Hackathon

- La app abre y muestra destinos sin internet.
- La posición GPS aparece tras aceptar permiso.
- Los marcadores abren fichas sostenibles.
- Un gasto nuevo sigue presente después de reiniciar.
- El SOS siempre dice “Modo Demostración”.
- La simulación utiliza coordenadas reales pero no las transmite.
- Los controles importantes tienen etiquetas y áreas táctiles de al menos 44 px.
