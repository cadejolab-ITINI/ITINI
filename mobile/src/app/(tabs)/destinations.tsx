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
  const { destinations } = useAppData();
  const [filter, setFilter] = useState<Filter>('Todos');
  const results = useMemo(() => destinations.filter((item) => filter === 'Todos' || item.difficulty === filter), [destinations, filter]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Destinos</Text>
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>FILTRAR POR EXIGENCIA:</Text>
          <View style={styles.filters}>{filters.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></Pressable>)}</View>
        </View>

        {results.map((destination) => (
          <View style={styles.card} key={destination.id}>
            <View style={styles.titleRow}><Text style={styles.destinationTitle}>{destination.name}</Text><View style={styles.badge}><Text style={styles.badgeText}>{destination.difficulty}</Text></View></View>
            <Text style={styles.meta}>{destination.distanceKm.toFixed(1)} km • {(destination.durationMinutes / 60).toFixed(1)} hrs</Text>
            <Text style={styles.description}>{destination.description}</Text>
            <Pressable onPress={() => router.push({ pathname: '/(tabs)', params: { destinationId: destination.id } } as Href)} style={styles.mapButton}><MaterialCommunityIcons name="map-marker-outline" size={17} color="#17BDF1" /><Text style={styles.mapButtonText}>Ver en el Mapa</Text></Pressable>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 34, paddingBottom: 26, gap: 13 },
  title: { color: '#FFFFFF', fontFamily: font.black, fontSize: 22, marginBottom: 2 },
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
