import MapView, { Marker, Polyline } from 'react-native-maps';
import { StyleSheet } from 'react-native';

import { colors } from '@/constants/theme';
import type { Destination, UserLocation } from '@/types/domain';

type Props = {
  destinations: Destination[];
  selected: Destination | null;
  userLocation: UserLocation | null;
  onDestinationPress: (destination: Destination) => void;
};

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

export function EsteliMap({ destinations, selected, userLocation, onDestinationPress }: Props) {
  return (
    <MapView
      style={styles.map}
      initialRegion={ESTELI_REGION}
      customMapStyle={darkMapStyle}
      showsUserLocation={Boolean(userLocation)}
      showsMyLocationButton={Boolean(userLocation)}
      accessibilityLabel="Mapa interactivo de destinos de Estelí"
    >
      {destinations.map((destination) => (
        <Marker
          key={destination.id}
          coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
          title={destination.name}
          description={`${destination.difficulty} · Sostenibilidad ${destination.sustainabilityScore}/100`}
          pinColor={destination.id === selected?.id ? colors.orange : colors.emerald}
          onPress={() => onDestinationPress(destination)}
        />
      ))}
      {selected && (
        <Polyline coordinates={selected.routeCoordinates} strokeColor={colors.sky} strokeWidth={5} lineDashPattern={[12, 7]} />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({ map: { flex: 1 } });
