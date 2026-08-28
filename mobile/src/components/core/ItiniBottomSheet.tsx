import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, type PropsWithChildren } from 'react';
import { Animated, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, shadow } from '@/constants/theme';

type Props = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title: string;
  badge: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent: string;
  childrenScrollable?: boolean;
}>;

export function ItiniBottomSheet({
  visible,
  onClose,
  title,
  badge,
  icon,
  accent,
  children,
  childrenScrollable = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(70)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    translateY.setValue(70);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, damping: 19, stiffness: 190, mass: 0.85, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(opacity, { toValue: 1, duration: 190, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, [opacity, translateY, visible]);

  const content = childrenScrollable
    ? <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}</ScrollView>
    : <View style={styles.body}>{children}</View>;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar ventana" style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.sheet, { marginBottom: Math.max(8, insets.bottom), transform: [{ translateY }] }]}>
          <View style={styles.header}>
            <View style={[styles.iconBox, { borderColor: `${accent}44`, backgroundColor: `${accent}0D` }]}>
              <MaterialCommunityIcons name={icon} size={26} color={accent} />
            </View>
            <View style={styles.headingCopy}>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar ventana" style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#73839A" />
            </Pressable>
          </View>

          {content}

          <Pressable onPress={onClose} accessibilityRole="button" style={styles.footerButton}>
            <Text style={styles.footerLabel}>Cerrar Ventana</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(1, 7, 23, 0.82)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '78%',
    minHeight: 300,
    marginHorizontal: 18,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    ...shadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingCopy: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    color: '#152238',
    fontFamily: font.extraBold,
    fontSize: 21,
    lineHeight: 26,
  },
  badge: {
    marginTop: 2,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#EDF1F6',
  },
  badgeText: {
    color: '#697990',
    fontFamily: font.bold,
    fontSize: 9,
    lineHeight: 11,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingBottom: 12,
  },
  footerButton: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: '#0D172C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLabel: {
    color: colors.white,
    fontFamily: font.extraBold,
    fontSize: 13,
  },
});
