# Pantalla 3 · mapa y planificación

## Qué cambia

- Web: el dibujo del prototipo se sustituye por un mapa geográfico Leaflet con cartografía OpenStreetMap y tratamiento oscuro. Android/iOS conservan react-native-maps.
- GPS: punto azul con halo animado y radio de precisión. Nunca se sustituye una ubicación denegada por coordenadas ficticias. El botón de ubicación obtiene una lectura nueva y centra el mapa. La animación respeta «reducir movimiento».
- Destinos: tocar un marcador, una sugerencia, una fila de Rutas o «Ver en el Mapa» abre la misma ficha. Incluye información, dificultad, impacto comunitario, precio de referencia y distancia geográfica en línea recta desde el GPS.
- Planificación: cantidad de personas y gastos adicionales manuales. Se guarda un estimado en SQLite y se abre la calculadora. No reserva ni cobra. Los gastos pueden eliminarse con ×.
- Buscador: coincidencias por palabras, sin distinguir mayúsculas ni tildes. Tocar o desplazar el mapa cierra sugerencias y teclado. Seleccionar un resultado abre su ficha; Escape cierra la búsqueda en web.

## Permisos y precisión geográfica

### Permiso GPS en la pantalla 3

Al entrar, ITINI consulta el estado del permiso sin mostrar el diálogo del sistema automáticamente. Si falta autorización, presenta «Activá tu ubicación». El botón solicita el permiso real con Expo Location; si ya estaba concedido, obtiene la ubicación directamente. No solicita notificaciones push ni ubicación en segundo plano.

Una denegación permanente ofrece «Abrir ajustes» en Android/iOS; en web explica cómo habilitar Ubicación en los permisos del sitio. La vista integrada puede bloquear la geolocalización y no ofrecer ese control: en ese caso hay que usar un navegador compatible. Ningún botón concede permisos por sí solo. «Reintentar GPS» comprueba el estado nuevamente y solicita una lectura actual (sin caché en web). También se detectan servicios de ubicación apagados y errores de adquisición.

«Ahora no» permite seguir explorando. El botón GPS y el aviso inferior vuelven a abrir el diálogo. Al obtener coordenadas, se cierra el aviso, se centra el punto azul y, si se venía de una ficha de destino, se vuelve a ella. Cancelar invalida cualquier respuesta pendiente para que no cambie la pantalla después.

Pruebas específicas: `pnpm run test:location`. Se verificaron en la vista web la aparición inicial, la denegación real, el cierre y la reapertura; la concesión del permiso y apertura de ajustes nativos requieren prueba en teléfono.

### Corrección de las ubicaciones turísticas: pendiente

Los cinco destinos todavía usan coordenadas demo de `mobile/src/data/seed.ts`. Esta actualización de permisos **no los reubica**. La base SQLite carga esas coordenadas al iniciar; por eso no basta con mover un marcador visualmente.

Para corregirlos, recopilar por destino: enlace al punto exacto en Google Maps u OpenStreetMap (o lectura GPS en campo), qué representa el punto (entrada, estacionamiento, cima o atractivo), fuente y fecha de comprobación. Confirmar la entrada accesible con el responsable/guía local antes de usarla como destino de una ruta en vehículo. Luego actualizar el catálogo fuente y los datos persistidos, manteniendo el historial de verificación y sin tocar perfiles o presupuestos.

No resolver solo por nombre: por ejemplo, el [plan de manejo de Cerro Tomabú de MARENA](https://www.marena.gob.ni/wp-content/uploads/2022/04/Plan-Manejo-Reserva-Natural-Cerro-Tomabu.pdf) menciona una «cueva del duende», mientras hay un [Mirador Cueva del Duende cartografiado cerca de La Garnacha](https://mapcarta.com/N4998172725). No se ha confirmado con el equipo cuál es el acceso que ITINI debe recomendar.

## Rutas: alcance y privacidad

El usuario solicita expresamente «Ver ruta desde mi ubicación», después de ver el aviso de envío de coordenadas a OSRM. Se consulta su servicio público de demostración con origen GPS y destino seleccionado. Devuelve geometría real de la red de carreteras, distancia y tiempo **en vehículo**. No se usa la antigua línea fija ni los trazos de ejemplo de `routeCoordinates`.

La línea azul representa la carretera. Los enlaces naranjas punteados conectan el punto de origen/destino con la vía que devuelve el servicio: **son accesos por confirmar, no instrucciones de caminata**. El GPS puede quedar separado de la carretera. Las coordenadas turísticas y precios actuales siguen siendo datos demo pendientes de validación local.

Las solicitudes tienen límite de 15 segundos; se cancelan al cerrar la ficha, cambiar de destino, activar desconectado o desmontar la pantalla. Una respuesta antigua no puede reemplazar la selección nueva. Se rechazan ubicaciones con más de dos minutos al solicitar una ruta; si el usuario se aleja del origen, la tarjeta invita a actualizarla. No hay navegación giro a giro ni recálculo continuo.

Sin permisos o ruta disponible se informa el problema y no se inventa un recorrido. Sin internet pueden leerse fichas y guardar presupuestos locales, pero no calcular rutas nuevas. La vista web en modo desconectado retira la capa remota; no descarga mapas offline.

## Servicios y condiciones

- [Leaflet 1.9.4](https://leafletjs.com/reference.html): carga dinámica solo en web, marcadores accesibles, controles de zoom y limpieza al desmontar.
- [Política de mapas OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/): atribución visible, caché normal del navegador y carga de la vista actual, sin descargas masivas ni paquetes offline. Para mapas offline o producción, contratar/configurar un proveedor con permiso explícito para ese uso.
- [API de OSRM](https://github.com/Project-OSRM/osrm-backend/blob/master/docs/http.md): coordenadas longitude,latitude; GeoJSON transformado al formato latitude,longitude compartido por los mapas. Endpoint de demostración, sin garantía de disponibilidad. Para lanzamiento, usar un servicio con capacidad y políticas adecuadas.

No se guardan coordenadas personales en el repositorio ni se envían automáticamente a OSRM.

## Comprobar

Desde `mobile`, con Node 22.18+ o 24 y dependencias instaladas:

```sh
pnpm run test:map
pnpm run typecheck
pnpm exec expo export --platform web
pnpm exec expo export --platform android --platform ios --output-dir .expo/native-map-check
```

Pruebas automatizadas: distancia conocida/simétrica/cero, búsqueda sin tildes, coordenadas inválidas, orden GeoJSON, errores HTTP, geometría incompleta, falta de ruta y cancelación.

Verificación web realizada: cartografía visible, marcador abre ficha, búsqueda selecciona destino, toque exterior cierra sugerencias, plan de 2 personas con C$325 extras suma C$425, registro persiste tras recarga y se elimina sin modificar otros gastos. Permiso GPS denegado muestra aviso y bloquea cálculo. Se consultó OSRM con coordenadas públicas de prueba: respondió una geometría de 167 puntos, sin enviar ubicación personal.

Pendiente de verificación física: GPS en movimiento con permiso concedido, precisión real, pulso nativo, ruta completa desde el teléfono, Android/iOS con teclado y tamaños de letra accesibles. Exportar los paquetes JS no equivale a probar una instalación en dispositivos.
