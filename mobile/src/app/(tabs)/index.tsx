import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GuideSheet } from '@/components/core/GuideSheet';
import { PriceSheet } from '@/components/core/PriceSheet';
import { RouteSheet } from '@/components/core/RouteSheet';
import { SosSheet } from '@/components/core/SosSheet';
import { DestinationSheet } from '@/components/core/DestinationSheet';
import { FloatingQuickBubble } from '@/components/core/FloatingQuickBubble';
import { LocationPermissionModal } from '@/components/core/LocationPermissionModal';
import { needsLocationSettings } from '@/services/location-permission';
import { distanceKm, fetchRoadRoute, normalizeSearch, type RoadRoute } from '@/services/map-routing';
import { EsteliMap } from '@/components/map/EsteliMap';
import { colors, font, shadow } from '@/constants/theme';
import { useUserLocation } from '@/hooks/use-user-location';
import { useAppData } from '@/providers/AppDataProvider';
import type { Destination } from '@/types/domain';

type ActiveSheet = 'routes' | 'prices' | 'guides' | 'sos' | 'destination' | 'gps' | null;

const quickMenus = [
  { id: 'routes' as const, label: 'Rutas', icon: 'map-outline' as const, color: '#16C88D' },
  { id: 'prices' as const, label: 'Precios', icon: 'calculator-variant-outline' as const, color: '#FF6D1B' },
  { id: 'guides' as const, label: 'Guías', icon: 'account-group-outline' as const, color: '#13A8E7' },
  { id: 'sos' as const, label: 'SOS', icon: 'shield-alert-outline' as const, color: '#D82831' },
];

export default function MapScreen() {
  const { destinations, profile, settings, updateSetting } = useAppData();
  const { location, permission, canAskAgain, servicesEnabled, loading: locating, error: locationError, start, stop } = useUserLocation(false);
  const [selected, setSelected] = useState<Destination | null>(null);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const offline = settings.offlineMode;
  const setOffline = (value: boolean) => { void updateSetting('offlineMode', value); };
  const [sheet, setSheet] = useState<ActiveSheet>(null);
  const [toast, setToast] = useState(false);
  const [route, setRoute] = useState<RoadRoute | null>(null);
  const [routing, setRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [recenterToken, setRecenterToken] = useState(0);
  const [calculatorFirst, setCalculatorFirst] = useState(false);
  const [initialGpsBlocked, setInitialGpsBlocked] = useState(false);
  const gpsReturnSheet = useRef<ActiveSheet>(null);
  const gpsAttempt = useRef(0);
  const searchInput = useRef<TextInput>(null);
  const centeredOnce = useRef(false);
  const routeRequest = useRef<AbortController | null>(null);
  const { destinationId } = useLocalSearchParams<{ destinationId?: string }>();

  useEffect(() => {
    let disposed = false;
    // Inspect silently; the system prompt is only requested by the user's button.
    void Location.getForegroundPermissionsAsync().then((result) => {
      if (disposed) return;
      setInitialGpsBlocked(needsLocationSettings(result, Platform.OS));
      if (result.granted) void start();
      else setSheet((current) => current ?? 'gps');
    }).catch(() => { if (!disposed) setSheet((current) => current ?? 'gps'); });
    return () => { disposed = true; gpsAttempt.current += 1; };
  }, [start]);

  useEffect(() => () => routeRequest.current?.abort(), []);
  useEffect(() => {
    if (location && !centeredOnce.current) { centeredOnce.current = true; setRecenterToken((value) => value + 1); }
  }, [location]);
  useEffect(() => {
    if (offline) { routeRequest.current?.abort(); routeRequest.current = null; setRouting(false); }
  }, [offline]);
  useEffect(() => {
    const destination = destinations.find((item) => item.id === destinationId);
    if (destination) { selectDestination(destination); router.setParams({ destinationId: undefined }); }
  }, [destinationId, destinations]);

  const dismissSearch = () => {
    setSearchOpen(false);
    setStatusOpen(false);
    searchInput.current?.blur();
    Keyboard.dismiss();
  };

  const recommendations = useMemo(() => {
    const words = normalizeSearch(search).split(/\s+/).filter(Boolean);
    return destinations.filter((item) => words.every((word) => normalizeSearch(`${item.name} ${item.description} ${item.difficulty}`).includes(word))).slice(0, 5);
  }, [destinations, search]);

  const selectDestination = (destination: Destination) => {
    routeRequest.current?.abort();
    routeRequest.current = null;
    setRouting(false);
    setRouteError(null);
    if (selected?.id !== destination.id) setRoute(null);
    setSelected(destination);
    setSearch(destination.name);
    dismissSearch();
    setSheet('destination');
  };

  const locate = () => {
    dismissSearch();
    gpsReturnSheet.current = sheet === 'destination' ? 'destination' : null;
    setSheet('gps');
  };

  const activateGps = async () => {
    const attempt = ++gpsAttempt.current;
    const point = await start();
    if (point && attempt === gpsAttempt.current) {
      setRecenterToken((value) => value + 1);
      setSheet(gpsReturnSheet.current);
    }
  };

  const closeGps = () => {
    gpsAttempt.current += 1;
    if (locating) stop();
    setSheet(gpsReturnSheet.current);
  };

  const calculateRoute = async () => {
    if (!selected || !location || offline || routing) return;
    if (Date.now() - location.timestamp > 120000) { setRouteError('Tu ubicación es antigua. Actualizá el GPS antes de calcular.'); return; }
    routeRequest.current?.abort();
    const request = new AbortController();
    routeRequest.current = request;
    setRouting(true);
    setRoute(null);
    setRouteError(null);
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; request.abort(); }, 15000);
    try {
      const result = await fetchRoadRoute(location, selected, request.signal);
      if (routeRequest.current !== request || request.signal.aborted) return;
      setRoute(result);
      setSheet(null);
    } catch (error) {
      if (routeRequest.current === request && (!request.signal.aborted || timedOut)) setRouteError(timedOut ? 'La ruta tardó demasiado. Revisá tu conexión e intentá de nuevo.' : error instanceof Error ? error.message : 'No se pudo calcular la ruta.');
    } finally {
      clearTimeout(timeout);
      if (routeRequest.current === request) { routeRequest.current = null; setRouting(false); }
    }
  };

  const showSosToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 4200);
  };

  return (
    <View style={styles.screen}>
      <EsteliMap destinations={destinations} selected={selected} userLocation={location} onDestinationPress={selectDestination} onMapPress={dismissSearch} route={route} recenterToken={recenterToken} offline={offline} />

      <SafeAreaView pointerEvents="box-none" style={styles.overlay} edges={['top']}>
        {toast && <View style={styles.toast}><Text style={styles.toastText}>🚨 ¡Señal SOS emitida en Modo Demo!</Text></View>}

        <View style={styles.userPanel}>
          <View style={styles.userRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{profile?.avatar ?? '🥾'}</Text></View>
            <View style={styles.userCopy}>
              <Text style={styles.userName}>{profile?.name ?? 'Explorador ITINI'}</Text>
              <Text style={styles.username}>{profile?.username ?? '@itini'}</Text>
            </View>
            <Pressable onPress={() => setStatusOpen((current) => !current)} style={[styles.status, offline && styles.statusOffline]} accessibilityRole="button">
              <View style={[styles.statusDot, offline && styles.statusDotOffline]} />
              <Text style={[styles.statusLabel, offline && styles.statusLabelOffline]}>{offline ? 'Desconectado' : 'En línea'}</Text>
              <MaterialCommunityIcons name="chevron-down" size={14} color={offline ? '#F59D1D' : '#21D39C'} />
            </Pressable>
          </View>

          {statusOpen && (
            <View style={styles.statusMenu}>
              <Pressable accessibilityRole="button" onPress={() => { setOffline(false); setStatusOpen(false); }} style={styles.statusOption}><View style={styles.onlineOptionDot} /><Text style={styles.statusOptionText}>En línea</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => { setOffline(true); setStatusOpen(false); }} style={styles.statusOption}><View style={styles.offlineOptionDot} /><Text style={styles.statusOptionText}>Desconectado</Text></Pressable>
            </View>
          )}

          <View style={[styles.searchBar, searchOpen && styles.searchActive]}>
            <MaterialCommunityIcons name="magnify" size={20} color="#19B9EF" />
            <TextInput
              value={search}
              ref={searchInput}
              returnKeyType="search"
              onSubmitEditing={() => { if (recommendations.length) selectDestination(recommendations[0]); else dismissSearch(); }}
              onKeyPress={(event) => { if (event.nativeEvent.key === 'Escape') dismissSearch(); }}
              onChangeText={(value) => { setSearch(value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Buscar destino en Estelí…"
              placeholderTextColor="#65748D"
              style={styles.searchInput}
              accessibilityLabel="Buscar destino en Estelí"
            />
            {search.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" onPress={() => { setSearch(''); setSearchOpen(true); searchInput.current?.focus(); }}><MaterialCommunityIcons name="close-circle" size={19} color="#65748D" /></Pressable>}
          </View>

          {searchOpen && (
            <View style={styles.suggestions}>
              {recommendations.map((destination, index) => (
                <Pressable key={destination.id} accessibilityRole="button" accessibilityLabel={`Seleccionar ${destination.name}`} onPress={() => selectDestination(destination)} style={styles.suggestion}>
                  <View style={[styles.suggestionDot, { backgroundColor: index % 3 === 0 ? colors.orange : index % 3 === 1 ? colors.emerald : '#17ADE4' }]} />
                  <Text style={styles.suggestionName}>{destination.name}</Text>
                  <View style={styles.suggestionDifficulty}><Text style={styles.suggestionDifficultyText}>{destination.difficulty}</Text></View>
                </Pressable>
              ))}
              {recommendations.length === 0 && <Text style={styles.noResults}>No encontramos destinos con ese nombre.</Text>}
            </View>
          )}
        </View>

        <View style={styles.quickMenu}>
          <View style={styles.quickBadge}><Text style={styles.quickBadgeText}>MENÚ RÁPIDO</Text></View>
          {quickMenus.map((item, index) => (
            <Pressable key={item.id} onPress={() => { dismissSearch(); setCalculatorFirst(false); setSheet(item.id); }} style={styles.quickItem} accessibilityRole="button" accessibilityLabel={`Abrir ${item.label}`}>
              <FloatingQuickBubble id={item.id} index={index} active={sheet === null && !searchOpen && !statusOpen}>
                <View style={[styles.quickBubble, { backgroundColor: item.color }]}><MaterialCommunityIcons name={item.icon} size={24} color="#FFFFFF" /></View>
              </FloatingQuickBubble>
              <Text style={[styles.quickLabel, item.id === 'sos' && styles.sosLabel]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable disabled={locating} onPress={locate} style={styles.gpsButton} accessibilityRole="button" accessibilityLabel="Actualizar ubicación GPS">
          <MaterialCommunityIcons name={locating ? 'progress-clock' : 'crosshairs-gps'} size={26} color="#FFFFFF" />
        </Pressable>
        {(locationError || (!location && !locating)) && sheet !== 'gps' && <Pressable accessibilityRole="button" accessibilityLabel="Activar permiso GPS" onPress={locate} style={styles.locationError}><Text style={styles.locationErrorText}>{locationError || 'Activá tu ubicación para verte en el mapa.'} Tocá aquí.</Text></Pressable>}
        {route && selected && <View style={styles.routeSummary}>
          <Pressable accessibilityRole="button" accessibilityLabel="Ver detalle de la ruta" onPress={() => setSheet('destination')} style={{ flex: 1 }}>
            <Text style={styles.routeTitle}>{selected.name}</Text>
            <Text style={styles.routeText}>{(route.distanceMeters / 1000).toFixed(1)} km · {Math.ceil(route.durationSeconds / 60)} min en vehículo</Text>
            <Text style={styles.routeHint}>{location && distanceKm(location, route.origin) > 0.1 ? 'Te moviste. Tocá para actualizar la ruta.' : 'Naranja punteado: acceso por confirmar · datos demo'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Quitar ruta" onPress={() => setRoute(null)} style={{ padding: 10 }}><MaterialCommunityIcons name="close" size={20} color="#BED5EA" /></Pressable>
        </View>}
      </SafeAreaView>

      <RouteSheet visible={sheet === 'routes'} onClose={() => setSheet(null)} onSelect={selectDestination} />
      {sheet === 'gps' && <LocationPermissionModal visible loading={locating} error={locationError} blocked={permission ? needsLocationSettings({ status: permission, canAskAgain }, Platform.OS) : initialGpsBlocked} servicesDisabled={servicesEnabled === false} onActivate={activateGps} onClose={closeGps} />}
      <PriceSheet visible={sheet === 'prices'} initialTab={calculatorFirst ? 'Calculadora' : 'Verificados'} onClose={() => setSheet(null)} />
      {sheet === 'destination' && selected && <DestinationSheet key={selected.id} destination={selected} location={location} locating={locating} locationError={locationError} offline={offline} route={route} routing={routing} routeError={routeError} onRoute={calculateRoute} onLocate={locate} onClose={() => { routeRequest.current?.abort(); routeRequest.current = null; setRouting(false); setSheet(null); }} onSaved={() => { setCalculatorFirst(true); setSheet('prices'); }} />}
      <GuideSheet visible={sheet === 'guides'} onClose={() => setSheet(null)} />
      <SosSheet visible={sheet === 'sos'} onClose={() => setSheet(null)} onSent={showSosToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020719' },
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1 },
  userPanel: { position: 'absolute', top: 44, left: 22, right: 22, minHeight: 105, borderRadius: 18, borderWidth: 1, borderColor: '#1C2B45', backgroundColor: 'rgba(3, 9, 25, 0.94)', padding: 12, zIndex: 20 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#078CB5', backgroundColor: '#0C162B', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18 },
  userCopy: { flex: 1, marginLeft: 10 },
  userName: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 13 },
  username: { marginTop: 2, color: '#6F7E95', fontFamily: font.semibold, fontSize: 9 },
  status: { minHeight: 28, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(33,211,156,0.36)', backgroundColor: 'rgba(11,100,76,0.2)', flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusOffline: { borderColor: 'rgba(245,157,29,0.4)', backgroundColor: 'rgba(104,61,8,0.25)' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#21D39C' },
  statusDotOffline: { backgroundColor: '#F59D1D' },
  statusLabel: { color: '#21D39C', fontFamily: font.extraBold, fontSize: 10 },
  statusLabelOffline: { color: '#F59D1D' },
  statusMenu: { position: 'absolute', top: 51, right: 12, width: 130, zIndex: 30, borderRadius: 10, borderWidth: 1, borderColor: '#253751', backgroundColor: '#111C31', paddingVertical: 5, ...shadow },
  statusOption: { minHeight: 34, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  onlineOptionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#21D39C' },
  offlineOptionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59D1D' },
  statusOptionText: { color: '#DDE7F5', fontFamily: font.bold, fontSize: 10 },
  searchBar: { minHeight: 36, marginTop: 9, borderRadius: 11, borderWidth: 1, borderColor: '#1D2B43', backgroundColor: '#111A2D', paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchActive: { borderColor: '#13BDF0' },
  searchInput: { flex: 1, color: '#FFFFFF', fontFamily: font.semibold, fontSize: 11, outlineStyle: 'none' } as never,
  suggestions: { position: 'absolute', top: 105, left: 12, right: 12, borderRadius: 12, borderWidth: 1, borderColor: '#1D2B43', backgroundColor: '#071024', paddingVertical: 4, zIndex: 25, ...shadow },
  suggestion: { minHeight: 35, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  suggestionDot: { width: 8, height: 8, borderRadius: 4 },
  suggestionName: { flex: 1, color: '#F4F7FC', fontFamily: font.bold, fontSize: 11 },
  suggestionDifficulty: { borderRadius: 999, backgroundColor: '#172238', paddingHorizontal: 8, paddingVertical: 4 },
  suggestionDifficultyText: { color: '#8190A7', fontFamily: font.bold, fontSize: 8 },
  noResults: { padding: 12, color: '#8493A8', fontFamily: font.regular, fontSize: 10 },
  // El menú conserva su posición derecha; el zoom del mapa se reserva debajo en la vista web.
  quickMenu: { position: 'absolute', top: 196, right: 16, alignItems: 'center', gap: 8, zIndex: 10 },
  quickBadge: { borderRadius: 999, borderWidth: 1, borderColor: '#0A5B84', backgroundColor: '#071127', paddingHorizontal: 9, paddingVertical: 4 },
  quickBadgeText: { color: '#11A5E2', fontFamily: font.extraBold, fontSize: 8 },
  quickItem: { alignItems: 'center', gap: 3 },
  quickBubble: { width: 43, height: 43, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', alignItems: 'center', justifyContent: 'center', ...shadow },
  quickLabel: { color: '#E5EBF4', fontFamily: font.extraBold, fontSize: 8 },
  sosLabel: { color: '#F0444D' },
  gpsButton: { position: 'absolute', left: 20, bottom: 136, width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#2F5978', backgroundColor: '#0C2038', alignItems: 'center', justifyContent: 'center', ...shadow },
  routeSummary: { position: 'absolute', left: 18, right: 18, bottom: 106, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#24455F', backgroundColor: '#07142DF5', flexDirection: 'row', alignItems: 'center', gap: 4 },
  routeTitle: { fontFamily: font.extraBold, fontSize: 12, color: '#F4FAFF' },
  routeText: { fontFamily: font.semibold, fontSize: 11, color: '#73D3FF', marginTop: 3 },
  routeHint: { fontFamily: font.regular, fontSize: 9, color: '#EEBA79', marginTop: 4 },
  locationError: { position: 'absolute', left: 18, right: 80, bottom: 108, borderRadius: 9, padding: 8, backgroundColor: 'rgba(7,16,36,0.94)' },
  locationErrorText: { color: '#F59D1D', fontFamily: font.semibold, fontSize: 9 },
  toast: { position: 'absolute', top: 14, right: 8, width: 186, minHeight: 48, borderRadius: 999, backgroundColor: '#12C68A', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 13, zIndex: 60, ...shadow },
  toastText: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 10, textAlign: 'center' },
});
