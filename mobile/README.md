# ITINI Mobile

Aplicación Expo SDK 57 con funcionamiento offline-first.

## Cuenta local

Al entrar desde la pantalla de compromisos se puede iniciar sesión o crear una cuenta. Nombre, usuario, avatar y presupuestos se guardan en SQLite en el dispositivo. La contraseña nunca se guarda en texto plano: se almacena un hash SHA-256 con una sal aleatoria. Para producción se recomienda migrar la autenticación a un proveedor backend con sesiones y recuperación de cuenta.

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
