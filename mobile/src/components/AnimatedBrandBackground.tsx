import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const createLoop = (value: Animated.Value, duration: number, delay = 0) =>
  Animated.loop(
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]),
  );

export function AnimatedBrandBackground() {
  const blueMotion = useRef(new Animated.Value(0)).current;
  const greenMotion = useRef(new Animated.Value(0)).current;
  const orangeMotion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      createLoop(blueMotion, 8500),
      createLoop(greenMotion, 10500, 800),
      createLoop(orangeMotion, 9000, 350),
    ]);

    animation.start();
    return () => animation.stop();
  }, [blueMotion, greenMotion, orangeMotion]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.background]}>
      <Animated.View
        style={[
          styles.blob,
          styles.blueBlob,
          {
            transform: [
              { translateX: blueMotion.interpolate({ inputRange: [0, 1], outputRange: [-28, 72] }) },
              { translateY: blueMotion.interpolate({ inputRange: [0, 1], outputRange: [-18, 56] }) },
              { scale: blueMotion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.blob,
          styles.greenBlob,
          {
            transform: [
              { translateX: greenMotion.interpolate({ inputRange: [0, 1], outputRange: [55, -52] }) },
              { translateY: greenMotion.interpolate({ inputRange: [0, 1], outputRange: [28, -42] }) },
              { scale: greenMotion.interpolate({ inputRange: [0, 1], outputRange: [1.08, 0.9] }) },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.blob,
          styles.orangeBlob,
          {
            transform: [
              { translateX: orangeMotion.interpolate({ inputRange: [0, 1], outputRange: [35, -48] }) },
              { translateY: orangeMotion.interpolate({ inputRange: [0, 1], outputRange: [35, -62] }) },
              { scale: orangeMotion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#020719',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 999,
  },
  blueBlob: {
    backgroundColor: 'rgba(20,117,209,0.18)',
    width: 470,
    height: 470,
    left: -235,
    top: -185,
  },
  greenBlob: {
    backgroundColor: 'rgba(19,184,109,0.12)',
    width: 540,
    height: 540,
    right: -285,
    top: 155,
  },
  orangeBlob: {
    backgroundColor: 'rgba(245,157,29,0.14)',
    width: 520,
    height: 520,
    left: -160,
    bottom: -305,
  },
});
