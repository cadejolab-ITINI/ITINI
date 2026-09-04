import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { font } from '@/constants/theme';

type Props = { visible: boolean; onClose: () => void; onContinue: () => void };

export function DemoWelcomeModal({ visible, onClose, onContinue }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <LinearGradient colors={['#10C985', '#13AEE4', '#FF741B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accent} />
          <ScrollView contentContainerStyle={styles.content} bounces={false}>
            <View style={styles.icon}><MaterialCommunityIcons name="compass-outline" size={34} color="#20D49B" /></View>
            <Text style={styles.eyebrow}>ITINI · VERSIÓN DEMO</Text>
            <Text accessibilityRole="header" style={styles.title}>Un primer vistazo{ '\n' }a tu próxima aventura</Text>
            <Text style={styles.description}>Estás por explorar una versión de demostración de ITINI. Aún estamos construyendo la experiencia completa para acompañarte a descubrir Nicaragua.</Text>
            <View style={styles.note}>
              <MaterialCommunityIcons name="information-outline" size={22} color="#13AEE4" />
              <Text style={styles.noteText}>Algunas funciones y contenidos son de ejemplo. El botón SOS simula una alerta y no contacta a servicios de emergencia.</Text>
            </View>
            <Text style={styles.invitation}>Explorá, descubrí y ayudanos a mejorar.</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Explorar la demo" onPress={onContinue} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <LinearGradient colors={['#10C985', '#13AEE4', '#FF741B']} locations={[0, 0.54, 1]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.buttonFill}>
                <Text style={styles.buttonText}>Explorar la demo</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={onClose} style={styles.backButton}><Text style={styles.backText}>Volver</Text></Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(2,7,25,0.85)', justifyContent: 'center', alignItems: 'center', padding: 22 },
  card: { width: '100%', maxWidth: 410, maxHeight: '95%', borderRadius: 26, overflow: 'hidden', backgroundColor: '#0C152A', borderWidth: 1, borderColor: '#24334B' },
  accent: { height: 4 },
  content: { padding: 24, alignItems: 'center' },
  icon: { width: 68, height: 68, borderRadius: 22, backgroundColor: 'rgba(16,201,133,0.12)', borderWidth: 1, borderColor: 'rgba(16,201,133,0.28)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  eyebrow: { fontFamily: font.extraBold, color: '#20D49B', fontSize: 11, letterSpacing: 1.4, textAlign: 'center' },
  title: { fontFamily: font.black, color: '#FFFFFF', fontSize: 26, lineHeight: 32, textAlign: 'center', marginTop: 12 },
  description: { fontFamily: font.regular, color: '#A9C4E0', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 16 },
  note: { flexDirection: 'row', gap: 10, padding: 14, marginTop: 22, borderRadius: 14, backgroundColor: '#111F36' },
  noteText: { flex: 1, fontFamily: font.regular, fontSize: 13, lineHeight: 20, color: '#BDCDDE' },
  invitation: { fontFamily: font.semibold, color: '#E8F1FA', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 20, marginBottom: 22 },
  button: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  buttonFill: { minHeight: 56, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  buttonText: { fontFamily: font.extraBold, fontSize: 17, color: '#FFFFFF' },
  pressed: { opacity: 0.82 },
  backButton: { minHeight: 44, marginTop: 8, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  backText: { fontFamily: font.bold, fontSize: 14, color: '#A9C4E0' },
});
