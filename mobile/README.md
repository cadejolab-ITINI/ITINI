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

Copie `.env.example` a `.env.local`. Supabase es opcional en el MVP porque SQLite es la fuente local. `GOOGLE_MAPS_ANDROID_API_KEY` sí es necesaria para un APK Android independiente con cartografía de Google.

## Comandos de calidad

```powershell
pnpm run typecheck
pnpm exec expo export --platform web
pnpm run doctor
```

## Decisión SOS

La pantalla usa exclusivamente `DemoSosGateway`, que guarda el evento en SQLite. `InstitutionalSosGateway` existe como frontera arquitectónica y lanza un error intencional hasta contar con convenios, API, autenticación, auditoría y protocolo de respuesta.
