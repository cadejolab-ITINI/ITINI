import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { ItiniBottomSheet } from '@/components/core/ItiniBottomSheet';
import type { Guide } from '@/database/catalog';
import { useAppData } from '@/providers/AppDataProvider';
import { font } from '@/constants/theme';

export function GuideSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { guides } = useAppData();
  const [selected, setSelected] = useState<Guide | null>(null);
  const [error, setError] = useState('');
  const contentTransition = useRef(new Animated.Value(1)).current;

  const switchGuide = (guide: Guide | null) => {
    Animated.timing(contentTransition, { toValue: 0, duration: 130, useNativeDriver: true }).start(({ finished }) => {
      if (!finished) return;
      setSelected(guide);
      Animated.timing(contentTransition, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  const contact = async (guide: Guide, channel: 'sms' | 'tel') => {
    if (!guide.phone || guide.verificationStatus === 'demo') return;
    try { await Linking.openURL(`${channel}:${guide.phone}`); }
    catch { setError('No se pudo abrir la aplicación de contacto en este dispositivo.'); }
  };
  const canContact = !!selected?.phone && selected.verificationStatus !== 'demo';

  return (
    <ItiniBottomSheet visible={visible} onClose={onClose} title="Guías Locales" badge="DIRECTORIO · VERIFICACIÓN PENDIENTE" icon="account-group-outline" accent="#08A8F7">
      <Animated.View style={{ opacity: contentTransition, transform: [{ translateY: contentTransition.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }}>
      {!selected ? (
        <View style={styles.list}>
          {guides.map((guide) => (
            <Pressable key={guide.id} onPress={() => switchGuide(guide)} style={styles.guideCard}>
              <View style={styles.guideCopy}>
                <View style={styles.nameRow}><Text style={styles.name}>{guide.name}</Text><Text style={styles.verified}>{guide.verificationStatus === 'demo' ? 'Perfil demo' : 'Verificado'}</Text></View>
                <Text style={styles.base}>{guide.base}</Text>
              </View>
              <Text style={styles.rating}>★ {guide.rating.toFixed(1)}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.detail}>
          <Pressable onPress={() => switchGuide(null)} style={styles.back}><MaterialCommunityIcons name="chevron-left" size={18} color="#078CD0" /><Text style={styles.backText}>Volver a lista de guías</Text></Pressable>
          <View style={styles.profileCard}>
            <Text style={styles.name}>{selected.name}</Text>
            <Text style={styles.base}>{selected.base} • {selected.credential}</Text>
            <Text style={styles.specialty}><Text style={styles.specialtyStrong}>Especialidad: </Text>{selected.specialty}</Text>
            <Text style={styles.skillsTitle}>HABILIDADES DURAS:</Text>
            <View style={styles.skills}>{selected.skills.map((skill) => <View style={styles.skill} key={skill}><Text style={styles.skillText}>{skill}</Text></View>)}</View>
            <View style={styles.actions}>
              <Pressable disabled={!canContact} onPress={() => contact(selected, 'sms')} style={[styles.action, styles.message, !canContact && { opacity: 0.4 }]}><Text style={styles.actionText}>Mensaje</Text></Pressable>
              <Pressable disabled={!canContact} onPress={() => contact(selected, 'tel')} style={[styles.action, styles.call, !canContact && { opacity: 0.4 }]}><Text style={styles.actionText}>Llamar</Text></Pressable>
            </View>
            {!canContact && <Text style={styles.base}>Datos de ejemplo. Contacto desactivado hasta validar identidad, credencial y teléfono.</Text>}
            {!!error && <Text accessibilityRole="alert" style={styles.base}>{error}</Text>}
          </View>
        </View>
      )}
      </Animated.View>
    </ItiniBottomSheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  guideCard: { minHeight: 58, borderRadius: 13, borderWidth: 1, borderColor: '#D5DEE8', backgroundColor: '#F6F8FB', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  guideCopy: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  name: { color: '#34445A', fontFamily: font.extraBold, fontSize: 13 },
  verified: { color: '#078CD0', fontFamily: font.bold, fontSize: 9, borderWidth: 1, borderColor: '#8AD3F5', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3 },
  base: { marginTop: 4, color: '#6D819A', fontFamily: font.regular, fontSize: 10 },
  rating: { color: '#F59D1D', fontFamily: font.extraBold, fontSize: 11 },
  detail: { gap: 12 },
  back: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#078CD0', fontFamily: font.bold, fontSize: 11 },
  profileCard: { borderRadius: 13, borderWidth: 1, borderColor: '#D5DEE8', backgroundColor: '#F6F8FB', padding: 12 },
  specialty: { marginTop: 12, color: '#5C7088', fontFamily: font.regular, fontSize: 12, lineHeight: 17 },
  specialtyStrong: { fontFamily: font.extraBold, color: '#3B4B60' },
  skillsTitle: { marginTop: 16, color: '#95A5B7', fontFamily: font.bold, fontSize: 10 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  skill: { borderRadius: 3, backgroundColor: '#DDE5EE', paddingHorizontal: 6, paddingVertical: 4 },
  skillText: { color: '#596D83', fontFamily: font.bold, fontSize: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  action: { flex: 1, minHeight: 33, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  message: { backgroundColor: '#12BD7F' },
  call: { backgroundColor: '#12A6E9' },
  actionText: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 12 },
});
