import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { colors, radius, spacing } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';

export default function DestinationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { destinations } = useAppData();
  const destination = destinations.find((item) => item.id === id);

  if (!destination) {
    return <SafeAreaView style={styles.center}><AppText>No encontramos este destino en los datos offline.</AppText></SafeAreaView>;
  }

  const hours = destination.durationMinutes / 60;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.leafCircle}><MaterialCommunityIcons name="leaf" size={28} color={colors.emerald} /></View>
            <View style={styles.scoreBlock}>
              <AppText variant="label" style={styles.scoreLabel}>SOSTENIBILIDAD</AppText>
              <AppText variant="title">{destination.sustainabilityScore}<AppText variant="caption">/100</AppText></AppText>
            </View>
          </View>
          <AppText variant="title">{destination.name}</AppText>
          <AppText style={styles.summary}>{destination.description}</AppText>
          <View style={styles.demoBadge}>
            <MaterialCommunityIcons name="flask-outline" size={16} color={colors.orange} />
            <AppText variant="label" style={styles.demoText}>DATOS MVP · VALIDACIÓN LOCAL PENDIENTE</AppText>
          </View>
        </View>

        <View style={styles.metrics}>
          <Metric icon="map-marker-distance" value={`${destination.distanceKm} km`} label="Distancia" />
          <Metric icon="clock-outline" value={`${Number.isInteger(hours) ? hours : hours.toFixed(1)} h`} label="Tiempo" />
          <Metric icon="trending-up" value={`+${destination.elevationGainM} m`} label="Elevación" />
          <Metric icon="signal-cellular-2" value={destination.difficulty} label="Exigencia" />
        </View>

        <View style={styles.capacityCard}>
          <MaterialCommunityIcons name="account-group-outline" size={28} color={colors.sky} />
          <View style={styles.capacityText}>
            <AppText variant="subheading">Capacidad de referencia</AppText>
            <AppText variant="title" style={styles.capacityValue}>{destination.capacityDaily} <AppText variant="caption">visitas por día</AppText></AppText>
            <AppText variant="caption">Debe confirmarse con administración y comunidad antes de publicarse como límite oficial.</AppText>
          </View>
        </View>

        <Section icon="hand-heart-outline" title="Impacto comunitario" color={colors.orange}>
          <AppText style={styles.sectionBody}>{destination.impactSummary}</AppText>
          <View style={styles.contribution}>
            <AppText variant="label">GASTO LOCAL ESTIMADO</AppText>
            <AppText variant="headline" style={styles.contributionValue}>{destination.communityContributionPct}%</AppText>
          </View>
          {destination.communityBenefits.map((item) => <Bullet key={item} text={item} icon="account-heart-outline" />)}
        </Section>

        <Section icon="pine-tree" title="Normas del sitio" color={colors.emerald}>
          {destination.localRules.map((item) => <Bullet key={item} text={item} icon="check-circle-outline" />)}
        </Section>

        <Section icon="recycle" title="Manejo de residuos" color={colors.sky}>
          {destination.wasteGuidance.map((item) => <Bullet key={item} text={item} icon="recycle-variant" />)}
        </Section>

        <View style={styles.priceCard}>
          <View>
            <AppText variant="label">ENTRADA DE REFERENCIA</AppText>
            <AppText variant="title" style={styles.price}>C$ {destination.entranceFeeCordobas}</AppText>
          </View>
          <MaterialCommunityIcons name="badge-account-outline" size={32} color={colors.orange} />
        </View>

        <AppText variant="caption" style={styles.coordinateNote}>Coordenadas y precios incluidos para la demostración; confirmar en campo antes de una publicación pública.</AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ icon, value, label }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.sky} />
      <AppText variant="subheading" style={styles.metricValue}>{value}</AppText>
      <AppText variant="caption" style={styles.metricLabel}>{label}</AppText>
    </View>
  );
}

function Section({ icon, title, color, children }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string; color: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitle}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
        <AppText variant="headline">{title}</AppText>
      </View>
      {children}
    </View>
  );
}

function Bullet({ text, icon }: { text: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }) {
  return (
    <View style={styles.bullet}>
      <MaterialCommunityIcons name={icon} size={18} color={colors.emerald} />
      <AppText style={styles.bulletText}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  hero: { gap: spacing.md, padding: spacing.xl, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  leafCircle: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(19,184,109,0.14)' },
  scoreBlock: { flex: 1 },
  scoreLabel: { color: colors.emerald },
  summary: { color: colors.textMuted },
  demoBadge: { alignSelf: 'flex-start', flexDirection: 'row', gap: spacing.sm, alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: 'rgba(245,157,29,0.12)' },
  demoText: { color: colors.orange, fontSize: 10 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metric: { width: '48%', minHeight: 105, alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  metricValue: { color: colors.text },
  metricLabel: { textAlign: 'center' },
  capacityCard: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: 'rgba(20,117,209,0.12)', borderWidth: 1, borderColor: 'rgba(20,117,209,0.35)' },
  capacityText: { flex: 1, gap: spacing.xs },
  capacityValue: { color: colors.sky },
  section: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionBody: { color: colors.textMuted },
  contribution: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.backgroundSoft, borderRadius: radius.md, padding: spacing.md },
  contributionValue: { color: colors.orange },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  bulletText: { flex: 1, color: colors.textMuted },
  priceCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.xl, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  price: { color: colors.orange },
  coordinateNote: { textAlign: 'center' },
});
