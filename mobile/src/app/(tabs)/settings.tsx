import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { font } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [offlineMaps, setOfflineMaps] = useState(true);
  const [location, setLocation] = useState(true);
  const [reducedData, setReducedData] = useState(false);
  const { settings, updateSetting } = useAppData();
  const light = settings.lightMode;

  return (
    <Screen style={light ? styles.screenLight : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, light && styles.titleLight]}>Ajustes</Text>
        <Text style={[styles.subtitle, light && styles.subtitleLight]}>Controlá privacidad, datos offline y alertas de ITINI.</Text>

        <View style={[styles.section, light && styles.sectionLight]}>
          <Text style={[styles.sectionTitle, light && styles.sectionTitleLight]}>EXPERIENCIA</Text>
          <SettingRow icon="theme-light-dark" color="#16BDF2" title="Tema claro" description={light ? 'Interfaz y mapa en modo claro' : 'Desactivado · usando tema oscuro'} value={light} onValueChange={(value) => { void updateSetting('lightMode', value); }} light={light} />
          <SettingRow icon="bell-outline" color="#F59D1D" title="Notificaciones" description="Novedades de rutas y respuestas" value={notifications} onValueChange={setNotifications} light={light} />
          <SettingRow icon="download-circle-outline" color="#12C487" title="Mapas y datos offline" description="Mantener destinos esenciales guardados" value={offlineMaps} onValueChange={setOfflineMaps} light={light} />
          <SettingRow icon="signal-cellular-1" color="#16BDF2" title="Ahorro de datos" description="Reducir imágenes y sincronización" value={reducedData} onValueChange={setReducedData} light={light} />
        </View>

        <View style={[styles.section, light && styles.sectionLight]}>
          <Text style={[styles.sectionTitle, light && styles.sectionTitleLight]}>PRIVACIDAD Y SEGURIDAD</Text>
          <SettingRow icon="crosshairs-gps" color="#16BDF2" title="Ubicación GPS" description="Mapa, rutas y SOS Demo" value={location} onValueChange={setLocation} light={light} />
          <Pressable style={[styles.linkRow, light && styles.linkRowLight]}><View style={[styles.icon, { backgroundColor: 'rgba(240,68,77,0.12)' }]}><MaterialCommunityIcons name="shield-lock-outline" size={21} color="#F0444D" /></View><View style={styles.copy}><Text style={[styles.rowTitle, light && styles.rowTitleLight]}>Privacidad y permisos</Text><Text style={[styles.rowDescription, light && styles.rowDescriptionLight]}>Revisar cómo se usan tus datos</Text></View><MaterialCommunityIcons name="chevron-right" size={22} color="#71839B" /></Pressable>
        </View>

        <View style={[styles.section, light && styles.sectionLight]}>
          <Text style={[styles.sectionTitle, light && styles.sectionTitleLight]}>APLICACIÓN</Text>
          <Pressable style={[styles.linkRow, light && styles.linkRowLight]}><View style={[styles.icon, { backgroundColor: 'rgba(19,184,109,0.12)' }]}><MaterialCommunityIcons name="translate" size={21} color="#12C487" /></View><View style={styles.copy}><Text style={[styles.rowTitle, light && styles.rowTitleLight]}>Idioma</Text><Text style={[styles.rowDescription, light && styles.rowDescriptionLight]}>Español (Nicaragua)</Text></View><MaterialCommunityIcons name="chevron-right" size={22} color="#71839B" /></Pressable>
          <Pressable style={[styles.linkRow, light && styles.linkRowLight]}><View style={[styles.icon, { backgroundColor: 'rgba(245,157,29,0.12)' }]}><MaterialCommunityIcons name="lifebuoy" size={21} color="#F59D1D" /></View><View style={styles.copy}><Text style={[styles.rowTitle, light && styles.rowTitleLight]}>Ayuda y soporte</Text><Text style={[styles.rowDescription, light && styles.rowDescriptionLight]}>Preguntas frecuentes y contacto</Text></View><MaterialCommunityIcons name="chevron-right" size={22} color="#71839B" /></Pressable>
        </View>

        <View style={styles.demoNote}><MaterialCommunityIcons name="flask-outline" size={22} color="#F59D1D" /><Text style={styles.demoText}>SOS funciona en Modo Demostración. No contacta instituciones reales.</Text></View>
        <Text style={styles.version}>ITINI MVP · Hackathon 2026 · v1.0.0</Text>
      </ScrollView>
    </Screen>
  );
}

function SettingRow({ icon, color, title, description, value, onValueChange, light }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string; title: string; description: string; value: boolean; onValueChange: (value: boolean) => void; light: boolean }) {
  return <View style={[styles.linkRow, light && styles.linkRowLight]}><View style={[styles.icon, { backgroundColor: `${color}1F` }]}><MaterialCommunityIcons name={icon} size={21} color={color} /></View><View style={styles.copy}><Text style={[styles.rowTitle, light && styles.rowTitleLight]}>{title}</Text><Text style={[styles.rowDescription, light && styles.rowDescriptionLight]}>{description}</Text></View><Switch value={value} onValueChange={onValueChange} trackColor={{ false: light ? '#C8D4E2' : '#26364D', true: '#0A7C59' }} thumbColor={value ? '#1FDB9E' : '#8392A6'} /></View>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 34, paddingBottom: 30, gap: 14 },
  screenLight: { backgroundColor: '#F4F7FB' },
  title: { color: '#FFFFFF', fontFamily: font.black, fontSize: 22 },
  titleLight: { color: '#14243A' },
  subtitle: { marginTop: -7, color: '#849AB5', fontFamily: font.regular, fontSize: 11 },
  subtitleLight: { color: '#5E7188' },
  section: { borderRadius: 16, borderWidth: 1, borderColor: '#22334E', backgroundColor: '#111A2D', padding: 12 },
  sectionLight: { borderColor: '#D4DFEA', backgroundColor: '#FFFFFF' },
  sectionTitle: { color: '#7794B3', fontFamily: font.extraBold, fontSize: 9, marginBottom: 4 },
  sectionTitleLight: { color: '#5C7896' },
  linkRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#1D2C43' },
  linkRowLight: { borderBottomColor: '#E4EBF2' },
  icon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  rowTitle: { color: '#F3F7FC', fontFamily: font.extraBold, fontSize: 11 },
  rowTitleLight: { color: '#1B3049' },
  rowDescription: { marginTop: 3, color: '#7E91AA', fontFamily: font.regular, fontSize: 9 },
  rowDescriptionLight: { color: '#647B93' },
  demoNote: { minHeight: 58, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(245,157,29,0.35)', backgroundColor: 'rgba(245,157,29,0.1)', padding: 11, flexDirection: 'row', alignItems: 'center', gap: 9 },
  demoText: { flex: 1, color: '#D9C7A5', fontFamily: font.semibold, fontSize: 9, lineHeight: 14 },
  version: { color: '#5F7189', fontFamily: font.semibold, fontSize: 9, textAlign: 'center' },
});
