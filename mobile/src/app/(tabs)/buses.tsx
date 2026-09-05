import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { colors, font } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';
import type { BusTerminal } from '@/types/domain';

const departments = [
  'Boaco', 'Carazo', 'Chinandega', 'Chontales', 'Estelí', 'Granada', 'Jinotega',
  'León', 'Madriz', 'Managua', 'Masaya', 'Matagalpa', 'Nueva Segovia', 'Rivas', 'Río San Juan',
];

export default function BusesScreen() {
  const { busTerminals, busSchedules } = useAppData();
  const [department, setDepartment] = useState<string | null>(null);
  const schedulesByTerminal = useMemo(() => new Map(busTerminals.map(terminal => [terminal.id, busSchedules.filter(schedule => schedule.terminalId === terminal.id)])), [busSchedules, busTerminals]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headingRow}>
          <View style={styles.headingIcon}><MaterialCommunityIcons name="bus" size={25} color={colors.sky} /></View>
          <View style={styles.headingCopy}><Text style={styles.title}>Horarios de buses</Text></View>
        </View>
        {!department && <>
          <Text style={styles.sectionIntro}>Elegí un departamento para consultar sus terminales.</Text>
          <View style={styles.departmentList}>
            {departments.map(item => {
              const available = item === 'Estelí';
              return <Pressable key={item} disabled={!available} onPress={() => setDepartment(item)} accessibilityRole="button" accessibilityState={{ disabled: !available }} style={[styles.departmentRow, !available && styles.departmentDisabled]}>
                <View style={[styles.departmentIcon, available && styles.departmentIconActive]}><MaterialCommunityIcons name={available ? 'map-marker-radius-outline' : 'lock-outline'} size={18} color={available ? colors.emerald : colors.textMuted} /></View>
                <Text style={[styles.departmentName, !available && styles.departmentNameDisabled]}>{item}</Text>
                <Text style={[styles.departmentStatus, available && styles.departmentStatusActive]}>{available ? 'Disponible' : 'Próximamente'}</Text>
                {available && <MaterialCommunityIcons name="chevron-right" size={20} color={colors.emerald} />}
              </Pressable>;
            })}
          </View>
        </>}
        {department && <>
          <Pressable onPress={() => setDepartment(null)} accessibilityRole="button" style={styles.backButton}><MaterialCommunityIcons name="arrow-left" size={17} color={colors.sky} /><Text style={styles.backText}>Cambiar departamento</Text></Pressable>
          <Text style={styles.departmentTitle}>{department}</Text>
          <View style={styles.notice} accessibilityRole="text">
          <MaterialCommunityIcons name="information-outline" size={18} color={colors.orange} />
          <Text style={styles.noticeText}>Horarios de referencia. Pueden cambiar por temporada; confirmá en la terminal antes de viajar.</Text>
          </View>

          {busTerminals.map(terminal => <TerminalCard key={terminal.id} terminal={terminal} schedules={schedulesByTerminal.get(terminal.id) ?? []} />)}
          {busTerminals.length === 0 && <View style={styles.empty}><MaterialCommunityIcons name="bus-alert" size={30} color={colors.textMuted} /><Text style={styles.emptyTitle}>Aún no hay horarios guardados</Text><Text style={styles.emptyText}>Con conexión, actualizá el catálogo para descargar la información.</Text></View>}
          <View style={styles.offlineNote}><MaterialCommunityIcons name="database-check-outline" size={18} color={colors.emerald} /><Text style={styles.offlineText}>Disponible sin internet · guardado en tu dispositivo</Text></View>
        </>}
      </ScrollView>
    </Screen>
  );
}

function TerminalCard({ terminal, schedules }: { terminal: BusTerminal; schedules: ReturnType<typeof useAppData>['busSchedules'] }) {
  const openSource = () => { void Linking.openURL(terminal.sourceUrl); };
  return (
    <View style={styles.terminalCard}>
      <View style={styles.terminalHeader}>
        <View style={[styles.terminalIcon, { backgroundColor: terminal.name === 'Cotran Norte' ? 'rgba(20,117,209,0.16)' : 'rgba(19,184,109,0.16)' }]}><MaterialCommunityIcons name="bus" size={22} color={terminal.name === 'Cotran Norte' ? colors.sky : colors.emerald} /></View>
        <View style={styles.terminalCopy}><Text style={styles.terminalName}>{terminal.name}</Text><Text style={styles.direction}>{terminal.direction}</Text></View>
      </View>
      <View style={styles.locationRow}><MaterialCommunityIcons name="map-marker-outline" size={15} color={colors.textMuted} /><Text style={styles.location}>{terminal.address}</Text></View>
      <View style={styles.contactRow}><MaterialCommunityIcons name="phone-outline" size={14} color={colors.textMuted} /><Text style={styles.contact}>{terminal.phone}</Text><Pressable onPress={openSource} accessibilityRole="link" style={styles.sourceButton}><Text style={styles.sourceText}>Ver fuente</Text><MaterialCommunityIcons name="open-in-new" size={12} color={colors.sky} /></Pressable></View>
      <Text style={styles.scheduleLabel}>SALIDAS PUBLICADAS</Text>
      {schedules.map(schedule => <View style={styles.scheduleRow} key={schedule.id}>
        <View style={styles.timePill}><Text style={styles.time}>{schedule.departureTime}</Text></View>
        <View style={styles.scheduleCopy}><Text style={styles.destination}>{schedule.destination}</Text><Text style={styles.meta}>{schedule.serviceType}{schedule.durationMinutes ? ` · ${Math.round(schedule.durationMinutes / 60 * 10) / 10} h aprox.` : ''}</Text><Text style={styles.note}>{schedule.notes}</Text></View>
        {schedule.fareCordobas !== null && <Text style={styles.fare}>C$ {schedule.fareCordobas}</Text>}
      </View>)}
      <Text style={styles.updated}>Consulta pública: {terminal.checkedAt} · {terminal.name === 'Cotran Norte' ? 'Estelí Buses' : 'Estelí Buses'}</Text>
      <Text style={styles.disclaimer}>* La fuente advierte que no administra las terminales ni garantiza cambios de horario.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 30, paddingBottom: 120, gap: 14 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  headingIcon: { width: 45, height: 45, borderRadius: 14, borderWidth: 1, borderColor: '#245277', backgroundColor: '#0D2741', alignItems: 'center', justifyContent: 'center' },
  headingCopy: { flex: 1 },
  title: { color: colors.text, fontFamily: font.black, fontSize: 22 },
  sectionIntro: { color: colors.textMuted, fontFamily: font.regular, fontSize: 11, lineHeight: 17 },
  departmentList: { borderRadius: 16, borderWidth: 1, borderColor: '#223B57', backgroundColor: '#111C30', paddingHorizontal: 12 },
  departmentRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#21354D' },
  departmentDisabled: { opacity: 0.65 },
  departmentIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#1D2A40', alignItems: 'center', justifyContent: 'center' },
  departmentIconActive: { backgroundColor: 'rgba(19,184,109,0.14)' },
  departmentName: { flex: 1, color: colors.text, fontFamily: font.extraBold, fontSize: 12 },
  departmentNameDisabled: { color: '#A2B0C0' },
  departmentStatus: { color: '#71839B', fontFamily: font.semibold, fontSize: 9 },
  departmentStatusActive: { color: colors.emerald },
  backButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2 },
  backText: { color: colors.sky, fontFamily: font.bold, fontSize: 10 },
  departmentTitle: { color: colors.text, fontFamily: font.black, fontSize: 19 },
  notice: { borderRadius: 13, borderWidth: 1, borderColor: 'rgba(245,157,29,0.35)', backgroundColor: 'rgba(245,157,29,0.1)', padding: 11, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  noticeText: { flex: 1, color: '#E9D5AE', fontFamily: font.semibold, fontSize: 10, lineHeight: 15 },
  terminalCard: { borderRadius: 17, borderWidth: 1, borderColor: '#223B57', backgroundColor: '#111C30', padding: 14, gap: 8 },
  terminalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  terminalIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  terminalCopy: { flex: 1 },
  terminalName: { color: colors.text, fontFamily: font.extraBold, fontSize: 17 },
  direction: { marginTop: 2, color: colors.textMuted, fontFamily: font.semibold, fontSize: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5 },
  location: { flex: 1, color: '#B5C7DA', fontFamily: font.regular, fontSize: 10, lineHeight: 14 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  contact: { color: '#B5C7DA', fontFamily: font.semibold, fontSize: 10 },
  sourceButton: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 3, paddingLeft: 7 },
  sourceText: { color: colors.sky, fontFamily: font.bold, fontSize: 10 },
  scheduleLabel: { marginTop: 4, color: '#7794B3', fontFamily: font.extraBold, fontSize: 9 },
  scheduleRow: { minHeight: 65, borderRadius: 12, borderWidth: 1, borderColor: '#263E59', backgroundColor: '#0C1729', padding: 9, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  timePill: { minWidth: 68, minHeight: 29, borderRadius: 9, backgroundColor: '#173452', alignItems: 'center', justifyContent: 'center' },
  time: { color: '#DFF4FF', fontFamily: font.extraBold, fontSize: 11 },
  scheduleCopy: { flex: 1 },
  destination: { color: '#F4F8FD', fontFamily: font.extraBold, fontSize: 11 },
  meta: { marginTop: 2, color: '#8EC7E5', fontFamily: font.semibold, fontSize: 9 },
  note: { marginTop: 2, color: '#8EA4BD', fontFamily: font.regular, fontSize: 8, lineHeight: 12 },
  fare: { color: colors.orange, fontFamily: font.extraBold, fontSize: 11, marginTop: 4 },
  updated: { color: '#7F98B3', fontFamily: font.semibold, fontSize: 8 },
  disclaimer: { color: '#6E8199', fontFamily: font.regular, fontSize: 8, lineHeight: 12 },
  offlineNote: { borderRadius: 12, backgroundColor: 'rgba(19,184,109,0.1)', padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  offlineText: { color: '#9EDCC1', fontFamily: font.semibold, fontSize: 9 },
  empty: { alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#223B57', padding: 25, gap: 7 },
  emptyTitle: { color: colors.text, fontFamily: font.extraBold, fontSize: 14 },
  emptyText: { color: colors.textMuted, fontFamily: font.regular, fontSize: 10, textAlign: 'center' },
});
