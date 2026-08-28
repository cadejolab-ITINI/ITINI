import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { colors } from '@/constants/theme';
import type { Destination, UserLocation } from '@/types/domain';

type Props = {
  destinations: Destination[];
  selected: Destination | null;
  userLocation: UserLocation | null;
  onDestinationPress: (destination: Destination) => void;
};

const positions: Record<string, { top: `${number}%`; left: `${number}%`; color: string }> = {
  estanzuela: { top: '34%', left: '23%', color: '#17AEE7' },
  tisey: { top: '44%', left: '35%', color: '#FF711F' },
  jalacate: { top: '51%', left: '77%', color: '#17AEE7' },
  garnacha: { top: '63%', left: '47%', color: '#12C98D' },
  duende: { top: '73%', left: '65%', color: '#FF711F' },
};

export function EsteliMap({ destinations, selected, userLocation, onDestinationPress }: Props) {
  return (
    <View style={styles.map} accessibilityLabel="Vista web del mapa de Estelí">
      <Svg width="100%" height="100%" viewBox="0 0 390 700" preserveAspectRatio="none" style={styles.lines}>
        <Path d="M-20 110 C90 70 142 170 235 150 C306 136 340 80 410 42" fill="none" stroke="#18253B" strokeWidth="1.4" />
        <Path d="M-10 160 C88 126 140 170 205 218 C278 272 335 230 405 165" fill="none" stroke="#1B2940" strokeWidth="1.5" />
        <Path d="M-15 303 C78 270 133 300 222 354 C300 401 350 367 410 310" fill="none" stroke="#1B2940" strokeWidth="1.2" />
        <Path d="M-20 453 C85 412 162 466 238 505 C311 542 355 523 407 486" fill="none" stroke="#1B2940" strokeWidth="1.4" />
        <Path d="M-20 590 C92 548 172 591 260 629 C322 656 367 651 410 625" fill="none" stroke="#152239" strokeWidth="1.2" />
        {[64, 92, 120, 148].map((y) => <Line key={`h-${y}`} x1="54" y1={y + 260} x2="175" y2={y + 260} stroke="#14243A" strokeWidth="1" />)}
        {[82, 110, 138].map((x) => <Line key={`v-${x}`} x1={x} y1="325" x2={x} y2="465" stroke="#14243A" strokeWidth="1" />)}
        {selected && <Path d="M106 318 L76 356 L99 405 L119 443" fill="none" stroke="#0DAAE3" strokeWidth="5" strokeDasharray="7 6" opacity="0.7" />}
        {userLocation && <Circle cx="110" cy="410" r="30" fill="#0DAAE3" opacity="0.18" />}
        {userLocation && <Circle cx="110" cy="410" r="18" fill="#0DAAE3" opacity="0.42" />}
        {userLocation && <Circle cx="110" cy="410" r="6" fill="#0DAAE3" stroke="#FFFFFF" strokeWidth="2" />}
      </Svg>

      {destinations.map((destination) => {
        const position = positions[destination.id] ?? { top: '50%' as const, left: '50%' as const, color: colors.emerald };
        return (
          <Pressable
            key={destination.id}
            onPress={() => onDestinationPress(destination)}
            style={[styles.marker, { top: position.top, left: position.left, borderColor: position.color }, selected?.id === destination.id && styles.markerSelected]}
            accessibilityRole="button"
            accessibilityLabel={`Seleccionar ${destination.name}`}
          >
            <View style={[styles.markerCore, { backgroundColor: position.color }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, minHeight: 500, backgroundColor: '#020719', overflow: 'hidden' },
  lines: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  marker: { position: 'absolute', width: 18, height: 18, marginLeft: -9, marginTop: -9, borderRadius: 9, borderWidth: 3, backgroundColor: '#F8FBFF', alignItems: 'center', justifyContent: 'center' },
  markerCore: { width: 7, height: 7, borderRadius: 4 },
  markerSelected: { transform: [{ scale: 1.2 }] },
});
