import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '@/constants/theme';

export function Screen({ children, style, ...props }: ViewProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View {...props} style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, backgroundColor: colors.background },
});
