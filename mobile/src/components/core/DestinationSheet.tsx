import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ItiniBottomSheet } from './ItiniBottomSheet';
import { font } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';
import { distanceKm, type RoadRoute } from '@/services/map-routing';
import type { Destination, UserLocation } from '@/types/domain';

type Props = {
  destination: Destination;
  location: UserLocation | null;
  locating: boolean;
  locationError: string | null;
  route: RoadRoute | null;
  routing: boolean;
  routeError: string | null;
  offline: boolean;
  onClose: () => void;
  onLocate: () => void;
  onRoute: () => void;
  onSaved: () => void;
};

type TransportMode = 'A pie' | 'Vehículo propio' | 'Bus';
const transportModes: Array<{ id: TransportMode; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string; hint: string }> = [
  { id: 'A pie', icon: 'walk', color: '#12C487', hint: 'Ideal para recorridos cercanos' },
  { id: 'Vehículo propio', icon: 'car-outline', color: '#16BDF2', hint: 'Flexibilidad para salir a tu ritmo' },
  { id: 'Bus', icon: 'bus', color: '#F59D1D', hint: 'Transporte colectivo' },
];
const GUIDE_FEE = 350;

export function DestinationSheet({ destination, location, locating, locationError, route, routing, routeError, offline, onClose, onLocate, onRoute, onSaved }: Props) {
  const { addTripPlan, updateLatestTripPlanStatus } = useAppData();
  const [stage, setStage] = useState<'transport' | 'details' | 'planning'>('transport');
  const [transport, setTransport] = useState<TransportMode | null>(null);
  const [people, setPeople] = useState('1');
  const [transportCost, setTransportCost] = useState('0');
  const [foodCost, setFoodCost] = useState('0');
  const [saved, setSaved] = useState(false);
  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const savingLock = useRef(false);
  const distance = location ? distanceKm(location, destination) : null;
  const visitors = Number(people);
  const transportAmount = Number(transportCost.replace(',', '.'));
  const foodAmount = Number(foodCost.replace(',', '.'));
  const valid = Number.isInteger(visitors) && visitors >= 1 && visitors <= 50 && Number.isFinite(transportAmount) && transportAmount >= 0 && transportAmount <= 1000000 && Number.isFinite(foodAmount) && foodAmount >= 0 && foodAmount <= 1000000;
  const total = valid ? destination.entranceFeeCordobas * visitors + GUIDE_FEE + transportAmount + foodAmount : null;
  const save = async () => {
    if (total === null || savingLock.current) return;
    savingLock.current = true;
    setSaving(true);
    setError('');
    try {
      if (!await addTripPlan(destination.id, visitors, GUIDE_FEE + transportAmount + foodAmount, { transportMode: transport ?? 'Bus', transportAmount, foodAmount, guideAmount: GUIDE_FEE })) { setError('No se pudo guardar. Revisá los importes (máximo dos decimales) e intentá de nuevo.'); return; }
      setSaved(true);
    } catch { setError('No se pudo guardar. Tu plan sigue aquí; intentá de nuevo.'); }
    finally { savingLock.current = false; setSaving(false); }
  };

  return (
    <ItiniBottomSheet visible onClose={saving ? () => {} : onClose} title={stage === 'planning' ? 'Planificá tu visita' : stage === 'transport' ? '¿Cómo vas a llegar?' : destination.name} badge={stage === 'transport' ? 'PRIMER PASO' : destination.verificationStatus === 'demo' ? 'DESTINO · DATOS DEMO' : 'EXPLORÁ ESTELÍ'} icon="map-marker-outline" accent="#0AAAE5">
      <View style={styles.content}>
        {stage === 'transport' && <>
          <Text style={styles.heading}>Elegí tu forma de llegar</Text>
          <Text style={styles.copy}>Así podemos recomendarte cómo planificar {destination.name}.</Text>
          <View style={styles.transportList}>
            {transportModes.map(option => <Pressable key={option.id} accessibilityRole="button" accessibilityState={{ selected: transport === option.id }} onPress={() => { setTransport(option.id); setStage('details'); }} style={styles.transportOption}>
              <View style={[styles.transportIcon, { backgroundColor: `${option.color}1C` }]}><MaterialCommunityIcons name={option.icon} size={24} color={option.color} /></View>
              <View style={styles.transportCopy}><Text style={styles.transportTitle}>{option.id}</Text><Text style={styles.transportHint}>{option.hint}</Text></View>
              <MaterialCommunityIcons name="chevron-right" size={21} color="#7E93A9" />
            </Pressable>)}
          </View>
          <Text style={styles.hint}>Podés cambiar esta elección al volver a abrir la ficha.</Text>
        </>}
        <View style={styles.meta}><Text style={styles.chip}>{destination.difficulty}</Text><Text style={styles.distance}>{distance === null ? 'Activá GPS para conocer la distancia' : `${distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`} desde vos · en línea recta`}</Text></View>
        {stage === 'details' && <>
          <View style={styles.selectedTransport}><MaterialCommunityIcons name={transportModes.find(item => item.id === transport)?.icon ?? 'help-circle-outline'} size={17} color="#0A8BB6" /><Text style={styles.selectedTransportText}>Llegás en: <Text style={styles.selectedTransportStrong}>{transport}</Text></Text><Pressable onPress={() => setStage('transport')}><Text style={styles.changeText}>Cambiar</Text></Pressable></View>
          <View style={styles.recommendationCard}><Text style={styles.recommendationTitle}>Recomendación ITINI</Text><Text style={styles.copy}>{transport === 'A pie' ? 'Salí temprano, llevá agua y calzado con buen agarre.' : transport === 'Bus' ? 'Confirmá la salida en Cotran Sur y reservá tiempo para el último tramo.' : 'Revisá combustible, parqueo y el estado del acceso antes de salir.'}</Text></View>
          <Text style={styles.copy}>{destination.description}</Text>
          <View style={styles.card}><Text style={styles.heading}>Una visita con impacto positivo</Text><Text style={styles.copy}>{destination.impactSummary}</Text><Text style={styles.copy}>{destination.localRules.slice(0, 2).join(' · ')}</Text></View>
          <Text style={styles.hint}>Entrada de referencia: C$ {destination.entranceFeeCordobas} por persona. {destination.verificationStatus === 'demo' ? 'Ubicación y precios de demostración, pendientes de validación local.' : 'Confirmá condiciones antes de viajar.'}</Text>
          <Pressable accessibilityRole="button" disabled={locating || routing} onPress={onLocate} style={[styles.secondary, (locating || routing) && styles.disabled]}><Text style={styles.secondaryText}>{locating ? 'Buscando tu ubicación…' : location ? 'Actualizar mi ubicación' : 'Activar mi ubicación'}</Text></Pressable>
          {locationError && <Text accessibilityRole="alert" style={styles.error}>{locationError}</Text>}
          {location && <Text style={styles.hint}>GPS: precisión {location.accuracy == null ? 'no disponible' : `±${Math.round(location.accuracy)} m`}. Si te moviste, actualizá la ruta.</Text>}
          {route && <Text style={styles.copy}>Carretera: {(route.distanceMeters / 1000).toFixed(1)} km · aprox. {Math.ceil(route.durationSeconds / 60)} min en vehículo.</Text>}
          <Pressable accessibilityRole="button" disabled={!location || offline || routing} accessibilityState={{ disabled: !location || offline || routing }} onPress={onRoute} style={[styles.secondary, (!location || offline || routing) && styles.disabled]}><Text style={styles.secondaryText}>{routing ? 'Calculando recorrido…' : 'Ver ruta desde mi ubicación'}</Text></Pressable>
          <Text style={styles.hint}>{offline ? 'Conectate para calcular una ruta nueva.' : 'Al calcular, compartís tus coordenadas con OSRM. Ruta en vehículo, no un sendero validado; el acceso final debe confirmarse.'}</Text>
          {routeError && <Text accessibilityRole="alert" style={styles.error}>{routeError}</Text>}
          <Pressable accessibilityRole="button" disabled={routing} onPress={() => setStage('planning')} style={[styles.primary, routing && styles.disabled]}><Text style={styles.primaryText}>Planificar mi viaje en este lugar</Text></Pressable>
        </>}
        {stage === 'planning' && <>
          <View style={styles.selectedTransport}><MaterialCommunityIcons name={transportModes.find(item => item.id === transport)?.icon ?? 'help-circle-outline'} size={17} color="#0A8BB6" /><Text style={styles.selectedTransportText}>Transporte: <Text style={styles.selectedTransportStrong}>{transport}</Text></Text></View>
          <Text style={styles.copy}>Armá un estimado. No realiza reservas ni pagos.</Text>
          <Text style={styles.heading}>Personas (1 a 50)</Text>
          <TextInput accessibilityLabel="Cantidad de personas" value={people} onChangeText={setPeople} keyboardType="number-pad" style={styles.input} />
          <Text style={styles.hint}>Entrada de referencia: C$ {destination.entranceFeeCordobas} por persona · dato demo.</Text>
          <Text style={styles.heading}>Transporte (C$)</Text>
          <TextInput accessibilityLabel="Costo de transporte en córdobas" value={transportCost} onChangeText={setTransportCost} keyboardType="decimal-pad" style={styles.input} />
          <Text style={styles.heading}>Comida (C$)</Text>
          <TextInput accessibilityLabel="Costo de comida en córdobas" value={foodCost} onChangeText={setFoodCost} keyboardType="decimal-pad" style={styles.input} />
          <View style={styles.guideIncluded}><MaterialCommunityIcons name="account-check-outline" size={20} color="#0A9A72" /><View style={{ flex: 1 }}><Text style={styles.guideTitle}>Guía certificado incluido</Text><Text style={styles.guideHint}>Referencia ITINI · C$ {GUIDE_FEE} por grupo</Text></View><Text style={styles.guideAmount}>C$ {GUIDE_FEE}</Text></View>
          <Text style={styles.total}>{total === null ? 'Revisá la cantidad y los costos.' : `Estimado: C$ ${total.toLocaleString('es-NI')}`}</Text>
          {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          {!saved && <Pressable accessibilityRole="button" disabled={!valid || saving} onPress={save} style={[styles.primary, (!valid || saving) && styles.disabled]}><Text style={styles.primaryText}>{saving ? 'Guardando…' : 'Guardar plan y continuar'}</Text></Pressable>}
          {saved && <View style={styles.savedCard}><MaterialCommunityIcons name="check-circle" size={23} color="#0AA881" /><Text style={styles.savedText}>Plan guardado en tu presupuesto.</Text><Text style={styles.savedHint}>El guía certificado se estará contactando contigo pronto para planificar tu gira.</Text><Pressable onPress={onSaved} style={styles.secondary}><Text style={styles.secondaryText}>Ver en la calculadora</Text></Pressable><Pressable onPress={async () => { if (await updateLatestTripPlanStatus(destination.id, 'in_progress')) setStarted(true); }} style={styles.primary}><Text style={styles.primaryText}>Iniciar mi viaje</Text></Pressable>{started && <Text style={styles.startedText}>¡Listo! Tu viaje a {destination.name} está preparado. Para sumar otro lugar, elegí otro destino en el mapa.</Text>}</View>}
          {!saved && <Pressable accessibilityRole="button" disabled={saving} onPress={() => setStage('details')} style={styles.secondary}><Text style={styles.secondaryText}>Volver al destino</Text></Pressable>}
        </>}
      </View>
    </ItiniBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  transportList: { gap: 8 },
  transportOption: { minHeight: 68, borderRadius: 14, borderWidth: 1, borderColor: '#D5E1EB', backgroundColor: '#F7FAFC', padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  transportIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  transportCopy: { flex: 1 },
  transportTitle: { color: '#17273E', fontFamily: font.extraBold, fontSize: 14 },
  transportHint: { marginTop: 2, color: '#6B7F95', fontFamily: font.regular, fontSize: 10 },
  selectedTransport: { minHeight: 36, borderRadius: 10, backgroundColor: '#EAF5FC', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 7 },
  selectedTransportText: { flex: 1, color: '#526D84', fontFamily: font.semibold, fontSize: 11 },
  selectedTransportStrong: { color: '#17273E', fontFamily: font.extraBold },
  changeText: { color: '#087AA4', fontFamily: font.bold, fontSize: 10 },
  recommendationCard: { padding: 12, borderRadius: 14, backgroundColor: '#FFF6E9', borderWidth: 1, borderColor: '#F5D3A1', gap: 5 },
  recommendationTitle: { color: '#B36C12', fontFamily: font.extraBold, fontSize: 12 },
  guideIncluded: { minHeight: 54, borderRadius: 12, borderWidth: 1, borderColor: '#A8E7CF', backgroundColor: '#ECFFF7', padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  guideTitle: { color: '#087A5A', fontFamily: font.extraBold, fontSize: 12 },
  guideHint: { marginTop: 2, color: '#4D8774', fontFamily: font.regular, fontSize: 10 },
  guideAmount: { color: '#078463', fontFamily: font.extraBold, fontSize: 13 },
  savedCard: { padding: 12, borderRadius: 14, backgroundColor: '#ECFFF7', borderWidth: 1, borderColor: '#A8E7CF', gap: 9 },
  savedText: { color: '#087A5A', fontFamily: font.extraBold, fontSize: 13 },
  savedHint: { color: '#26725B', fontFamily: font.regular, fontSize: 11, lineHeight: 16 },
  startedText: { color: '#26725B', fontFamily: font.semibold, fontSize: 11, lineHeight: 17 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  chip: { backgroundColor: '#E9F7F4', color: '#007D60', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, fontFamily: font.bold, fontSize: 11 },
  distance: { flex: 1, color: '#526D84', fontFamily: font.semibold, fontSize: 11, lineHeight: 17 },
  copy: { color: '#465B73', fontFamily: font.regular, fontSize: 13, lineHeight: 20 },
  heading: { color: '#17273E', fontFamily: font.extraBold, fontSize: 13 },
  card: { padding: 12, borderRadius: 14, backgroundColor: '#F1FAF6', gap: 6 },
  hint: { color: '#62758B', fontFamily: font.regular, fontSize: 11, lineHeight: 17 },
  primary: { minHeight: 46, borderRadius: 13, backgroundColor: '#0AA881', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  primaryText: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 13, textAlign: 'center' },
  secondary: { minHeight: 44, borderRadius: 13, backgroundColor: '#EAF5FC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  secondaryText: { color: '#087AA4', fontFamily: font.bold, fontSize: 13 },
  disabled: { opacity: 0.45 },
  input: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: '#D2DDE7', backgroundColor: '#F5F8FB', paddingHorizontal: 12, color: '#1D324D', fontSize: 14, fontFamily: font.semibold },
  total: { color: '#078463', fontFamily: font.extraBold, fontSize: 20 },
  error: { color: '#AD3434', fontFamily: font.semibold, fontSize: 12, lineHeight: 18 },
});
