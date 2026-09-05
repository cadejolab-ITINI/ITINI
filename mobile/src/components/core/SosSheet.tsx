import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ItiniBottomSheet } from '@/components/core/ItiniBottomSheet';
import { font } from '@/constants/theme';
import { useUserLocation } from '@/hooks/use-user-location';
import { DemoSosGateway } from '@/services/sos';
import type { SosEvent } from '@/types/domain';

export function SosSheet({ visible, onClose, onSent }: { visible: boolean; onClose: () => void; onSent: () => void }) {
  const db = useSQLiteContext();
  const gateway = useMemo(() => new DemoSosGateway(db), [db]);
  const { location, loading, error, start } = useUserLocation(false);
  const [event, setEvent] = useState<SosEvent | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [reason, setReason] = useState('');
  const progress = useRef(new Animated.Value(0)).current;
  const contentTransition = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && !location && !loading) start().catch(() => undefined);
  }, [visible]);

  useEffect(() => {
    contentTransition.setValue(0);
    Animated.timing(contentTransition, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [event, canceling]);

  const beginHold = () => {
    if (!location || event) return;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 2500, useNativeDriver: false }).start();
  };

  const stopHold = () => {
    if (event) return;
    progress.stopAnimation();
    progress.setValue(0);
  };

  const trigger = async () => {
    if (!location || event) return;
    const next = await gateway.trigger(location);
    setEvent(next);
    progress.setValue(0);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSent();
  };

  const resolve = () => {
    if (!reason.trim()) return;
    setEvent(null);
    setCanceling(false);
    setReason('');
  };

  return (
    <ItiniBottomSheet visible={visible} onClose={onClose} title="Botón SOS" badge="GESTIÓN DE RIESGOS · DEMO" icon="shield-alert-outline" accent="#F0444D" childrenScrollable={false}>
      <View style={styles.statusCard}>
        <View><Text style={styles.statusTitle}>Sistema de Alerta SOS</Text><Text style={styles.statusText}>{loading ? 'Preparando coordenadas GPS…' : location ? 'Activado (listo para emergencias)' : 'Permiso de ubicación requerido'}</Text></View>
        <View style={[styles.activeBadge, !location && styles.pendingBadge]}><Text style={styles.activeText}>{location ? 'ACTIVADO' : 'GPS'}</Text></View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Animated.View style={{ opacity: contentTransition, transform: [{ translateY: contentTransition.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }}>
      {!event ? (
        <View style={styles.holdArea}>
          <Pressable
            disabled={!location}
            delayLongPress={2500}
            onPressIn={beginHold}
            onPressOut={stopHold}
            onLongPress={trigger}
            style={[styles.sosButton, !location && styles.disabled]}
            accessibilityRole="button"
            accessibilityLabel="Mantener presionado 2.5 segundos para enviar alerta SOS Demo"
          >
            <Animated.View style={[styles.progress, { height: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
            <MaterialCommunityIcons name="alert-outline" size={34} color="#FFFFFF" style={styles.foreground} />
            <Text style={[styles.holdLabel, styles.foreground]}>MANTENER</Text>
          </Pressable>
          <Text style={styles.instruction}>MANTÉN PRESIONADO (2.5S)</Text>
          <Text style={styles.explanation}>Presioná sin soltar para emitir la alerta GPS de emergencia. En el Hackathon se registra únicamente como demostración local.</Text>
        </View>
      ) : canceling ? (
        <View style={styles.cancelPanel}>
          <Text style={styles.successTitle}>Cancelar / resolver alerta</Text>
          <Text style={styles.explanation}>Indicá brevemente por qué se cancela esta alerta.</Text>
          <TextInput value={reason} onChangeText={setReason} placeholder="Ej. Activación accidental" placeholderTextColor="#95A3B4" style={styles.reasonInput} multiline />
          <Pressable onPress={resolve} style={styles.resolveButton}><Text style={styles.resolveText}>Confirmar resolución</Text></Pressable>
        </View>
      ) : (
        <View style={styles.successArea}>
          <View style={styles.check}><MaterialCommunityIcons name="check" size={34} color="#079768" /></View>
          <Text style={styles.successTitle}>¡Alerta SOS enviada con éxito!</Text>
          <Text style={styles.explanation}>Se guardó tu ubicación exacta en el Modo Demo. No se contactó a instituciones reales.</Text>
          <View style={styles.protocol}>
            <Text style={styles.protocolTitle}>PROTOCOLO DE EMERGENCIA:</Text>
            <Text style={styles.protocolText}>1. Mantente en un sitio seguro y visible.</Text>
            <Text style={styles.protocolText}>2. Preserva la batería de tu teléfono móvil.</Text>
            <Text style={styles.protocolText}>3. En una integración real, el equipo confirmaría la atención.</Text>
          </View>
          <Pressable onPress={() => setCanceling(true)}><Text style={styles.cancelLink}>Cancelar / Resolver Alerta</Text></Pressable>
        </View>
      )}
      </Animated.View>
    </ItiniBottomSheet>
  );
}

const styles = StyleSheet.create({
  statusCard: { minHeight: 60, marginBottom: 14, paddingHorizontal: 12, borderRadius: 13, borderWidth: 1, borderColor: '#D5DEE8', backgroundColor: '#F0F4F8', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusTitle: { color: '#34445A', fontFamily: font.semibold, fontSize: 12 },
  statusText: { marginTop: 5, color: '#7A8CA3', fontFamily: font.regular, fontSize: 9 },
  activeBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#12BD7F' },
  pendingBadge: { backgroundColor: '#F59D1D' },
  activeText: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 10 },
  error: { color: '#D43A43', fontFamily: font.semibold, fontSize: 10, textAlign: 'center', marginBottom: 8 },
  holdArea: { alignItems: 'center', paddingVertical: 10 },
  sosButton: { width: 112, height: 112, borderRadius: 56, overflow: 'hidden', backgroundColor: '#EA2028', alignItems: 'center', justifyContent: 'center', gap: 2 },
  disabled: { opacity: 0.45 },
  progress: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#A71118' },
  foreground: { zIndex: 2 },
  holdLabel: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 13 },
  instruction: { marginTop: 18, color: '#34445A', fontFamily: font.extraBold, fontSize: 13 },
  explanation: { marginTop: 6, maxWidth: 300, color: '#75869D', fontFamily: font.regular, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  successArea: { alignItems: 'center', paddingVertical: 6 },
  check: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#D6FBEA', borderWidth: 1, borderColor: '#9CEBCB', alignItems: 'center', justifyContent: 'center' },
  successTitle: { marginTop: 12, color: '#34445A', fontFamily: font.extraBold, fontSize: 14, textAlign: 'center' },
  protocol: { width: '100%', marginTop: 12, padding: 12, borderRadius: 13, borderWidth: 1, borderColor: '#85E8BE', backgroundColor: '#EFFFF7' },
  protocolTitle: { color: '#147659', fontFamily: font.extraBold, fontSize: 10, marginBottom: 5 },
  protocolText: { color: '#5F7B75', fontFamily: font.regular, fontSize: 9, lineHeight: 17 },
  cancelLink: { marginTop: 13, color: '#6D7E94', fontFamily: font.bold, fontSize: 11, textDecorationLine: 'underline' },
  cancelPanel: { alignItems: 'center', paddingVertical: 8 },
  reasonInput: { width: '100%', minHeight: 70, marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: '#D5DEE8', backgroundColor: '#F6F8FB', color: '#34445A', padding: 10, fontFamily: font.regular, fontSize: 12, textAlignVertical: 'top', outlineStyle: 'none' } as never,
  resolveButton: { width: '100%', minHeight: 38, marginTop: 9, borderRadius: 11, backgroundColor: '#12BD7F', alignItems: 'center', justifyContent: 'center' },
  resolveText: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 12 },
});
