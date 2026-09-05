import { Camera, GeoJSONSource, Layer, Map, Marker } from '@maplibre/maplibre-react-native';
import type { StyleSpecification } from '@maplibre/maplibre-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { EsteliMapProps } from './map-types';
import { UserLocationDot } from './UserLocationDot';

const ESTELI_CENTER: [number, number] = [-86.365, 13.045];

// OpenStreetMap raster tiles are loaded directly by MapLibre Native.
// The attribution is part of the style so it remains visible in the native map.
const OSM_STYLE: StyleSpecification = {
  version: 8,
  name: 'ITINI OpenStreetMap',
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm', paint: { 'raster-opacity': 1 } }],
};

const OSM_OFFLINE_STYLE: StyleSpecification = {
  version: 8,
  name: 'ITINI OpenStreetMap offline',
  sources: {},
  layers: [{ id: 'offline-background', type: 'background', paint: { 'background-color': colors.background } }],
};

const toLngLat = (point: { latitude: number; longitude: number }): [number, number] => [point.longitude, point.latitude];

export function EsteliMap({ destinations, selected, userLocation, onDestinationPress, onMapPress, recenterToken, route, offline }: EsteliMapProps) {
  const camera = useRef<React.ElementRef<typeof Camera>>(null);

  const routeData = useMemo(() => route ? ({
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'LineString' as const, coordinates: [route.origin, ...route.coordinates, route.destination].map(toLngLat) },
  }) : null, [route]);

  const routeAccessData = useMemo(() => route ? ({
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'MultiLineString' as const,
      coordinates: [
        [toLngLat(route.origin), toLngLat(route.coordinates[0])],
        [toLngLat(route.coordinates[route.coordinates.length - 1]), toLngLat(route.destination)],
      ],
    },
  }) : null, [route]);

  const routeBounds = useMemo(() => {
    if (!route) return null;
    const points = [route.origin, ...route.coordinates, route.destination];
    const longitudes = points.map((point) => point.longitude);
    const latitudes = points.map((point) => point.latitude);
    return [Math.min(...longitudes), Math.min(...latitudes), Math.max(...longitudes), Math.max(...latitudes)] as [number, number, number, number];
  }, [route]);

  useEffect(() => {
    if (userLocation && recenterToken > 0) camera.current?.easeTo({ center: toLngLat(userLocation), zoom: 15, duration: 450 });
  }, [recenterToken, userLocation]);

  useEffect(() => {
    if (route && routeBounds) camera.current?.fitBounds(routeBounds, { padding: { top: 160, right: 90, bottom: 150, left: 40 }, duration: 450 });
    else if (selected) camera.current?.easeTo({ center: toLngLat(selected), zoom: 14, duration: 450 });
  }, [route, routeBounds, selected]);

  return (
    <Map
      style={styles.map}
      mapStyle={offline ? OSM_OFFLINE_STYLE : OSM_STYLE}
      attribution
      attributionPosition={{ bottom: 8, left: 8 }}
      logo={false}
      compass={false}
      scaleBar={false}
      onPress={onMapPress}
      accessibilityLabel="Mapa interactivo de destinos de Estelí"
    >
      <Camera ref={camera} initialViewState={{ center: ESTELI_CENTER, zoom: 11.8 }} />

      {routeData && (
        <GeoJSONSource id="itini-route" data={routeData}>
          <Layer id="itini-route-line" type="line" source="itini-route" paint={{ 'line-color': colors.sky, 'line-width': 5, 'line-opacity': 0.95 }} />
        </GeoJSONSource>
      )}
      {routeAccessData && (
        <GeoJSONSource id="itini-route-access" data={routeAccessData}>
          <Layer id="itini-route-access-line" type="line" source="itini-route-access" paint={{ 'line-color': colors.orange, 'line-width': 3, 'line-dasharray': [1.5, 2.5], 'line-opacity': 0.9 }} />
        </GeoJSONSource>
      )}

      {userLocation && (
        <Marker lngLat={toLngLat(userLocation)} id="itini-user-location" anchor="center">
          <View pointerEvents="none"><UserLocationDot /></View>
        </Marker>
      )}

      {destinations.map((destination) => (
        <Marker
          key={destination.id}
          id={`destination-${destination.id}`}
          lngLat={toLngLat(destination)}
          // La punta del pin debe coincidir con la coordenada real del destino.
          anchor="bottom"
          onPress={(event) => { event.stopPropagation?.(); onDestinationPress(destination); }}
        >
          <View accessible accessibilityRole="button" accessibilityLabel={`Ver ${destination.name}`} style={destination.id === selected?.id ? styles.destinationMarkerSelected : styles.destinationMarker}>
            <MaterialCommunityIcons name="map-marker" size={31} color="#168DE2" />
          </View>
        </Marker>
      ))}
    </Map>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  destinationMarker: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  destinationMarkerSelected: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', transform: [{ scale: 1.12 }] },
});
