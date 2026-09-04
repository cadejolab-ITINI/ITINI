import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, type PropsWithChildren } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from 'react-native';

/** Gentle entrance on both native and web, including when returning to onboarding. */
export function OnboardingTransition({ children }: PropsWithChildren) {
  const progress = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    let active = true;
    progress.setValue(0);
    const enter = (reduceMotion: boolean) => {
      if (!active) return;
      Animated.timing(progress, {
        toValue: 1,
        duration: reduceMotion ? 0 : 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    };
    AccessibilityInfo.isReduceMotionEnabled().then(enter, () => enter(false));
    return () => { active = false; progress.stopAnimation(); };
  }, [progress]));

  return (
    <View style={styles.background}>
      <Animated.View style={[styles.content, { opacity: progress }]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#020719' },
  content: { flex: 1 },
});
