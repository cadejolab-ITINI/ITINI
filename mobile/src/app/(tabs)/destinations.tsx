import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Href, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { font } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';
import type { Difficulty } from '@/types/domain';

type Filter = 'Todos' | Difficulty;
const filters: Filter[] = ['Todos', 'Fácil', 'Medio', 'Avanzado'];

export default function DestinationsScreen() {
  const { destinations, tripPlans, updateTripPlanStatus } = useAppData();
  const [section, setSection] = useState<'explore' | 'saved' | 'completed'>('explore');
  const [filter, setFilter] = useState<Filter>('Todos');
  const results = useMemo(() => destinations.filter((item) => filter === 'Todos' || item.difficulty === filter), [destinations, filter]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Destinos</Text>
        <View style={styles.sectionTabs}>
          {([['explore', 'Explorar'], ['saved', 'Guardados'], ['completed', 'Completados']] as const).map(([id, label]) => <Pressable key={id} onPress={() => setSection(id)} accessibilityRole="button" accessibilityState={{ selected: section === id }} style={[styles.sectionTab, section === id && styles.sectionTabActive]}><Text style={[styles.sectionTabText, section === id && styles.sectionTabTextActive]}>{label}</Text></Pressable>)}
        </View>
        {section === 'explore' && <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>FILTRAR POR EXIGENCIA:</Text>
          <View style={styles.filters}>{filters.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></Pressable>)}</View>
        </View>}

        {section === 'explore' && results.map((destination) => (
          <View style={styles.card} key={destination.id}>
            <View style={styles.titleRow}><Text style={styles.destinationTitle}>{destination.name}</Text><View style={styles.badge}><Text style={styles.badgeText}>{destination.difficulty}</Text></View></View>
            <Text style={styles.meta}>{destination.distanceKm.toFixed(1)} km • {(destination.durationMinutes / 60).toFixed(1)} hrs</Text>
            <Text style={styles.description}>{destination.description}</Text>
            <Pressable onPress={() => router.push({ pathname: '/(tabs)', params: { destinationId: destination.id } } as Href)} style={styles.mapButton}><MaterialCommunityIcons name="map-marker-outline" size={17} color="#17BDF1" /><Text style={styles.mapButtonText}>Ver en el Mapa</Text></Pressable>
          </View>
        ))}
        {section !== 'explore' && <>
          <Text style={styles.sectionDescription}>{section === 'saved' ? 'Tus planes preparados para comenzar.' : 'Lugares que ya marcaste como completados.'}</Text>
          {tripPlans.filter(plan => section === 'saved' ? plan.status !== 'completed' : plan.status === 'completed').map(plan => <Pressable accessibilityRole="button" accessibilityLabel={`Abrir plan de ${plan.destinationName}`} onPress={() => router.push({ pathname: '/(tabs)', params: { destinationId: plan.destinationId } } as Href)} style={styles.planCard} key={plan.id}>
            <View style={styles.planIcon}><MaterialCommunityIcons name={plan.status === 'in_progress' ? 'map-marker-path' : 'bookmark-outline'} size={22} color={plan.status === 'in_progress' ? '#12C487' : '#16BDF2'} /></View>
            <View style={styles.planCopy}><Text style={styles.planTitle}>{plan.destinationName}</Text><Text style={styles.planMeta}>{plan.people} persona{plan.people === 1 ? '' : 's'} · {plan.transportMode} · C$ {plan.total.toLocaleString('es-NI')}</Text><Text style={styles.planDate}>{plan.status === 'in_progress' ? 'Viaje iniciado' : plan.status === 'completed' ? `Completado el ${new Date(plan.createdAt).toLocaleDateString('es-NI')}` : `Guardado el ${new Date(plan.createdAt).toLocaleDateString('es-NI')}`}</Text></View>
            {section === 'saved' && <Pressable onPress={async () => { await updateTripPlanStatus(plan.id, 'completed'); }} style={styles.completeButton}><Text style={styles.completeText}>Completar</Text></Pressable>}
          </Pressable>)}
          {tripPlans.filter(plan => section === 'saved' ? plan.status !== 'completed' : plan.status === 'completed').length === 0 && <View style={styles.emptyPlans}><MaterialCommunityIcons name={section === 'saved' ? 'bookmark-off-outline' : 'check-circle-outline'} size={28} color="#71839B" /><Text style={styles.emptyTitle}>{section === 'saved' ? 'No hay destinos guardados' : 'Todavía no hay destinos completados'}</Text><Text style={styles.emptyText}>{section === 'saved' ? 'Planificá un destino y aparecerá aquí.' : 'Cuando termines un viaje, marcá el plan como completado.'}</Text></View>}
        </>}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 34, paddingBottom: 26, gap: 13 },
  title: { color: '#FFFFFF', fontFamily: font.black, fontSize: 22, marginBottom: 2 },
  sectionTabs: { flexDirection: 'row', borderRadius: 13, backgroundColor: '#111A2D', borderWidth: 1, borderColor: '#22334E', padding: 3 },
  sectionTab: { flex: 1, minHeight: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTabActive: { backgroundColor: '#12AEEB' },
  sectionTabText: { color: '#8CA0BA', fontFamily: font.bold, fontSize: 10 },
  sectionTabTextActive: { color: '#FFFFFF' },
  sectionDescription: { color: '#849AB5', fontFamily: font.regular, fontSize: 11 },
  planCard: { borderRadius: 16, borderWidth: 1, borderColor: '#22334E', backgroundColor: '#111A2D', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  planIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#1B2D44', alignItems: 'center', justifyContent: 'center' },
  planCopy: { flex: 1 },
  planTitle: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 13 },
  planMeta: { marginTop: 4, color: '#9FC2DB', fontFamily: font.semibold, fontSize: 9 },
  planDate: { marginTop: 3, color: '#71839B', fontFamily: font.regular, fontSize: 9 },
  completeButton: { minHeight: 31, paddingHorizontal: 9, borderRadius: 9, backgroundColor: '#0B7D59', alignItems: 'center', justifyContent: 'center' },
  completeText: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 9 },
  emptyPlans: { minHeight: 160, borderRadius: 16, borderWidth: 1, borderColor: '#22334E', backgroundColor: '#111A2D', alignItems: 'center', justifyContent: 'center', padding: 18, gap: 7 },
  emptyTitle: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 13 },
  emptyText: { color: '#849AB5', fontFamily: font.regular, fontSize: 10, textAlign: 'center' },
  filterPanel: { borderRadius: 16, borderWidth: 1, borderColor: '#22334E', backgroundColor: '#111A2D', padding: 12 },
  filterLabel: { color: '#82A0C0', fontFamily: font.bold, fontSize: 9 },
  filters: { flexDirection: 'row', gap: 7, marginTop: 9 },
  filter: { minHeight: 33, paddingHorizontal: 14, borderRadius: 11, borderWidth: 1, borderColor: '#21314B', backgroundColor: '#03091A', alignItems: 'center', justifyContent: 'center' },
  filterActive: { backgroundColor: '#12AEEB', borderColor: '#12AEEB' },
  filterText: { color: '#8CA0BA', fontFamily: font.bold, fontSize: 10 },
  filterTextActive: { color: '#FFFFFF' },
  card: { borderRadius: 16, borderWidth: 1, borderColor: '#22334E', backgroundColor: '#111A2D', padding: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  destinationTitle: { flex: 1, color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 15 },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: '#1D2940' },
  badgeText: { color: '#A7B8CE', fontFamily: font.bold, fontSize: 8 },
  meta: { marginTop: 10, color: '#80B2D4', fontFamily: font.bold, fontSize: 9 },
  description: { marginTop: 13, color: '#EDF4FC', fontFamily: font.regular, fontSize: 11, lineHeight: 19 },
  mapButton: { minHeight: 34, marginTop: 12, borderRadius: 11, backgroundColor: '#202C42', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  mapButtonText: { color: '#17BDF1', fontFamily: font.extraBold, fontSize: 11 },
});
