import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';

export function UserLocationDot() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let disposed = false;
    let animation: Animated.CompositeAnimation | undefined;
    const configure = (reduceMotion: boolean) => {
      if (disposed) return;
      animation?.stop();
      pulse.setValue(0);
      if (!reduceMotion) {
        animation = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 2400, useNativeDriver: false }));
        animation.start();
      }
    };
    void AccessibilityInfo.isReduceMotionEnabled().then(configure);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', configure);
    return () => { disposed = true; animation?.stop(); listener.remove(); };
  }, [pulse]);
  return <View style={styles.marker} accessibilityLabel="Tu ubicación GPS"><Animated.View style={[styles.halo, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]} /><View style={styles.dot} /></View>;
}

const styles = StyleSheet.create({
  marker: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 56, height: 56, borderRadius: 28, backgroundColor: '#4285F4' },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 3, borderColor: '#FFFFFF', backgroundColor: '#4285F4' },
});
