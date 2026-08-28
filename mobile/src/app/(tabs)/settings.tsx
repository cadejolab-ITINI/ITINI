import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { font } from '@/constants/theme';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [offlineMaps, setOfflineMaps] = useState(true);
  const [location, setLocation] = useState(true);
  const [reducedData, setReducedData] = useState(false);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Ajustes</Text>
        <Text style={styles.subtitle}>Controlá privacidad, datos offline y alertas de ITINI.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPERIENCIA</Text>
          <SettingRow icon="bell-outline" color="#F59D1D" title="Notificaciones" description="Novedades de rutas y respuestas" value={notifications} onValueChange={setNotifications} />
          <SettingRow icon="download-circle-outline" color="#12C487" title="Mapas y datos offline" description="Mantener destinos esenciales guardados" value={offlineMaps} onValueChange={setOfflineMaps} />
          <SettingRow icon="signal-cellular-1" color="#16BDF2" title="Ahorro de datos" description="Reducir imágenes y sincronización" value={reducedData} onValueChange={setReducedData} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACIDAD Y SEGURIDAD</Text>
          <SettingRow icon="crosshairs-gps" color="#16BDF2" title="Ubicación GPS" description="Mapa, rutas y SOS Demo" value={location} onValueChange={setLocation} />
          <Pressable style={styles.linkRow}><View style={[styles.icon, { backgroundColor: 'rgba(240,68,77,0.12)' }]}><MaterialCommunityIcons name="shield-lock-outline" size={21} color="#F0444D" /></View><View style={styles.copy}><Text style={styles.rowTitle}>Privacidad y permisos</Text><Text style={styles.rowDescription}>Revisar cómo se usan tus datos</Text></View><MaterialCommunityIcons name="chevron-right" size={22} color="#71839B" /></Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APLICACIÓN</Text>
          <Pressable style={styles.linkRow}><View style={[styles.icon, { backgroundColor: 'rgba(19,184,109,0.12)' }]}><MaterialCommunityIcons name="translate" size={21} color="#12C487" /></View><View style={styles.copy}><Text style={styles.rowTitle}>Idioma</Text><Text style={styles.rowDescription}>Español (Nicaragua)</Text></View><MaterialCommunityIcons name="chevron-right" size={22} color="#71839B" /></Pressable>
          <Pressable style={styles.linkRow}><View style={[styles.icon, { backgroundColor: 'rgba(245,157,29,0.12)' }]}><MaterialCommunityIcons name="lifebuoy" size={21} color="#F59D1D" /></View><View style={styles.copy}><Text style={styles.rowTitle}>Ayuda y soporte</Text><Text style={styles.rowDescription}>Preguntas frecuentes y contacto</Text></View><MaterialCommunityIcons name="chevron-right" size={22} color="#71839B" /></Pressable>
        </View>

        <View style={styles.demoNote}><MaterialCommunityIcons name="flask-outline" size={22} color="#F59D1D" /><Text style={styles.demoText}>SOS funciona en Modo Demostración. No contacta instituciones reales.</Text></View>
        <Text style={styles.version}>ITINI MVP · Hackathon 2026 · v1.0.0</Text>
      </ScrollView>
    </Screen>
  );
}

function SettingRow({ icon, color, title, description, value, onValueChange }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string; title: string; description: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return <View style={styles.linkRow}><View style={[styles.icon, { backgroundColor: `${color}1F` }]}><MaterialCommunityIcons name={icon} size={21} color={color} /></View><View style={styles.copy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowDescription}>{description}</Text></View><Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#26364D', true: '#0A7C59' }} thumbColor={value ? '#1FDB9E' : '#8392A6'} /></View>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 34, paddingBottom: 30, gap: 14 },
  title: { color: '#FFFFFF', fontFamily: font.black, fontSize: 22 },
  subtitle: { marginTop: -7, color: '#849AB5', fontFamily: font.regular, fontSize: 11 },
  section: { borderRadius: 16, borderWidth: 1, borderColor: '#22334E', backgroundColor: '#111A2D', padding: 12 },
  sectionTitle: { color: '#7794B3', fontFamily: font.extraBold, fontSize: 9, marginBottom: 4 },
  linkRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#1D2C43' },
  icon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  rowTitle: { color: '#F3F7FC', fontFamily: font.extraBold, fontSize: 11 },
  rowDescription: { marginTop: 3, color: '#7E91AA', fontFamily: font.regular, fontSize: 9 },
  demoNote: { minHeight: 58, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(245,157,29,0.35)', backgroundColor: 'rgba(245,157,29,0.1)', padding: 11, flexDirection: 'row', alignItems: 'center', gap: 9 },
  demoText: { flex: 1, color: '#D9C7A5', fontFamily: font.semibold, fontSize: 9, lineHeight: 14 },
  version: { color: '#5F7189', fontFamily: font.semibold, fontSize: 9, textAlign: 'center' },
});
