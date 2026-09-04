import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, Platform } from 'react-native';

type Props = PropsWithChildren<{ active: boolean; index: number; id: string }>;

// Only the artwork floats: the label and touch target stay in place.
export function FloatingQuickBubble({ children, active, index, id }: Props) {
  const offset = useRef(new Animated.Value(0)).current;
  const [focused, setFocused] = useState(false);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [reduceMotion, setReduceMotion] = useState(true);

  useFocusEffect(useCallback(() => {
    setFocused(true);
    return () => setFocused(false);
  }, []));

  useEffect(() => {
    let disposed = false;
    let preferenceChanged = false;
    const motionListener = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      preferenceChanged = true;
      setReduceMotion(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (!disposed && !preferenceChanged) setReduceMotion(value);
    }).catch(() => { /* Keep the static, accessible fallback. */ });
    const appListener = AppState.addEventListener('change', (state) => setForeground(state === 'active'));
    return () => { disposed = true; motionListener.remove(); appListener.remove(); };
  }, []);

  useEffect(() => {
    offset.setValue(0);
    if (!active || !focused || !foreground || reduceMotion) return;

    const timing = { duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web', isInteraction: false };
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(offset, { ...timing, toValue: -3 }),
      Animated.timing(offset, { ...timing, toValue: 0 }),
    ]));
    // A slight stagger keeps the four bubbles from moving like a rigid block.
    const delay = setTimeout(() => animation.start(), index * 220);
    return () => { clearTimeout(delay); animation.stop(); offset.setValue(0); };
  }, [active, focused, foreground, index, offset, reduceMotion]);

  return <Animated.View testID={`quick-menu-float-${id}`} pointerEvents="none" style={{ transform: [{ translateY: offset }] }}>{children}</Animated.View>;
}
