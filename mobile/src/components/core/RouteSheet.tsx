import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ItiniBottomSheet } from '@/components/core/ItiniBottomSheet';
import { font } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';
import type { Difficulty } from '@/types/domain';

type Filter = 'Todos' | Difficulty;
const filters: Filter[] = ['Todos', 'Fácil', 'Medio', 'Avanzado'];

export function RouteSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { destinations } = useAppData();
  const [filter, setFilter] = useState<Filter>('Todos');
  const results = useMemo(
    () => destinations.filter((destination) => filter === 'Todos' || destination.difficulty === filter),
    [destinations, filter],
  );

  return (
    <ItiniBottomSheet visible={visible} onClose={onClose} title="Explorar Rutas" badge="ITINI VERIFIED" icon="map-outline" accent="#10C58A">
      <View style={styles.filterPanel}>
        <Text style={styles.label}>FILTRAR POR DIFICULTAD:</Text>
        <View style={styles.filters}>
          {filters.map((item) => (
            <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, item === filter && styles.filterActive]}>
              <Text style={[styles.filterText, item === filter && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.list}>
        {results.map((destination) => (
          <View style={styles.routeCard} key={destination.id}>
            <View style={styles.routeCopy}>
              <Text style={styles.routeTitle}>{destination.name}</Text>
              <Text style={styles.routeMeta}>{destination.distanceKm.toFixed(1)} km • {(destination.durationMinutes / 60).toFixed(1)} hrs</Text>
            </View>
            <View style={styles.difficulty}><Text style={styles.difficultyText}>{destination.difficulty}</Text></View>
          </View>
        ))}
      </View>
    </ItiniBottomSheet>
  );
}

const styles = StyleSheet.create({
  filterPanel: {
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#D5DEE8',
    backgroundColor: '#F5F8FB',
    padding: 10,
  },
  label: {
    color: '#8A9AAF',
    fontFamily: font.bold,
    fontSize: 10,
  },
  filters: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 5,
  },
  filter: {
    minHeight: 26,
    paddingHorizontal: 12,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D5DEE8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActive: {
    borderColor: '#10C58A',
    backgroundColor: '#10C58A',
  },
  filterText: {
    color: '#65758A',
    fontFamily: font.bold,
    fontSize: 10,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    marginTop: 12,
    gap: 8,
  },
  routeCard: {
    minHeight: 62,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#D5DEE8',
    backgroundColor: '#F5F8FB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeCopy: {
    flex: 1,
  },
  routeTitle: {
    color: '#34445B',
    fontFamily: font.bold,
    fontSize: 12,
  },
  routeMeta: {
    marginTop: 5,
    color: '#7890AA',
    fontFamily: font.regular,
    fontSize: 10,
  },
  difficulty: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#E5EAF0',
  },
  difficultyText: {
    color: '#5F7188',
    fontFamily: font.bold,
    fontSize: 9,
  },
});
