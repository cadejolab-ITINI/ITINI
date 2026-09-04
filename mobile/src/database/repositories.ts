import type { SQLiteDatabase } from 'expo-sqlite';

import type { BudgetCategory, BudgetItem, CommunityComment, CommunityPost, Destination, Profile, SosEvent } from '@/types/domain';
import { categories, isComment, isText, moneyMinor, parseArray, textValue } from './validation';
import { transaction } from './transactions';
import { newId } from './ids';
import { validCoordinate } from '@/services/map-routing';

type DestinationRow = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  duration_minutes: number;
  elevation_gain_m: number;
  difficulty: Destination['difficulty'];
  entrance_fee_cordobas: number;
  capacity_daily: number;
  sustainability_score: number;
  community_contribution_pct: number;
  impact_summary: string;
  local_rules_json: string;
  waste_guidance_json: string;
  community_benefits_json: string;
  route_coordinates_json: string;
  verification_status: Destination['verificationStatus'];
  updated_at: string;
};

const mapDestination = (row: DestinationRow): Destination => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  summary: row.summary,
  description: row.description,
  latitude: row.latitude,
  longitude: row.longitude,
  distanceKm: row.distance_km,
  durationMinutes: row.duration_minutes,
  elevationGainM: row.elevation_gain_m,
  difficulty: row.difficulty,
  entranceFeeCordobas: row.entrance_fee_cordobas,
  capacityDaily: row.capacity_daily,
  sustainabilityScore: row.sustainability_score,
  communityContributionPct: row.community_contribution_pct,
  impactSummary: row.impact_summary,
  localRules: parseArray<string>(row.local_rules_json, 'normas', isText),
  wasteGuidance: parseArray<string>(row.waste_guidance_json, 'residuos', isText),
  communityBenefits: parseArray<string>(row.community_benefits_json, 'beneficios', isText),
  routeCoordinates: parseArray(row.route_coordinates_json, 'ruta', (point) => !!point && typeof point === 'object' && validCoordinate(point as { latitude: number; longitude: number })),
  verificationStatus: row.verification_status,
  updatedAt: row.updated_at,
});

export async function listDestinations(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<DestinationRow>(`
    SELECT * FROM destinations
    ORDER BY CASE id
      WHEN 'estanzuela' THEN 1
      WHEN 'tisey' THEN 2
      WHEN 'jalacate' THEN 3
      WHEN 'garnacha' THEN 4
      WHEN 'duende' THEN 5
      ELSE 99
    END
  `);
  return rows.map(mapDestination);
}

export async function getDestination(db: SQLiteDatabase, id: string) {
  const row = await db.getFirstAsync<DestinationRow>('SELECT * FROM destinations WHERE id = ?', id);
  return row ? mapDestination(row) : null;
}

export async function getProfile(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{
    id: string; name: string; username: string; avatar: string; bio: string; home_region: string;
  }>("SELECT * FROM profiles WHERE id = (SELECT value FROM app_meta WHERE key = 'active_profile_id')");
  return row
    ? { id: row.id, name: row.name, username: row.username, avatar: row.avatar, bio: row.bio, homeRegion: row.home_region }
    : null;
}

export async function saveProfile(db: SQLiteDatabase, profile: Profile) {
  return transaction(db, async () => {
  textValue(profile.name, 'Nombre', 80);
  textValue(profile.bio, 'Biografía', 1500, 0);
  textValue(profile.username, 'Usuario', 80);
  const result = await db.runAsync(
    `UPDATE profiles SET name = ?, username = ?, avatar = ?, bio = ?, home_region = ?, updated_at = ? WHERE id = ?`,
    profile.name,
    profile.username,
    profile.avatar,
    profile.bio,
    profile.homeRegion,
    new Date().toISOString(),
    profile.id,
  );
  if (!result.changes) throw new Error('El perfil ya no existe. Recargá los datos.');
  await enqueueChange(db, 'profile', profile.id);
  });
}

export async function listBudgetItems(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<{
    id: string; name: string; amount_minor: number; category: BudgetCategory; created_at: string;
  }>("SELECT i.* FROM budget_items i JOIN budgets b ON b.id=i.budget_id WHERE i.deleted_at IS NULL AND b.owner_id=(SELECT value FROM app_meta WHERE key='active_profile_id') ORDER BY i.created_at, i.id");
  return rows.map<BudgetItem>((row) => ({
    id: row.id,
    name: row.name,
    amount: row.amount_minor / 100,
    category: row.category,
    createdAt: row.created_at,
  }));
}

export async function insertBudgetItem(db: SQLiteDatabase, item: BudgetItem) {
  return transaction(db, async () => { await writeBudgetItem(db, item); await enqueueChange(db, 'budget_item', item.id); });
}

async function writeBudgetItem(db: SQLiteDatabase, item: BudgetItem, planId: string | null = null) {
  const name = textValue(item.name, 'Concepto', 200);
  const minor = moneyMinor(item.amount);
  if (!categories.includes(item.category)) throw new Error('Categoría de gasto inválida.');
  await db.runAsync(
    'INSERT INTO budget_items (id, name, amount, category, created_at, amount_minor, budget_id, plan_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    item.id,
    name,
    minor / 100,
    item.category,
    item.createdAt,
    minor, 'default-budget', planId, item.createdAt,
  );
}

export async function deleteBudgetItem(db: SQLiteDatabase, id: string) {
  return transaction(db, async () => {
    const now = new Date().toISOString();
    const item = await db.getFirstAsync<{ plan_id: string | null }>('SELECT plan_id FROM budget_items WHERE id = ? AND deleted_at IS NULL', id);
    if (!item) return;
    await db.runAsync('UPDATE budget_items SET deleted_at = ?, updated_at = ? WHERE id = ?', now, now, id);
    if (item.plan_id) await db.runAsync('UPDATE trip_plans SET deleted_at = ? WHERE id = ?', now, item.plan_id);
    await enqueueChange(db, 'budget_item', id, 'delete');
  });
}

export async function restoreBudgetItem(db: SQLiteDatabase, id: string) {
  return transaction(db, async () => {
    const item = await db.getFirstAsync<{ plan_id: string | null }>('SELECT plan_id FROM budget_items WHERE id = ?', id);
    if (!item) throw new Error('El gasto no existe.');
    await db.runAsync('UPDATE budget_items SET deleted_at = NULL, updated_at = ? WHERE id = ?', new Date().toISOString(), id);
    if (item.plan_id) await db.runAsync('UPDATE trip_plans SET deleted_at = NULL WHERE id = ?', item.plan_id);
    await enqueueChange(db, 'budget_item', id);
  });
}

export async function insertSosEvent(db: SQLiteDatabase, event: SosEvent) {
  return transaction(db, async () => {
  if (!validCoordinate(event) || event.mode !== 'demo' || event.status !== 'simulated' || (event.accuracy != null && (!Number.isFinite(event.accuracy) || event.accuracy < 0))) throw new Error('Solo se permiten simulaciones SOS con coordenadas válidas.');
  await db.runAsync(
    `INSERT INTO sos_events (id, mode, status, latitude, longitude, accuracy, created_at, location_timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    event.id,
    event.mode,
    event.status,
    event.latitude,
    event.longitude,
    event.accuracy,
    event.createdAt,
    event.locationTimestamp ?? null,
  );
  });
}

export async function listCommunityPosts(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<{
    id: string;
    author: string;
    role: string;
    avatar: string;
    destination_id: string;
    destination_name: string;
    rating: number;
    body: string;
    likes: number;
    liked: number;
    comments_json: string;
    photo_uri: string | null;
    created_at: string;
  }>(`SELECT p.id, p.author, p.role, p.avatar, p.destination_id, p.destination_name,
      p.rating, p.body, p.likes, p.liked, p.photo_uri, p.created_at,
      COALESCE((SELECT json_group_array(json_object('id', c.id, 'author', c.author, 'text', c.body))
        FROM (SELECT * FROM community_comments WHERE post_id=p.id ORDER BY created_at, id) c), '[]') AS comments_json
      FROM community_posts p ORDER BY p.created_at DESC, p.id`);

  return rows.map<CommunityPost>((row) => ({
    id: row.id,
    author: row.author,
    role: row.role,
    avatar: row.avatar,
    destinationId: row.destination_id,
    destinationName: row.destination_name,
    rating: row.rating,
    text: row.body,
    likes: row.likes,
    liked: Boolean(row.liked),
    comments: parseArray<CommunityComment>(row.comments_json, 'comentarios', isComment),
    photoUri: row.photo_uri,
    createdAt: row.created_at,
  }));
}

export async function insertCommunityPost(db: SQLiteDatabase, post: CommunityPost) {
  return transaction(db, async () => {
  textValue(post.text, 'Reseña', 1500);
  if (!Number.isInteger(post.rating) || post.rating < 1 || post.rating > 5) throw new Error('La valoración debe estar entre 1 y 5 estrellas.');
  if (post.photoUri && (!/^data:image\/(jpeg|png|webp);base64,/.test(post.photoUri) || post.photoUri.length > 8 * 1024 * 1024)) throw new Error('Usá una foto JPG, PNG o WebP de menos de 6 MB.');
  const owner = await getProfile(db);
  if (!owner) throw new Error('No hay un perfil activo.');
  await db.runAsync(
    `INSERT INTO community_posts (
      id, author, role, avatar, destination_id, destination_name, rating, body,
      likes, liked, comments_json, photo_uri, created_at, author_profile_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    post.id,
    owner.name,
    'Viajero ITINI',
    owner.avatar,
    post.destinationId,
    post.destinationName,
    post.rating,
    post.text,
    0,
    0,
    '[]',
    post.photoUri,
    post.createdAt,
    owner.id,
  );
  await enqueueChange(db, 'community_post', post.id);
  });
}

export async function toggleCommunityPostLike(db: SQLiteDatabase, id: string) {
  return transaction(db, async () => {
    const result = await db.runAsync('UPDATE community_posts SET likes = CASE WHEN liked = 1 THEN max(0, likes-1) ELSE likes+1 END, liked = 1-liked WHERE id = ?', id);
    if (!result.changes) throw new Error('La publicación no existe.');
    await enqueueChange(db, 'community_like', id);
  });
}

export async function insertCommunityComment(db: SQLiteDatabase, postId: string, body: string) {
  return transaction(db, async () => {
    const profile = await getProfile(db);
    if (!profile) throw new Error('No hay un perfil activo.');
    const id = newId();
    await db.runAsync('INSERT INTO community_comments(post_id, id, author, author_profile_id, body, created_at) VALUES (?, ?, ?, ?, ?, ?)', postId, id, profile.name, profile.id, textValue(body, 'Comentario', 1500), new Date().toISOString());
    await enqueueChange(db, 'community_comment', id);
  });
}

async function enqueueChange(db: SQLiteDatabase, entity: string, id: string, operation = 'upsert') {
  // Metadata only. There is deliberately no uploader before Auth + consent exist.
  await db.runAsync('INSERT INTO sync_queue(entity_type, entity_id, operation, payload_json, created_at) VALUES (?, ?, ?, ?, ?)', entity, id, operation, '{"version":1}', new Date().toISOString());
}

export async function createTripPlan(db: SQLiteDatabase, destinationId: string, people: number, extras: number) {
  return transaction(db, async () => {
    if (!Number.isInteger(people) || people < 1 || people > 50) throw new Error('La cantidad de personas debe estar entre 1 y 50.');
    const destination = await getDestination(db, destinationId);
    if (!destination) throw new Error('El destino no existe.');
    const id = newId();
    const entry = moneyMinor(destination.entranceFeeCordobas);
    const extraMinor = moneyMinor(extras);
    const total = entry * people + extraMinor;
    const createdAt = new Date().toISOString();
    await db.runAsync('INSERT INTO trip_plans(id, budget_id, destination_id, people, entrance_unit_minor, extras_minor, total_minor, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', id, 'default-budget', destinationId, people, entry, extraMinor, total, createdAt);
    const item: BudgetItem = { id: newId(), name: `Plan: ${destination.name} · ${people} persona(s) · entradas + extras`, amount: total / 100, category: 'Otro', createdAt };
    await writeBudgetItem(db, item, id);
    await enqueueChange(db, 'trip_plan', id);
    await enqueueChange(db, 'budget_item', item.id);
    return id;
  });
}

export async function cancelSosEvent(db: SQLiteDatabase, id: string, reason: string) {
  return transaction(db, async () => {
    const result = await db.runAsync("UPDATE sos_events SET status='canceled', canceled_at=?, cancellation_reason=? WHERE id=? AND mode='demo' AND status='simulated'", new Date().toISOString(), textValue(reason, 'Motivo', 500, 3), id);
    if (!result.changes) throw new Error('La simulación ya fue cancelada o no existe.');
  });
}

export async function getActiveDemoSos(db: SQLiteDatabase): Promise<SosEvent | null> {
  const row = await db.getFirstAsync<{ id: string; latitude: number; longitude: number; accuracy: number | null; created_at: string; location_timestamp: string | null }>("SELECT * FROM sos_events WHERE mode='demo' AND status='simulated' ORDER BY created_at DESC LIMIT 1");
  return row ? { id: row.id, mode: 'demo', status: 'simulated', latitude: row.latitude, longitude: row.longitude, accuracy: row.accuracy, createdAt: row.created_at, locationTimestamp: row.location_timestamp ?? undefined } : null;
}
