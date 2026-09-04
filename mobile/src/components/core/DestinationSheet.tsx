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

export function DestinationSheet({ destination, location, locating, locationError, route, routing, routeError, offline, onClose, onLocate, onRoute, onSaved }: Props) {
  const { addTripPlan } = useAppData();
  const [planning, setPlanning] = useState(false);
  const [people, setPeople] = useState('1');
  const [extras, setExtras] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const savingLock = useRef(false);
  const distance = location ? distanceKm(location, destination) : null;
  const visitors = Number(people);
  const additional = Number(extras.replace(',', '.'));
  const valid = Number.isInteger(visitors) && visitors >= 1 && visitors <= 50 && Number.isFinite(additional) && additional >= 0 && additional <= 1000000;
  const total = valid ? destination.entranceFeeCordobas * visitors + additional : null;
  const save = async () => {
    if (total === null || savingLock.current) return;
    savingLock.current = true;
    setSaving(true);
    setError('');
    try {
      if (!await addTripPlan(destination.id, visitors, additional)) { setError('No se pudo guardar. Revisá el importe (máximo dos decimales) e intentá de nuevo.'); return; }
      onSaved();
    } catch { setError('No se pudo guardar. Tu plan sigue aquí; intentá de nuevo.'); }
    finally { savingLock.current = false; setSaving(false); }
  };

  return (
    <ItiniBottomSheet visible onClose={saving ? () => {} : onClose} title={planning ? 'Planificá tu visita' : destination.name} badge={destination.verificationStatus === 'demo' ? 'DESTINO · DATOS DEMO' : 'EXPLORÁ ESTELÍ'} icon="map-marker-outline" accent="#0AAAE5">
      <View style={styles.content}>
        {planning && <Text style={styles.heading}>{destination.name}</Text>}
        <View style={styles.meta}><Text style={styles.chip}>{destination.difficulty}</Text><Text style={styles.distance}>{distance === null ? 'Activá GPS para conocer la distancia' : `${distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`} desde vos · en línea recta`}</Text></View>
        {!planning && <>
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
          <Pressable accessibilityRole="button" disabled={routing} onPress={() => setPlanning(true)} style={[styles.primary, routing && styles.disabled]}><Text style={styles.primaryText}>Planificar mi viaje en este lugar</Text></Pressable>
        </>}
        {planning && <>
          <Text style={styles.copy}>Armá un estimado para tu visita. No realiza reservas ni pagos.</Text>
          <Text style={styles.heading}>Personas (1 a 50)</Text>
          <TextInput accessibilityLabel="Cantidad de personas" value={people} onChangeText={setPeople} keyboardType="number-pad" style={styles.input} />
          <Text style={styles.hint}>Entrada de referencia: C$ {destination.entranceFeeCordobas} por persona · dato demo.</Text>
          <Text style={styles.heading}>Transporte, comida y guía: total extra C$</Text>
          <TextInput accessibilityLabel="Costos adicionales en córdobas" value={extras} onChangeText={setExtras} keyboardType="decimal-pad" style={styles.input} />
          <Text style={styles.hint}>Ingresá tus cotizaciones. Los extras no están incluidos si dejás cero.</Text>
          <Text style={styles.total}>{total === null ? 'Revisá la cantidad y los costos.' : `Estimado: C$ ${total.toLocaleString('es-NI')}`}</Text>
          {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <Pressable accessibilityRole="button" disabled={!valid || saving} onPress={save} style={[styles.primary, (!valid || saving) && styles.disabled]}><Text style={styles.primaryText}>{saving ? 'Guardando…' : 'Guardar en mi presupuesto'}</Text></Pressable>
          <Pressable accessibilityRole="button" disabled={saving} onPress={() => setPlanning(false)} style={styles.secondary}><Text style={styles.secondaryText}>Volver al destino</Text></Pressable>
        </>}
      </View>
    </ItiniBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
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
