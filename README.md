# ITINI · Itinerarios de la Naturaleza

ITINI es un MVP movil de ecoturismo sostenible pensado para Android y iOS. La app ayuda a descubrir destinos de Esteli, Nicaragua, con mapas, presupuesto, comunidad, rutas, guias verificados y un modulo SOS en modo demostracion para hackathon.

## Que incluye este MVP

- App construida con Expo + React Native + TypeScript.
- Navegacion movil con onboarding y 5 pestanas principales.
- Mapa de Esteli con ubicacion del usuario y puntos de interes.
- Persistencia local con SQLite para cuentas, perfiles, destinos, comunidad y presupuestos.
- Registro e inicio de sesión local con usuario, contraseña protegida y avatar emoji.
- Lectura offline de informacion clave ya guardada.
- Interfaz oscura consistente con la identidad visual de ITINI.
- Fichas de destinos con dificultad, tiempos, sostenibilidad e impacto comunitario.
- Directorio de guias certificados y panel de precios verificados.
- Modulo SOS en modo demo con captura de coordenadas reales.

## Enfoque del proyecto

### Actualización del mapa y la planificación

La pantalla 3 incorpora mapa web interactivo, punto GPS animado, fichas al tocar destinos, búsqueda con cierre al tocar fuera y planes guardados en el presupuesto. Las rutas por carretera se calculan bajo petición; no son senderos validados. Los precios y coordenadas de destinos siguen siendo datos demo. [Alcance, privacidad y pruebas](docs/MAPA-DASHBOARD.md).

ITINI nace como una propuesta de turismo seguro, accesible y responsable para Nicaragua. En esta primera version el foco esta en una demo funcional para Hackathon 2026, priorizando experiencia movil, identidad visual y una base tecnica lista para crecer.

## Tecnologias

- Expo SDK 57
- React Native
- Expo Router
- TypeScript
- Expo SQLite
- MapLibre Native + OpenStreetMap (y Leaflet en web)
- Supabase como siguiente capa backend

## Estructura principal

```text
ITINI/
├─ mobile/
│  ├─ src/app/                 Pantallas y navegacion
│  ├─ src/components/          Componentes visuales y modales
│  ├─ src/components/map/      Mapa nativo y fallback web
│  ├─ src/data/                Datos semilla del MVP
│  ├─ src/database/            Migraciones y repositorios SQLite
│  ├─ src/hooks/               GPS y conectividad
│  ├─ src/providers/           Estado global de la app
│  ├─ src/services/            Servicios como SOS demo
│  └─ src/types/               Tipos de dominio
├─ docs/
│  ├─ ARQUITECTURA.md
│  └─ ROADMAP.md
└─ supabase/
   ├─ migrations/
   └─ seed.sql
```

## Como ejecutar

```powershell
cd mobile
pnpm install
pnpm start
```

## Validaciones usadas

```powershell
pnpm run typecheck
pnpm exec expo export --platform web
pnpm exec expo export --platform android
pnpm exec expo export --platform ios
```

## Nota importante

El modulo SOS, los precios, las coordenadas de referencia y varios contenidos del MVP estan preparados para demostracion. Antes de publicarse como producto real deben validarse con comunidades locales, INTUR y actores institucionales correspondientes.

## Documentacion

- [Arquitectura](docs/ARQUITECTURA.md)
- [Hoja de ruta](docs/ROADMAP.md)
