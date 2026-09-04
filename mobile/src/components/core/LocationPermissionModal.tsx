import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { font } from '@/constants/theme';

type Props = {
  visible: boolean;
  loading: boolean;
  blocked: boolean;
  servicesDisabled: boolean;
  error: string | null;
  onActivate: () => void;
  onClose: () => void;
};

export function LocationPermissionModal({ visible, loading, blocked, servicesDisabled, error, onActivate, onClose }: Props) {
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const needsSettings = blocked || servicesDisabled;
  const openSettings = async () => {
    setSettingsError(null);
    try { await Linking.openSettings(); }
    catch { setSettingsError('No pudimos abrir los ajustes. Abrilos manualmente y buscá ITINI → Permisos → Ubicación.'); }
  };

  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <SafeAreaView style={styles.backdrop}>
      <View style={styles.card} accessibilityViewIsModal>
        <LinearGradient colors={['#10C985', '#13AEE4', '#FF741B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accent} />
        <ScrollView contentContainerStyle={styles.content} bounces={false}>
          <View style={styles.icon}><MaterialCommunityIcons name="crosshairs-gps" size={32} color="#39C3FF" /></View>
          <Text style={styles.eyebrow}>TU UBICACIÓN · TU DECISIÓN</Text>
          <Text accessibilityRole="header" style={styles.title}>{loading ? 'Buscando tu ubicación' : 'Activá tu ubicación'}</Text>
          <Text style={styles.description}>Permití que ITINI acceda a tu ubicación para mostrar tu punto azul en el mapa y calcular la distancia a los destinos.</Text>
          <View style={styles.note}>
            <MaterialCommunityIcons name="shield-check-outline" size={22} color="#20D49B" />
            <Text style={styles.noteText}>Solo solicitamos ubicación mientras usás la app, no acceso en segundo plano. Activar el GPS no envía una alerta SOS; el SOS sigue siendo una demostración.</Text>
          </View>
          {needsSettings && <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>{servicesDisabled ? 'Encendé la ubicación del dispositivo' : 'El permiso está bloqueado'}</Text>
            <Text style={styles.instructionsText}>{Platform.OS === 'web'
              ? 'En los permisos del sitio de tu navegador, cambiá Ubicación a Permitir y reintentá. Si la vista integrada no ofrece ese control, abrí esta misma dirección en un navegador que permita geolocalización. ITINI no puede activar ese permiso por vos.'
              : servicesDisabled
                ? 'Activá Ubicación / Localización en los ajustes del teléfono. Después volvé a ITINI y tocá Reintentar GPS.'
                : 'Abrí los ajustes de ITINI y permití Ubicación mientras usás la app. Después volvé aquí y tocá Reintentar GPS.'}</Text>
          </View>}
          {(error || settingsError) && <Text accessibilityRole="alert" style={styles.error}>{settingsError || error}</Text>}
          {loading && <ActivityIndicator accessibilityLabel="Obteniendo coordenadas reales" color="#39C3FF" style={styles.spinner} />}
          {needsSettings && Platform.OS !== 'web' && <Pressable accessibilityRole="button" disabled={loading} onPress={openSettings} style={styles.settingsButton}><Text style={styles.settingsText}>Abrir ajustes</Text></Pressable>}
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: loading }} disabled={loading} onPress={onActivate} style={[styles.button, loading && styles.disabled]}>
            <LinearGradient colors={['#10C985', '#13AEE4', '#FF741B']} locations={[0, 0.54, 1]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.buttonFill}>
              <Text style={styles.buttonText}>{loading ? 'Obteniendo GPS…' : needsSettings || error ? 'Reintentar GPS' : 'Activar GPS'}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.later}><Text style={styles.laterText}>Ahora no, seguir explorando</Text></Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(2,7,25,0.85)', justifyContent: 'center', alignItems: 'center', padding: 22 },
  card: { width: '100%', maxWidth: 410, maxHeight: '95%', borderRadius: 26, overflow: 'hidden', backgroundColor: '#0C152A', borderWidth: 1, borderColor: '#24334B' },
  accent: { height: 4 },
  content: { padding: 22, alignItems: 'center', gap: 14 },
  icon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#132D46', borderWidth: 1, borderColor: '#225275' },
  eyebrow: { fontFamily: font.extraBold, color: '#20D49B', fontSize: 10, letterSpacing: 1.3, textAlign: 'center' },
  title: { fontFamily: font.black, color: '#FFFFFF', fontSize: 25, lineHeight: 31, textAlign: 'center' },
  description: { fontFamily: font.regular, color: '#BDD0E4', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  note: { flexDirection: 'row', gap: 10, padding: 13, borderRadius: 14, backgroundColor: '#111F36' },
  noteText: { flex: 1, fontFamily: font.regular, fontSize: 12, lineHeight: 19, color: '#BDCDDE' },
  instructions: { padding: 13, borderRadius: 14, backgroundColor: '#20283A', gap: 6, width: '100%' },
  instructionsTitle: { fontFamily: font.extraBold, color: '#FFD199', fontSize: 13 },
  instructionsText: { fontFamily: font.regular, color: '#D1DDEE', fontSize: 12, lineHeight: 19 },
  error: { color: '#FFC28D', fontFamily: font.semibold, fontSize: 12, lineHeight: 18 },
  spinner: { marginVertical: 4 },
  button: { width: '100%', borderRadius: 15, overflow: 'hidden' },
  buttonFill: { minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  buttonText: { fontFamily: font.extraBold, fontSize: 16, color: '#FFFFFF' },
  disabled: { opacity: 0.55 },
  settingsButton: { minHeight: 46, width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: 1, borderColor: '#276C96' },
  settingsText: { color: '#78D7FF', fontFamily: font.bold, fontSize: 14 },
  later: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  laterText: { fontFamily: font.bold, color: '#ACC0D9', fontSize: 13, textAlign: 'center' },
});
