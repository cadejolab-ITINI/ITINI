import type { SQLiteDatabase } from 'expo-sqlite';

import type { BudgetCategory, BudgetItem, CommunityComment, CommunityPost, Destination, Profile, SosEvent } from '@/types/domain';

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
  localRules: JSON.parse(row.local_rules_json),
  wasteGuidance: JSON.parse(row.waste_guidance_json),
  communityBenefits: JSON.parse(row.community_benefits_json),
  routeCoordinates: JSON.parse(row.route_coordinates_json),
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
  }>('SELECT * FROM profiles LIMIT 1');
  return row
    ? { id: row.id, name: row.name, username: row.username, avatar: row.avatar, bio: row.bio, homeRegion: row.home_region }
    : null;
}

export async function saveProfile(db: SQLiteDatabase, profile: Profile) {
  await db.runAsync(
    `UPDATE profiles SET name = ?, username = ?, avatar = ?, bio = ?, home_region = ?, updated_at = ? WHERE id = ?`,
    profile.name,
    profile.username,
    profile.avatar,
    profile.bio,
    profile.homeRegion,
    new Date().toISOString(),
    profile.id,
  );
}

export async function listBudgetItems(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<{
    id: string; name: string; amount: number; category: BudgetCategory; created_at: string;
  }>('SELECT * FROM budget_items ORDER BY created_at');
  return rows.map<BudgetItem>((row) => ({
    id: row.id,
    name: row.name,
    amount: row.amount,
    category: row.category,
    createdAt: row.created_at,
  }));
}

export async function insertBudgetItem(db: SQLiteDatabase, item: BudgetItem) {
  await db.runAsync(
    'INSERT INTO budget_items (id, name, amount, category, created_at) VALUES (?, ?, ?, ?, ?)',
    item.id,
    item.name,
    item.amount,
    item.category,
    item.createdAt,
  );
}

export async function deleteBudgetItem(db: SQLiteDatabase, id: string) {
  await db.runAsync('DELETE FROM budget_items WHERE id = ?', id);
}

export async function insertSosEvent(db: SQLiteDatabase, event: SosEvent) {
  await db.runAsync(
    `INSERT INTO sos_events (id, mode, status, latitude, longitude, accuracy, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    event.id,
    event.mode,
    event.status,
    event.latitude,
    event.longitude,
    event.accuracy,
    event.createdAt,
  );
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
  }>('SELECT * FROM community_posts ORDER BY created_at DESC');

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
    comments: JSON.parse(row.comments_json) as CommunityComment[],
    photoUri: row.photo_uri,
    createdAt: row.created_at,
  }));
}

export async function insertCommunityPost(db: SQLiteDatabase, post: CommunityPost) {
  await db.runAsync(
    `INSERT INTO community_posts (
      id, author, role, avatar, destination_id, destination_name, rating, body,
      likes, liked, comments_json, photo_uri, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    post.id,
    post.author,
    post.role,
    post.avatar,
    post.destinationId,
    post.destinationName,
    post.rating,
    post.text,
    post.likes,
    post.liked ? 1 : 0,
    JSON.stringify(post.comments),
    post.photoUri,
    post.createdAt,
  );
}

export async function saveCommunityPostState(db: SQLiteDatabase, post: CommunityPost) {
  await db.runAsync(
    'UPDATE community_posts SET likes = ?, liked = ?, comments_json = ? WHERE id = ?',
    post.likes,
    post.liked ? 1 : 0,
    JSON.stringify(post.comments),
    post.id,
  );
}
