import MapView, { Circle, Marker, Polyline } from 'react-native-maps';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { colors } from '@/constants/theme';
import type { EsteliMapProps } from './map-types';
import { UserLocationDot } from './UserLocationDot';

const ESTELI_REGION = {
  latitude: 13.045,
  longitude: -86.365,
  latitudeDelta: 0.14,
  longitudeDelta: 0.12,
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#102238' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A9BDCC' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#07111F' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#24435D' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0B3A5E' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0C3D2B' }] },
];

export function EsteliMap({ destinations, selected, userLocation, onDestinationPress, onMapPress, recenterToken, route, offline }: EsteliMapProps) {
  const map = useRef<MapView>(null);
  const latestLocation = useRef(userLocation);
  latestLocation.current = userLocation;
  useEffect(() => {
    const point = latestLocation.current;
    if (point && recenterToken > 0) map.current?.animateToRegion({ ...point, latitudeDelta: 0.012, longitudeDelta: 0.012 }, 450);
  }, [recenterToken]);
  useEffect(() => {
    if (route) map.current?.fitToCoordinates([route.origin, ...route.coordinates, route.destination], { edgePadding: { top: 160, right: 90, bottom: 150, left: 40 }, animated: true });
    else if (selected) map.current?.animateToRegion({ ...selected, latitudeDelta: 0.025, longitudeDelta: 0.025 }, 450);
  }, [route, selected]);
  return (
    <MapView
      ref={map}
      style={styles.map}
      initialRegion={ESTELI_REGION}
      customMapStyle={darkMapStyle}
      mapType={offline ? 'none' : 'standard'}
      onPress={onMapPress}
      onPanDrag={onMapPress}
      showsUserLocation={false}
      showsMyLocationButton={false}
      accessibilityLabel="Mapa interactivo de destinos de Estelí"
    >
      {userLocation && userLocation.accuracy != null && userLocation.accuracy > 0 && <Circle center={userLocation} radius={userLocation.accuracy} fillColor="rgba(66,133,244,0.09)" strokeColor="rgba(66,133,244,0.25)" strokeWidth={1} />}
      {userLocation && <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }} zIndex={1000} tracksViewChanges tappable={false}><UserLocationDot /></Marker>}
      {destinations.map((destination) => (
        <Marker
          key={destination.id}
          coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
          title={destination.name}
          description={`${destination.difficulty} · Sostenibilidad ${destination.sustainabilityScore}/100`}
          pinColor={destination.id === selected?.id ? colors.orange : colors.emerald}
          onPress={(event) => { event.stopPropagation(); onDestinationPress(destination); }}
        />
      ))}
      {route && <Polyline coordinates={route.coordinates} strokeColor={colors.sky} strokeWidth={5} />}
      {route && <Polyline coordinates={[route.origin, route.coordinates[0]]} strokeColor={colors.orange} strokeWidth={3} lineDashPattern={[4, 7]} />}
      {route && <Polyline coordinates={[route.coordinates[route.coordinates.length - 1], route.destination]} strokeColor={colors.orange} strokeWidth={3} lineDashPattern={[4, 7]} />}
    </MapView>
  );
}

const styles = StyleSheet.create({ map: { flex: 1 } });
