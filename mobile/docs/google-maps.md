# Google Maps en ITINI

ITINI usa Google Maps en las compilaciones nativas (Android/iOS) con un estilo oscuro navy. Las claves no se guardan en el repositorio:

1. Copiá `.env.example` como `.env.local`.
2. Creá claves separadas en Google Cloud para Android, iOS y web.
3. Restringí cada clave a su aplicación o dominio y habilitá únicamente las APIs necesarias.
4. Compilá con `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY` y `EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY`.

La demo web mantiene Leaflet/OpenStreetMap como respaldo hasta configurar `EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY`. Esto evita publicar una clave, romper el prototipo o presentar un mapa vacío. La ubicación GPS sigue viniendo de `expo-location`, independientemente del proveedor visual.

Google Maps requiere una clave y configuración de facturación para uso productivo. Las claves deben rotarse y limitarse por plataforma; nunca las pegues en código, capturas o commits.
