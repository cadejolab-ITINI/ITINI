import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius, spacing } from '@/constants/theme';
import { useConnectivity } from '@/hooks/use-connectivity';

export function ConnectivityBadge() {
  const online = useConnectivity();
  const label = online === null ? 'Comprobando' : online ? 'En línea' : 'Offline listo';

  return (
    <View style={[styles.badge, !online && styles.offline]} accessibilityLabel={`Estado de conexión: ${label}`}>
      <View style={[styles.dot, !online && styles.dotOffline]} />
      <AppText variant="label" style={[styles.text, !online && styles.textOffline]}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: 'rgba(19,184,109,0.14)',
    borderWidth: 1, borderColor: 'rgba(19,184,109,0.35)',
  },
  offline: { backgroundColor: 'rgba(245,157,29,0.14)', borderColor: 'rgba(245,157,29,0.4)' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.emerald },
  dotOffline: { backgroundColor: colors.orange },
  text: { color: colors.emerald },
  textOffline: { color: colors.orange },
});
