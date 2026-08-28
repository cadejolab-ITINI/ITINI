import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors, radius, spacing } from '@/constants/theme';
import { useUserLocation } from '@/hooks/use-user-location';
import { DemoSosGateway } from '@/services/sos';
import type { SosEvent } from '@/types/domain';

export default function SosScreen() {
  const db = useSQLiteContext();
  const gateway = useMemo(() => new DemoSosGateway(db), [db]);
  const { location, loading, error, start } = useUserLocation(false);
  const [event, setEvent] = useState<SosEvent | null>(null);
  const [status, setStatus] = useState('Prepará tus coordenadas para iniciar la demostración.');
  const progress = useRef(new Animated.Value(0)).current;

  const beginHold = () => {
    if (!location || event) return;
    setStatus('Mantené presionado durante 2.5 segundos…');
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 2500, useNativeDriver: false }).start();
  };

  const cancelHold = () => {
    if (event) return;
    progress.stopAnimation();
    progress.setValue(0);
    if (location) setStatus('Coordenadas listas. Mantené presionado para simular.');
  };

  const trigger = async () => {
    if (!location) return;
    const nextEvent = await gateway.trigger(location);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEvent(nextEvent);
    setStatus('Simulación guardada localmente. No se contactó a ninguna institución.');
  };

  const prepareLocation = async () => {
    const point = await start();
    if (point) setStatus('Coordenadas listas. Mantené presionado para simular.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.demoBanner}>
          <MaterialCommunityIcons name="flask-outline" size={25} color={colors.orange} />
          <View style={styles.bannerText}>
            <AppText variant="headline" style={styles.demoTitle}>MODO DEMOSTRACIÓN</AppText>
            <AppText variant="caption">No llama, no envía mensajes y no transmite tu ubicación fuera del dispositivo.</AppText>
          </View>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationTitle}>
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color={colors.sky} />
            <AppText variant="headline">Coordenadas reales</AppText>
          </View>
          {location ? (
            <>
              <AppText variant="title" style={styles.coordinates}>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</AppText>
              <AppText variant="caption">Precisión aproximada: {location.accuracy ? `${Math.round(location.accuracy)} m` : 'no disponible'}</AppText>
            </>
          ) : (
            <AppText style={styles.muted}>ITINI solicitará permiso únicamente para preparar esta demostración y mostrarte en el mapa.</AppText>
          )}
          {error && <AppText variant="caption" style={styles.error}>{error}</AppText>}
          {!location && <PrimaryButton label={loading ? 'Obteniendo ubicación…' : 'Preparar coordenadas'} icon="crosshairs-gps" onPress={prepareLocation} disabled={loading} tone="secondary" />}
        </View>

        <View style={styles.sosArea}>
          <Pressable
            disabled={!location || Boolean(event)}
            delayLongPress={2500}
            onPressIn={beginHold}
            onPressOut={cancelHold}
            onLongPress={trigger}
            accessibilityRole="button"
            accessibilityLabel="Mantener presionado para simular una alerta SOS"
            style={[styles.sosButton, (!location || event) && styles.sosDisabled, event && styles.sosSuccess]}
          >
            <Animated.View style={[styles.progress, { height: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
            <MaterialCommunityIcons name={event ? 'check-bold' : 'shield-alert-outline'} size={48} color={colors.white} style={styles.sosContent} />
            <AppText variant="headline" style={styles.sosContent}>{event ? 'SIMULADO' : 'MANTENER'}</AppText>
          </Pressable>
          <AppText style={styles.status}>{status}</AppText>
        </View>

        {event && (
          <View style={styles.resultCard}>
            <MaterialCommunityIcons name="database-check-outline" size={29} color={colors.emerald} />
            <View style={styles.resultText}>
              <AppText variant="subheading">Evento Demo registrado</AppText>
              <AppText variant="caption">ID: {event.id}</AppText>
              <AppText variant="caption">Estado: simulated · almacenamiento SQLite local</AppText>
            </View>
          </View>
        )}

        <View style={styles.architectureNote}>
          <AppText variant="subheading">Separación de seguridad</AppText>
          <AppText variant="caption">El código utiliza un DemoSosGateway local. El InstitutionalSosGateway permanece bloqueado y solo podrá activarse tras convenios, autenticación, auditoría y protocolos oficiales.</AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  demoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: 'rgba(245,157,29,0.14)', borderWidth: 1, borderColor: 'rgba(245,157,29,0.45)' },
  bannerText: { flex: 1, gap: spacing.xs },
  demoTitle: { color: colors.orange },
  locationCard: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  locationTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  coordinates: { color: colors.sky, fontSize: 24 },
  muted: { color: colors.textMuted },
  error: { color: colors.orange },
  sosArea: { alignItems: 'center', gap: spacing.lg },
  sosButton: { width: 190, height: 190, borderRadius: 95, backgroundColor: colors.danger, borderWidth: 8, borderColor: '#FF777C', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, overflow: 'hidden' },
  sosDisabled: { opacity: 0.45 },
  sosSuccess: { backgroundColor: colors.emerald, borderColor: '#6FE3A8', opacity: 1 },
  progress: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.dangerDark },
  sosContent: { zIndex: 2, color: colors.white },
  status: { textAlign: 'center', color: colors.textMuted, maxWidth: 360 },
  resultCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: 'rgba(19,184,109,0.12)', borderWidth: 1, borderColor: 'rgba(19,184,109,0.35)' },
  resultText: { flex: 1, gap: 2 },
  architectureNote: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
