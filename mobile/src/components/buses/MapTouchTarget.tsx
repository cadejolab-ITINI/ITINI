import type { PropsWithChildren } from 'react';
import { G } from 'react-native-svg';

export function MapTouchTarget({ children, onPress, label }: PropsWithChildren<{ onPress: () => void; label: string }>) {
  return <G onPress={onPress} accessibilityLabel={label}>{children}</G>;
}
