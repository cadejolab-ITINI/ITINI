import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, shadow } from '@/constants/theme';
import { OnboardingTransition } from '@/components/OnboardingTransition';
import { DemoWelcomeModal } from '@/components/DemoWelcomeModal';

type Commitment = {
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent: string;
  background: string;
  border: string;
};

const commitments: Commitment[] = [
  {
    title: 'Información 100% Real',
    description: 'Olvídate de datos desactualizados. Rutas y horarios verificados por expertos locales.',
    icon: 'map-outline',
    accent: '#16E39B',
    background: 'rgba(0, 104, 78, 0.24)',
    border: 'rgba(22, 227, 155, 0.28)',
  },
  {
    title: 'Presupuesto Exacto',
    description: 'Monitorea tus costos reales con la calculadora de bolsillo. Cero cobros sorpresa.',
    icon: 'calculator-variant-outline',
    accent: '#FF7A2A',
    background: 'rgba(130, 54, 18, 0.25)',
    border: 'rgba(255, 122, 42, 0.34)',
  },
  {
    title: 'Impacto Sostenible',
    description: 'Contacta directamente a guías certificados por INTUR y fomenta el comercio justo.',
    icon: 'account-group-outline',
    accent: '#16C8F3',
    background: 'rgba(0, 86, 128, 0.24)',
    border: 'rgba(22, 200, 243, 0.34)',
  },
];

function CommitmentCard({ item }: { item: Commitment }) {
  return (
    <View style={[styles.card, { borderColor: item.border }]}>
      <View style={[styles.iconBox, { backgroundColor: item.background, borderColor: item.border }]}>
        <MaterialCommunityIcons name={item.icon} size={25} color={item.accent} />
      </View>

      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
    </View>
  );
}

export default function CommitmentsScreen() {
  const [demoVisible, setDemoVisible] = useState(false);
  const enteringDemo = useRef(false);
  const exploreDemo = () => {
    if (enteringDemo.current) return;
    enteringDemo.current = true;
    setDemoVisible(false);
    router.replace('/(tabs)');
  };
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const responsiveSpacing = {
    paddingTop: Math.max(18, Math.round(height * 0.07) - insets.top),
    paddingBottom: Math.max(14, Math.round(height * 0.025) - insets.bottom),
  };

  return (
    <OnboardingTransition>
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={[styles.content, responsiveSpacing]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrow}>NUESTROS COMPROMISOS</Text>
            </View>

            <Text style={styles.title}>Explorá con</Text>
            <View style={styles.gradientWord} accessibilityLabel="Confianza">
              <Text style={[styles.title, styles.greenWord]}>Confi</Text>
              <Text style={[styles.title, styles.tealWord]}>an</Text>
              <Text style={[styles.title, styles.orangeWord]}>za</Text>
            </View>

            <Text style={styles.intro}>
              Navegá seguro con información veraz y apoyando el desarrollo de nuestras comunidades.
            </Text>
          </View>

          <View style={styles.cardList}>
            {commitments.map((item) => <CommitmentCard item={item} key={item.title} />)}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Comenzar a planear mi viaje"
            onPress={() => setDemoVisible(true)}
            style={({ pressed }) => [styles.ctaShell, pressed && styles.ctaPressed]}
          >
            <LinearGradient
              colors={['#10C985', '#13AEE4', '#FF741B']}
              locations={[0, 0.54, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaLabel}>Comenzar a planear mi viaje</Text>
              <MaterialCommunityIcons name="chevron-right" size={25} color={colors.white} />
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
      <DemoWelcomeModal visible={demoVisible} onClose={() => setDemoVisible(false)} onContinue={exploreDemo} />
    </View>
    </OnboardingTransition>
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
    minHeight: 650,
    paddingHorizontal: 23,
  },
  header: {
    alignItems: 'flex-start',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  eyebrowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#20D49B',
  },
  eyebrow: {
    color: '#20D49B',
    fontFamily: font.extraBold,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 1.15,
  },
  title: {
    marginTop: 10,
    color: colors.white,
    fontFamily: font.black,
    fontSize: 30,
    lineHeight: 36,
  },
  gradientWord: {
    flexDirection: 'row',
    marginTop: -9,
  },
  greenWord: {
    color: '#28D7A0',
  },
  tealWord: {
    color: '#31BDA7',
  },
  orangeWord: {
    color: '#F18B3A',
  },
  intro: {
    maxWidth: 330,
    marginTop: 8,
    color: '#A9C4E0',
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  cardList: {
    marginTop: 34,
    gap: 16,
  },
  card: {
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: '#0C152A',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 4,
  },
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    color: '#F8F9FF',
    fontFamily: font.extraBold,
    fontSize: 16,
    lineHeight: 21,
  },
  cardDescription: {
    marginTop: 5,
    color: '#99A7BE',
    fontFamily: font.regular,
    fontSize: 12.5,
    lineHeight: 17,
  },
  ctaShell: {
    width: '100%',
    marginTop: 'auto',
    borderRadius: 16,
    overflow: 'hidden',
    ...shadow,
  },
  ctaPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  ctaGradient: {
    minHeight: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    marginLeft: 13,
    color: colors.white,
    fontFamily: font.extraBold,
    fontSize: 17,
    lineHeight: 23,
  },
});
