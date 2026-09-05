import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { colors, font } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';
import type { CommunityPost } from '@/types/domain';

export default function CommunityScreen() {
  const { destinations, profile, communityPosts, addCommunityPost, toggleCommunityLike, addCommunityComment, settings } = useAppData();
  const [destinationId, setDestinationId] = useState('estanzuela');
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const selectedDestination = useMemo(() => destinations.find((item) => item.id === destinationId) ?? destinations[0], [destinationId, destinations]);

  const choosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.65, base64: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    setPhotoUri(asset.base64 ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}` : asset.uri);
  };

  const publish = async () => {
    if (!profile || !selectedDestination || !text.trim()) return;
    const post: CommunityPost = {
      id: `post-${Date.now()}`,
      author: profile.name,
      role: 'Viajero ITINI',
      avatar: profile.avatar,
      destinationId: selectedDestination.id,
      destinationName: selectedDestination.name,
      rating,
      text: text.trim(),
      likes: 0,
      liked: false,
      comments: [],
      photoUri,
      createdAt: new Date().toISOString(),
    };
    if (!await addCommunityPost(post)) return;
    setText('');
    setPhotoUri(null);
  };

  return (
    <Screen style={settings.lightMode ? styles.screenLight : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, settings.lightMode && styles.titleLight]}>Comunidad</Text>

        <View style={[styles.composer, settings.lightMode && styles.cardLight]}>
          <View style={styles.composerHeader}>
            <Text style={[styles.composerTitle, settings.lightMode && styles.darkText]}>Compartir mi experiencia</Text>
            <View style={styles.stars}>{[1, 2, 3, 4, 5].map((star) => <Pressable key={star} onPress={() => setRating(star)}><MaterialCommunityIcons name={star <= rating ? 'star' : 'star-outline'} size={19} color="#F7A715" /></Pressable>)}</View>
          </View>

          <Pressable onPress={() => setDestinationOpen((current) => !current)} style={[styles.select, settings.lightMode && styles.fieldLight]}>
            <Text style={[styles.selectText, settings.lightMode && styles.darkText]}>{selectedDestination?.name ?? 'Seleccioná un destino'}</Text>
            <MaterialCommunityIcons name="chevron-down" size={22} color="#FFFFFF" />
          </Pressable>
          {destinationOpen && <View style={[styles.destinationMenu, settings.lightMode && styles.fieldLight]}>{destinations.map((destination) => <Pressable key={destination.id} onPress={() => { setDestinationId(destination.id); setDestinationOpen(false); }} style={styles.destinationOption}><Text style={[styles.destinationOptionText, settings.lightMode && styles.darkText]}>{destination.name}</Text></Pressable>)}</View>}

          <TextInput value={text} onChangeText={setText} placeholder="¿Cómo estuvo el sendero? ¿Recomendaciones de horario o clima?" placeholderTextColor={settings.lightMode ? '#7890A8' : '#9AB4D0'} multiline style={[styles.reviewInput, settings.lightMode && styles.fieldLight]} />
          {photoUri && <Image source={{ uri: photoUri }} style={styles.photoPreview} />}
          <View style={styles.publishRow}>
            <Pressable onPress={choosePhoto} style={styles.photoButton}><MaterialCommunityIcons name="image-plus" size={19} color="#17B8ED" /><Text style={styles.photoButtonText}>{photoUri ? 'Cambiar foto' : 'Añadir foto'}</Text></Pressable>
            <Pressable onPress={publish} style={[styles.publishButton, !text.trim() && styles.disabled]} disabled={!text.trim()}><Text style={styles.publishText}>Publicar Reseña</Text></Pressable>
          </View>
        </View>

        {communityPosts.map((post) => (
          <View style={[styles.post, settings.lightMode && styles.cardLight]} key={post.id}>
            <View style={styles.postHeader}>
              <Text style={styles.postAvatar}>{post.avatar}</Text>
              <View style={styles.postIdentity}><Text style={[styles.postAuthor, settings.lightMode && styles.darkText]}>{post.author}</Text><Text style={styles.postRole}>{post.role}</Text></View>
              <Text style={styles.postTime}>Reciente</Text>
            </View>
            <View style={[styles.destinationRating, settings.lightMode && styles.fieldLight]}><Text style={styles.postDestination}>{post.destinationName}</Text><Text style={styles.postRating}>★ {post.rating.toFixed(1)}</Text></View>
            {post.photoUri && !settings.reducedData && <Image source={{ uri: post.photoUri }} style={styles.postPhoto} />}
            <Text style={[styles.postText, settings.lightMode && styles.darkText]}>{post.text}</Text>
            <View style={styles.socialRow}>
              <Pressable onPress={() => toggleCommunityLike(post.id)} style={styles.socialButton}><MaterialCommunityIcons name={post.liked ? 'heart' : 'heart-outline'} size={18} color={post.liked ? '#F0444D' : '#8FA5C0'} /><Text style={styles.socialText}>{post.likes}</Text></Pressable>
              <View style={styles.socialButton}><Text style={styles.socialText}>{post.comments.length} comentarios</Text></View>
            </View>
            {post.comments.length > 0 && <View style={[styles.comments, settings.lightMode && styles.fieldLight]}>{post.comments.map((comment) => <Text key={comment.id} style={[styles.comment, settings.lightMode && styles.darkMutedText]}><Text style={[styles.commentAuthor, settings.lightMode && styles.darkText]}>{comment.author}: </Text>{comment.text}</Text>)}</View>}
            <View style={styles.commentRow}>
              <TextInput value={comments[post.id] ?? ''} onChangeText={(value) => setComments((current) => ({ ...current, [post.id]: value }))} placeholder="Escribe un comentario…" placeholderTextColor="#7890AC" style={[styles.commentInput, settings.lightMode && styles.fieldLight]} />
              <Pressable onPress={async () => { if (await addCommunityComment(post.id, profile?.name ?? 'Usuario ITINI', comments[post.id] ?? '')) setComments((current) => ({ ...current, [post.id]: '' })); }} style={styles.sendButton}><MaterialCommunityIcons name="send-outline" size={20} color="#FFFFFF" /></Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 30, gap: 16 },
  screenLight: { backgroundColor: '#F4F7FB' },
  title: { marginTop: 18, color: '#FFFFFF', fontFamily: font.black, fontSize: 22 },
  titleLight: { color: '#172B43' },
  composer: { borderRadius: 16, borderWidth: 1, borderColor: '#22334E', backgroundColor: '#111A2D', padding: 14, gap: 10 },
  cardLight: { borderColor: '#D4DFEA', backgroundColor: '#FFFFFF' },
  composerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  composerTitle: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 11 },
  darkText: { color: '#172B43' },
  darkMutedText: { color: '#526A82' },
  stars: { flexDirection: 'row', gap: 2 },
  select: { minHeight: 38, borderRadius: 11, borderWidth: 1, borderColor: '#263852', backgroundColor: '#03091A', paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center' },
  fieldLight: { borderColor: '#C7D5E3', backgroundColor: '#F1F5F9' },
  selectText: { flex: 1, color: '#FFFFFF', fontFamily: font.bold, fontSize: 11 },
  destinationMenu: { borderRadius: 11, borderWidth: 1, borderColor: '#263852', backgroundColor: '#071024', paddingVertical: 4 },
  destinationOption: { minHeight: 32, paddingHorizontal: 10, justifyContent: 'center' },
  destinationOptionText: { color: '#DDE8F5', fontFamily: font.semibold, fontSize: 10 },
  reviewInput: { minHeight: 54, borderRadius: 11, borderWidth: 1, borderColor: '#263852', backgroundColor: '#03091A', color: '#FFFFFF', padding: 10, fontFamily: font.regular, fontSize: 11, textAlignVertical: 'top', outlineStyle: 'none' } as never,
  photoPreview: { width: '100%', height: 140, borderRadius: 11 },
  publishRow: { flexDirection: 'row', gap: 8 },
  photoButton: { minHeight: 34, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#28425E', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  photoButtonText: { color: '#17B8ED', fontFamily: font.bold, fontSize: 9 },
  publishButton: { flex: 1, minHeight: 34, borderRadius: 11, backgroundColor: '#12C487', alignItems: 'center', justifyContent: 'center' },
  publishText: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 11 },
  disabled: { opacity: 0.45 },
  post: { borderRadius: 16, borderWidth: 1, borderColor: '#22334E', backgroundColor: '#111A2D', padding: 14 },
  postHeader: { flexDirection: 'row', alignItems: 'center' },
  postAvatar: { width: 34, fontSize: 22 },
  postIdentity: { flex: 1 },
  postAuthor: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 12 },
  postRole: { marginTop: 4, color: '#12D993', fontFamily: font.bold, fontSize: 9 },
  postTime: { color: '#7190B0', fontFamily: font.regular, fontSize: 8 },
  destinationRating: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 9, backgroundColor: '#071024', padding: 8 },
  postDestination: { color: '#16BDF2', fontFamily: font.bold, fontSize: 9 },
  postRating: { color: '#FFB018', fontFamily: font.extraBold, fontSize: 10 },
  postPhoto: { width: '100%', height: 160, marginTop: 10, borderRadius: 11 },
  postText: { marginTop: 11, color: '#EDF4FC', fontFamily: font.regular, fontSize: 11, lineHeight: 18 },
  socialRow: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#22334E', flexDirection: 'row', gap: 15 },
  socialButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  socialText: { color: '#8FA5C0', fontFamily: font.bold, fontSize: 9 },
  comments: { marginTop: 8, borderRadius: 10, backgroundColor: '#071024', padding: 8, gap: 5 },
  comment: { color: '#B9CAE0', fontFamily: font.regular, fontSize: 9, lineHeight: 14 },
  commentAuthor: { color: '#FFFFFF', fontFamily: font.extraBold },
  commentRow: { marginTop: 10, flexDirection: 'row', gap: 6 },
  commentInput: { flex: 1, minHeight: 32, borderRadius: 10, borderWidth: 1, borderColor: '#263852', backgroundColor: '#03091A', color: '#FFFFFF', paddingHorizontal: 10, fontFamily: font.regular, fontSize: 9, outlineStyle: 'none' } as never,
  sendButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#12A8E8', alignItems: 'center', justifyContent: 'center' },
});
