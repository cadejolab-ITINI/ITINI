# OpenStreetMap en ITINI

ITINI usa MapLibre Native en Android/iOS y Leaflet en web. Ambos muestran datos de OpenStreetMap, sin claves ni SDK de Google Maps. El GPS del teléfono continúa llegando desde `expo-location`.

## Antes de crear la APK

MapLibre incluye código nativo, por lo que no funciona dentro de Expo Go. Después de instalar dependencias hay que crear una compilación de desarrollo o preview con EAS:

```bash
eas build --platform android --profile preview
```

## Uso de tiles

El MVP apunta al servidor público `tile.openstreetmap.org` y muestra la atribución de OpenStreetMap. Ese servidor tiene políticas de uso y no debe usarse como backend de alto tráfico para producción. Antes del lanzamiento público, configurá un proveedor de tiles o infraestructura propia y conservá la atribución ODbL.
