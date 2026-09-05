import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { font } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';

export default function ProfileScreen() {
  const { profile, updateProfile, stats } = useAppData();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (profile) { setName(profile.name); setBio(profile.bio); }
  }, [profile]);

  if (!profile) return <Screen style={styles.loading}><Text style={styles.bio}>Cargando perfil…</Text></Screen>;

  const save = async () => {
    if (!name.trim()) return;
    if (!await updateProfile({ ...profile, name: name.trim(), bio: bio.trim() })) return;
    setEditing(false);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Perfil de Usuario</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{profile.avatar}</Text></View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
          <Pressable onPress={() => setEditing((current) => !current)} style={styles.editButton}><Text style={styles.editText}>{editing ? 'Cancelar' : 'Editar Perfil'}</Text></Pressable>

          {editing && <View style={styles.form}><TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Nombre" placeholderTextColor="#7488A2" /><TextInput value={bio} onChangeText={setBio} style={[styles.input, styles.bioInput]} multiline placeholder="Biografía" placeholderTextColor="#7488A2" /><Pressable onPress={save} style={styles.saveButton}><Text style={styles.saveText}>Guardar cambios</Text></Pressable></View>}
        </View>

        <View style={styles.stats}>
          <Stat value={String(stats.visits)} label="Visitas registradas" color="#20D5A0" />
          <Stat value="—" label="Verificaciones pendientes" color="#24BDF4" />
          <Stat value={String(stats.reviews)} label="Reseñas propias nuevas" color="#FF7A2A" />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return <View style={styles.stat}><Text style={[styles.statValue, { color }]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingTop: 34, paddingBottom: 30 },
  title: { color: '#FFFFFF', fontFamily: font.black, fontSize: 22 },
  profileCard: { marginTop: 18, borderRadius: 16, borderWidth: 1, borderColor: '#22334E', backgroundColor: '#111A2D', padding: 18, alignItems: 'center' },
  avatar: { width: 66, height: 66, borderRadius: 33, borderWidth: 2, borderColor: '#12C98D', backgroundColor: '#162239', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 30 },
  name: { marginTop: 10, color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 17 },
  username: { marginTop: 2, color: '#16BDF2', fontFamily: font.bold, fontSize: 10 },
  bio: { marginTop: 10, maxWidth: 290, color: '#EAF2FC', fontFamily: font.regular, fontSize: 11, lineHeight: 17, textAlign: 'center' },
  editButton: { minHeight: 32, marginTop: 14, paddingHorizontal: 17, borderRadius: 11, borderWidth: 1, borderColor: '#3C506A', backgroundColor: '#1D2A40', alignItems: 'center', justifyContent: 'center' },
  editText: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 11 },
  form: { width: '100%', marginTop: 14, gap: 8 },
  input: { minHeight: 38, borderRadius: 10, borderWidth: 1, borderColor: '#2B3D58', backgroundColor: '#071024', color: '#FFFFFF', paddingHorizontal: 10, fontFamily: font.semibold, fontSize: 11, outlineStyle: 'none' } as never,
  bioInput: { minHeight: 72, paddingTop: 10, textAlignVertical: 'top' },
  saveButton: { minHeight: 36, borderRadius: 10, backgroundColor: '#12C487', alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 11 },
  stats: { marginTop: 16, flexDirection: 'row', gap: 8 },
  stat: { flex: 1, minHeight: 74, borderRadius: 15, borderWidth: 1, borderColor: '#22334E', backgroundColor: '#111A2D', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontFamily: font.black, fontSize: 20 },
  statLabel: { marginTop: 6, color: '#8CB0D1', fontFamily: font.bold, fontSize: 8, textAlign: 'center' },
});
