import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';

export function Screen({ children, style, ...props }: ViewProps) {
  const { settings } = useAppData();
  const light = settings.lightMode;
  return (
    <SafeAreaView style={[styles.safeArea, light && styles.lightBackground]} edges={['top']}>
      <View {...props} style={[styles.content, light && styles.lightBackground, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, backgroundColor: colors.background },
  lightBackground: { backgroundColor: '#F4F7FB' },
});
