# ITINI Mobile

Aplicación Expo SDK 57 con funcionamiento offline-first.

## Ejecutar

```powershell
pnpm install
pnpm start
```

Atajos de Expo:

- `a`: Android.
- `i`: iOS en macOS.
- `w`: navegador de apoyo.
- Escanear el QR con un cliente Expo compatible o usar un development build.

## Variables

Copie `.env.example` a `.env.local`. Supabase es opcional en el MVP porque SQLite es la fuente local. No se requieren claves de Google Maps: Android/iOS usan MapLibre Native con tiles de OpenStreetMap y web usa Leaflet con OpenStreetMap.

MapLibre agrega código nativo, así que la APK debe generarse como development build o preview con EAS; no funciona dentro de Expo Go. Revise [docs/openstreetmap.md](docs/openstreetmap.md) para la atribución y la política de uso de tiles.

## Comandos de calidad

```powershell
pnpm run typecheck
pnpm exec expo export --platform web
pnpm run doctor
```

## Decisión SOS

La pantalla usa exclusivamente `DemoSosGateway`, que guarda el evento en SQLite. `InstitutionalSosGateway` existe como frontera arquitectónica y lanza un error intencional hasta contar con convenios, API, autenticación, auditoría y protocolo de respuesta.
