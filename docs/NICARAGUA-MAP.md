# Croquis de Nicaragua para Buses

El selector utiliza las 17 divisiones de primer nivel (15 departamentos y dos regiones autónomas). Solo Estelí abre los horarios. Las otras geometrías son informativas. El botón bajo el mapa permite la misma selección con teclado y lector de pantalla y ofrece un blanco táctil amplio. La animación de la leyenda respeta la preferencia de movimiento reducido.

## Fuente y licencia

- Fuente: geoBoundaries gbOpen, Nicaragua ADM1, boundary ID `NIC-ADM1-94367503`, datos representativos de 2017, release `9469f09`.
- Metadatos: https://www.geoboundaries.org/api/current/gbOpen/NIC/ADM1/
- Archivo original: https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/NIC/ADM1/geoBoundaries-NIC-ADM1_simplified.geojson
- Atribución original: © OpenStreetMap contributors / Wambacher, distribuido por geoBoundaries.
- Licencia del conjunto y de las geometrías derivadas: Open Data Commons Open Database License 1.0, https://opendatacommons.org/licenses/odbl/1-0/ . Derechos OSM: https://www.openstreetmap.org/copyright

`mobile/src/data/nicaragua-map.ts` es el conjunto derivado editable y redistribuible bajo ODbL. Conserva todos los anillos del GeoJSON simplificado, con coordenadas SVG calculadas como `x = 22 + (longitud + 87.70) * 79`, `y = 30 + (15.05 - latitud) * 81`, redondeadas a una décima. Los nombres se normalizan al español y las etiquetas se colocan manualmente para el croquis. No se usa para navegación ni representa la posición GPS.

Las geometrías se incluyen en el paquete: no requieren API, descarga, permiso de ubicación ni conexión para dibujarse. El enlace de atribución sí requiere internet. No hay cambios en la base SQLite ni en los horarios por esta actualización visual.

## Lagos e islas

`mobile/src/data/nicaragua-lakes.ts` deriva de Natural Earth Lakes 1:10m, de dominio público: https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-lakes/ . Archivo: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_lakes.geojson . Se seleccionaron los polígonos Lago de Nicaragua y Lago de Managua y se aplicó la misma proyección. Sus anillos interiores conservan las islas de Zapatera y Ometepe. Ometepe se resalta como isla, sin tratarla como departamento o destino habilitado.

Las etiquetas departamentales se colocaron en el interior terrestre de sus polígonos, excluyendo lagos; las regiones autónomas llevan rótulos en dos líneas. Referencias visuales consultadas: https://www.paises.net/america/nicaragua/mapa/ y https://proyectoviajero.com/mapas-de-nicaragua/ .
