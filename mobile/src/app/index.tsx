import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { type Href, router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBrandBackground } from '@/components/AnimatedBrandBackground';
import { colors, font, shadow } from '@/constants/theme';

export default function WelcomeScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const responsiveSpacing = {
    paddingTop: Math.max(54, Math.round(height * 0.195) - insets.top),
    paddingBottom: Math.max(24, Math.round(height * 0.09) - insets.bottom),
  };

  return (
    <View style={styles.screen}>
      <AnimatedBrandBackground />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={[styles.content, responsiveSpacing]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandBlock}>
            <Image
              source={require('@/assets/brand/itini-mark.png')}
              style={styles.mark}
              resizeMode="contain"
              accessibilityLabel="Isotipo oficial de ITINI"
            />

            <Text style={styles.wordmark}>ITINI</Text>
            <Text style={styles.tagline}>ITINERARIOS DE LA NATURALEZA</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.welcomeBlock}>
            <Text style={styles.greeting}>¡Hola!</Text>
            <Text style={styles.description}>
              Te damos la bienvenida a <Text style={styles.highlight}>ITINI</Text>. Tu compañía de ruta ideal para descubrir Nicaragua de forma segura, confiable y a tu ritmo.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Siguiente"
            onPress={() => router.push('/commitments' as Href)}
            style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}
          >
            <LinearGradient
              colors={['#10C985', '#13AEE4', '#FF741B']}
              locations={[0, 0.54, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.nextGradient}
            >
              <Text style={styles.nextLabel}>Siguiente</Text>
              <MaterialCommunityIcons name="chevron-right" size={25} color={colors.white} />
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020719',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    minHeight: 680,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  brandBlock: {
    alignItems: 'center',
  },
  mark: {
    width: 116,
    height: 116,
  },
  wordmark: {
    marginTop: 18,
    color: colors.white,
    fontFamily: font.black,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: 5,
  },
  tagline: {
    marginTop: 1,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: font.extraBold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 2.1,
    textAlign: 'center',
  },
  divider: {
    width: 64,
    height: 4,
    marginTop: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  welcomeBlock: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  greeting: {
    color: colors.white,
    fontFamily: font.black,
    fontSize: 29,
    lineHeight: 36,
    textAlign: 'center',
  },
  description: {
    maxWidth: 340,
    marginTop: 11,
    color: 'rgba(255,255,255,0.94)',
    fontFamily: font.semibold,
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
  },
  highlight: {
    color: colors.orange,
    fontFamily: font.black,
  },
  nextButton: {
    width: '100%',
    marginTop: 'auto',
    borderRadius: 16,
    overflow: 'hidden',
    ...shadow,
  },
  nextButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  nextGradient: {
    minHeight: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextLabel: {
    marginLeft: 13,
    color: colors.white,
    fontFamily: font.extraBold,
    fontSize: 17,
    lineHeight: 23,
  },
});
