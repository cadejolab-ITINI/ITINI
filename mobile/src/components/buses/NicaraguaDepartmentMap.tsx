import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText, TSpan } from 'react-native-svg';

import { font } from '@/constants/theme';
import { nicaraguaDepartments } from '@/data/nicaragua-map';
import { nicaraguaLakes, ometepePath } from '@/data/nicaragua-lakes';
import { MapTouchTarget } from './MapTouchTarget';

export function NicaraguaDepartmentMap({ onSelectEsteli }: { onSelectEsteli: () => void }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let disposed = false;
    let animation: Animated.CompositeAnimation | undefined;
    const update = (reduce: boolean) => {
      animation?.stop();
      pulse.setValue(1);
      if (reduce || disposed) return;
      animation = Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]));
      animation.start();
    };
    void AccessibilityInfo.isReduceMotionEnabled().then(update).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', update);
    return () => { disposed = true; animation?.stop(); subscription.remove(); };
  }, [pulse]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>EXPLORÁ NICARAGUA</Text><Text style={styles.heading}>Tu viaje comienza aquí</Text></View>
        <View style={styles.badge}><Text style={styles.badgeText}>DEMO</Text></View>
      </View>
      <View style={styles.map}>
        <Svg width="100%" height="100%" viewBox="0 0 440 405" fontFamily={font.semibold}>
          {nicaraguaDepartments.map(region => {
            const shape = <Path d={region.path} fill={region.id === 'esteli' ? '#12C487' : '#1A3046'}
              stroke={region.id === 'esteli' ? '#83F5CB' : '#658098'} strokeWidth={region.id === 'esteli' ? 1.7 : 0.8}
              strokeLinejoin="round" fillRule="evenodd" />;
            return region.id === 'esteli'
              ? <MapTouchTarget key={region.id} onPress={onSelectEsteli} label="Estelí en el mapa: abrir horarios">{shape}</MapTouchTarget>
              : <G key={region.id}>{shape}</G>;
          })}
          <G pointerEvents="none">
            {nicaraguaLakes.map(lake => <Path key={lake.name} d={lake.path} fill="#126495" stroke="#4CB8E1" strokeWidth={0.9} fillRule="evenodd" />)}
            <Path d={ometepePath} fill="#4D9E83" stroke="#A7E5C2" strokeWidth={0.7} />
            {nicaraguaDepartments.filter(region => region.id !== 'esteli').map(region => (
              <SvgText key={region.id} x={region.label[0]} y={region.label[1]} fill="#D4E1EC" fontSize={region.name === 'Masaya' || region.name === 'Granada' || region.name === 'Carazo' ? 7 : 8.5}
                textAnchor="middle" fontWeight="500">
                {region.name.startsWith('Costa Caribe') ? <><TSpan x={region.label[0]} dy={-8}>Región Autónoma</TSpan><TSpan x={region.label[0]} dy={11}>Costa Caribe {region.name.endsWith('Norte') ? 'Norte' : 'Sur'}</TSpan></> : region.name === 'Nueva Segovia' ? <><TSpan x={region.label[0]} dy={-4}>Nueva</TSpan><TSpan x={region.label[0]} dy={10}>Segovia</TSpan></> : region.name}
              </SvgText>
            ))}
            <Line x1={133} y1={246} x2={87} y2={253} stroke="#78CFEF" strokeWidth={0.7} />
            <SvgText x={65} y={254} textAnchor="middle" fill="#A6E2F5" fontSize={8}>Lago de Managua</SvgText>
            <SvgText x={201} y={289} textAnchor="middle" fill="#D0F1FF" fontSize={8}><TSpan x={201}>Lago</TSpan><TSpan x={201} dy={10}>Cocibolca</TSpan></SvgText>
            <Line x1={192} y1={316} x2={227} y2={325} stroke="#D5F6E6" strokeWidth={0.7} />
            <SvgText x={247} y={329} textAnchor="middle" fill="#C5EFDC" fontSize={8}>Ometepe</SvgText>
            <Circle cx={125} cy={182} r={4.5} fill="#FFFFFF" stroke="#07834B" strokeWidth={2} />
            <Line x1={125} y1={177} x2={81} y2={110} stroke="#47DFB0" strokeWidth={1.3} />
          </G>
          <MapTouchTarget onPress={onSelectEsteli} label="Explorar Estelí">
            <Rect x={22} y={79} width={99} height={35} rx={12} fill="#0E3C36" stroke="#35DAA6" strokeWidth={1} />
            <SvgText x={71} y={94} fill="#E5FFF5" fontWeight="bold" fontSize={12} textAnchor="middle">Estelí</SvgText>
            <SvgText x={71} y={106} fill="#69E7BD" fontSize={8} textAnchor="middle">TOCÁ PARA EXPLORAR</SvgText>
          </MapTouchTarget>
        </Svg>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}><Animated.View style={[styles.dot, { backgroundColor: '#12C487', opacity: pulse }]} /><Text style={styles.legendText}>Estelí disponible</Text></View>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#658098' }]} /><Text style={styles.legendText}>Próximamente</Text></View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Estelí: ver horarios de Cotran Norte y Cotran Sur" onPress={onSelectEsteli}
        style={({ pressed }) => [styles.openButton, pressed && styles.pressed]}>
        <View style={styles.busIcon}><MaterialCommunityIcons name="bus" color="#74E9C1" size={25} /></View>
        <View style={styles.buttonCopy}><Text style={styles.buttonTitle}>Ver buses de Estelí</Text><Text style={styles.buttonSubtitle}>Cotran Norte · Cotran Sur</Text></View>
        <MaterialCommunityIcons name="arrow-right" color="#74E9C1" size={23} />
      </Pressable>
      <Text style={styles.footnote}>15 departamentos y 2 regiones autónomas.{ '\n' }Solo Estelí está habilitado en esta demo.</Text>
      <Pressable accessibilityRole="link" onPress={() => { void Linking.openURL('https://www.geoboundaries.org/api/current/gbOpen/NIC/ADM1/').catch(() => {}); }} style={styles.attribution}>
        <Text style={styles.attributionText}>geoBoundaries · © OpenStreetMap · ODbL · Natural Earth</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#0C1B2D', borderWidth: 1, borderColor: '#243C53', borderRadius: 24, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  eyebrow: { color: '#5CDCB9', fontFamily: font.extraBold, fontSize: 9, letterSpacing: 1.5 },
  heading: { color: '#F3F8FC', fontFamily: font.extraBold, fontSize: 17, marginTop: 5 },
  badge: { borderRadius: 8, backgroundColor: '#283223', paddingHorizontal: 8, paddingVertical: 5 },
  badgeText: { fontFamily: font.extraBold, fontSize: 9, color: '#F5BD65' },
  map: { width: '100%', aspectRatio: 440 / 405, marginTop: 4 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginBottom: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { color: '#A9BDCC', fontFamily: font.semibold, fontSize: 11 },
  openButton: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#103B34', borderColor: '#267F65', borderWidth: 1, padding: 12, borderRadius: 16, minHeight: 66 },
  pressed: { opacity: 0.78 },
  busIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#175244' },
  buttonCopy: { flex: 1 },
  buttonTitle: { fontFamily: font.extraBold, color: '#EEFFF8', fontSize: 15 },
  buttonSubtitle: { fontFamily: font.semibold, color: '#91C8B5', fontSize: 11, marginTop: 2 },
  footnote: { color: '#A9BDCC', fontFamily: font.regular, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 14 },
  attribution: { paddingTop: 12, paddingBottom: 4, minHeight: 32, justifyContent: 'center' },
  attributionText: { color: '#87A1B7', fontFamily: font.regular, fontSize: 9, textAlign: 'center' },
});
