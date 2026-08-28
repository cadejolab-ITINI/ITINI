import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, spacing } from '@/constants/theme';

export function BrandHeader({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/brand/itini-logo.png')}
        style={[styles.logo, compact && styles.logoCompact]}
        resizeMode="contain"
        accessibilityLabel="ITINI, turismo sostenible"
      />
      {!compact && <AppText variant="caption" style={styles.tagline}>Itinerarios de la naturaleza</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-start', gap: spacing.xs },
  logo: { width: 160, height: 62 },
  logoCompact: { width: 108, height: 42 },
  tagline: { color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.3 },
});
