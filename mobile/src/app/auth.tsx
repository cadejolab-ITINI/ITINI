import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, shadow } from '@/constants/theme';
import { avatarOptions, loginLocalAccount, registerLocalAccount } from '@/database/auth';
import { useSQLiteContext } from 'expo-sqlite';
import { useAppData } from '@/providers/AppDataProvider';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const db = useSQLiteContext();
  const { refresh } = useAppData();
  const [mode, setMode] = useState<Mode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<string>(avatarOptions[0]);
  const [busy, setBusy] = useState(false);

  const showError = (cause: unknown) => Alert.alert('No pudimos continuar', cause instanceof Error ? cause.message : 'Revisá los datos e intentá nuevamente.');
  const continueToApp = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (mode === 'login') await loginLocalAccount(db, username, password);
      else await registerLocalAccount(db, { firstName, lastName, username, password, avatar });
      await refresh();
      router.replace('/(tabs)');
    } catch (cause) {
      showError(cause);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><MaterialCommunityIcons name="arrow-left" size={22} color={colors.textMuted} /></Pressable>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>ITINI</Text></View>
          <Text style={styles.title}>{mode === 'login' ? 'Tu próxima aventura' : 'Creá tu cuenta'}</Text>
          <Text style={styles.subtitle}>{mode === 'login' ? 'Iniciá sesión para continuar con tu perfil local.' : 'Guardá tus rutas, reseñas y presupuestos en este dispositivo.'}</Text>

          <View style={styles.tabs}>
            <Pressable onPress={() => setMode('login')} style={[styles.tab, mode === 'login' && styles.tabActive]}><Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Iniciar sesión</Text></Pressable>
            <Pressable onPress={() => setMode('register')} style={[styles.tab, mode === 'register' && styles.tabActive]}><Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Crear cuenta</Text></Pressable>
          </View>

          {mode === 'register' && <View style={styles.row}>
            <Field label="Nombre" value={firstName} onChangeText={setFirstName} placeholder="Tu nombre" autoCapitalize="words" />
            <Field label="Apellido" value={lastName} onChangeText={setLastName} placeholder="Tu apellido" autoCapitalize="words" />
          </View>}
          <Field label="Usuario" value={username} onChangeText={setUsername} placeholder="ej. ana_nicaragua" autoCapitalize="none" autoCorrect={false} />
          <Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="Mínimo 8 caracteres" secureTextEntry autoCapitalize="none" />

          {mode === 'register' && <View style={styles.avatarSection}>
            <Text style={styles.label}>Elegí tu avatar</Text>
            <View style={styles.avatarList}>{avatarOptions.map((option) => <Pressable key={option} accessibilityRole="button" accessibilityLabel={`Avatar ${option}`} onPress={() => setAvatar(option)} style={[styles.avatarOption, avatar === option && styles.avatarSelected]}><Text style={styles.avatarEmoji}>{option}</Text></Pressable>)}</View>
          </View>}

          <Pressable accessibilityRole="button" disabled={busy} onPress={continueToApp} style={({ pressed }) => [styles.submit, pressed && styles.submitPressed, busy && styles.submitDisabled]}>
            <Text style={styles.submitText}>{busy ? 'Guardando…' : mode === 'login' ? 'Entrar a ITINI' : 'Crear mi cuenta'}</Text>
            {!busy && <MaterialCommunityIcons name="arrow-right" size={20} color={colors.white} />}
          </Pressable>
          <Text style={styles.note}><MaterialCommunityIcons name="lock-outline" size={13} color="#6EDDB5" /> Tus datos se guardan localmente en este dispositivo.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; secureTextEntry?: boolean; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; autoCorrect?: boolean }) {
  const { label, ...inputProps } = props;
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput {...inputProps} style={styles.input} placeholderTextColor="#6E7F98" /></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 28 },
  back: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#0E1B30', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  brandMark: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 8, backgroundColor: '#0A2837', borderWidth: 1, borderColor: '#13B86D' },
  brandMarkText: { color: colors.white, fontFamily: font.black, fontSize: 18, letterSpacing: 2 },
  title: { color: colors.text, fontFamily: font.black, fontSize: 30, lineHeight: 37, marginTop: 22 },
  subtitle: { color: colors.textMuted, fontFamily: font.regular, fontSize: 14, lineHeight: 20, marginTop: 7, maxWidth: 330 },
  tabs: { flexDirection: 'row', backgroundColor: '#101D32', borderRadius: 12, padding: 4, marginTop: 27, marginBottom: 22 },
  tab: { flex: 1, minHeight: 40, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: '#182943', ...shadow },
  tabText: { color: '#8091AA', fontFamily: font.bold, fontSize: 12 },
  tabTextActive: { color: colors.white },
  row: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, marginBottom: 15 },
  label: { color: '#B4C7DC', fontFamily: font.bold, fontSize: 12, marginBottom: 7 },
  input: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: '#263C58', backgroundColor: '#0D1B30', color: colors.white, fontFamily: font.semibold, fontSize: 14, paddingHorizontal: 14 },
  avatarSection: { marginTop: 2, marginBottom: 19 },
  avatarList: { flexDirection: 'row', gap: 9 },
  avatarOption: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#2A405B', backgroundColor: '#0D1B30', alignItems: 'center', justifyContent: 'center' },
  avatarSelected: { borderColor: '#13B86D', backgroundColor: '#103E3A', borderWidth: 2 },
  avatarEmoji: { fontSize: 21 },
  submit: { minHeight: 56, borderRadius: 15, marginTop: 12, paddingHorizontal: 20, backgroundColor: '#13B86D', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, ...shadow },
  submitPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: colors.white, fontFamily: font.extraBold, fontSize: 16 },
  note: { color: '#7890A8', fontFamily: font.regular, fontSize: 11, textAlign: 'center', marginTop: 18 },
});
