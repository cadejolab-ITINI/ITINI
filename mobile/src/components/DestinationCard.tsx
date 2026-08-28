import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import type { Destination } from '@/types/domain';

type Props = { destination: Destination; onPress: () => void; compact?: boolean };

export function DestinationCard({ destination, onPress, compact = false }: Props) {
  const durationHours = destination.durationMinutes / 60;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver ficha de ${destination.name}`}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <AppText variant="subheading" numberOfLines={1}>{destination.name}</AppText>
          <AppText variant="caption" numberOfLines={compact ? 1 : 2}>{destination.summary}</AppText>
        </View>
        <View style={styles.score}>
          <MaterialCommunityIcons name="leaf" size={16} color={colors.emerald} />
          <AppText variant="label" style={styles.scoreText}>{destination.sustainabilityScore}</AppText>
        </View>
      </View>
      <View style={styles.metrics}>
        <Metric icon="map-marker-distance" text={`${destination.distanceKm} km`} />
        <Metric icon="clock-outline" text={`${Number.isInteger(durationHours) ? durationHours : durationHours.toFixed(1)} h`} />
        <Metric icon="trending-up" text={`+${destination.elevationGainM} m`} />
        <View style={styles.difficulty}><AppText variant="label" style={styles.difficultyText}>{destination.difficulty}</AppText></View>
      </View>
    </Pressable>
  );
}

function Metric({ icon, text }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; text: string }) {
  return (
    <View style={styles.metric}>
      <MaterialCommunityIcons name={icon} size={15} color={colors.sky} />
      <AppText variant="caption">{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md, ...shadow },
  compact: { padding: spacing.md, gap: spacing.sm },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  titleBlock: { flex: 1, gap: 3 },
  score: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: 'rgba(19,184,109,0.14)' },
  scoreText: { color: colors.emerald },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  difficulty: { marginLeft: 'auto', backgroundColor: colors.surfaceRaised, paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.pill },
  difficultyText: { color: colors.textMuted },
});
