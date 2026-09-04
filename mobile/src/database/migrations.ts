import type { SQLiteDatabase } from 'expo-sqlite';

import { seedBudgetItems, seedCommunityPosts, seedDestinations, seedProfile } from '@/data/seed';
import { migrateV3 } from './schema-v3';

export const SCHEMA_VERSION = 3;

export async function migrateDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  await db.withTransactionAsync(async () => {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;
  if (currentVersion > SCHEMA_VERSION) throw new Error('Esta base requiere una versión más reciente de ITINI. No se modificaron los datos.');
  if (currentVersion === SCHEMA_VERSION) return;

  if (currentVersion < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        username TEXT NOT NULL,
        avatar TEXT NOT NULL,
        bio TEXT NOT NULL,
        home_region TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS destinations (
        id TEXT PRIMARY KEY NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        summary TEXT NOT NULL,
        description TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        distance_km REAL NOT NULL,
        duration_minutes INTEGER NOT NULL,
        elevation_gain_m INTEGER NOT NULL,
        difficulty TEXT NOT NULL,
        entrance_fee_cordobas REAL NOT NULL,
        capacity_daily INTEGER NOT NULL,
        sustainability_score INTEGER NOT NULL,
        community_contribution_pct INTEGER NOT NULL,
        impact_summary TEXT NOT NULL,
        local_rules_json TEXT NOT NULL,
        waste_guidance_json TEXT NOT NULL,
        community_benefits_json TEXT NOT NULL,
        route_coordinates_json TEXT NOT NULL,
        verification_status TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS budget_items (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        amount REAL NOT NULL CHECK (amount >= 0),
        category TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sos_events (
        id TEXT PRIMARY KEY NOT NULL,
        mode TEXT NOT NULL CHECK (mode IN ('demo', 'institutional')),
        status TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        accuracy REAL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        synced_at TEXT
      );
    `);
  }

  if (currentVersion < 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id TEXT PRIMARY KEY NOT NULL,
        author TEXT NOT NULL,
        role TEXT NOT NULL,
        avatar TEXT NOT NULL,
        destination_id TEXT NOT NULL,
        destination_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        body TEXT NOT NULL,
        likes INTEGER NOT NULL DEFAULT 0,
        liked INTEGER NOT NULL DEFAULT 0,
        comments_json TEXT NOT NULL DEFAULT '[]',
        photo_uri TEXT,
        created_at TEXT NOT NULL
      );
    `);
  }

  if (currentVersion < 2) await seedDatabase(db, currentVersion === 0);
  if (currentVersion < 3) await migrateV3(db);
  const violations = await db.getAllAsync('PRAGMA foreign_key_check');
  if (violations.length) throw new Error('La base contiene relaciones inválidas. La actualización se revirtió sin borrar datos.');
  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  });
}

async function seedDatabase(db: SQLiteDatabase, initialInstall: boolean) {
    await db.runAsync(
      `INSERT OR IGNORE INTO profiles
       (id, name, username, avatar, bio, home_region, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      seedProfile.id,
      seedProfile.name,
      seedProfile.username,
      seedProfile.avatar,
      seedProfile.bio,
      seedProfile.homeRegion,
      new Date().toISOString(),
    );

    for (const destination of seedDestinations) {
      await db.runAsync(
        `INSERT OR IGNORE INTO destinations (
          id, slug, name, summary, description, latitude, longitude, distance_km,
          duration_minutes, elevation_gain_m, difficulty, entrance_fee_cordobas,
          capacity_daily, sustainability_score, community_contribution_pct,
          impact_summary, local_rules_json, waste_guidance_json,
          community_benefits_json, route_coordinates_json, verification_status, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        destination.id,
        destination.slug,
        destination.name,
        destination.summary,
        destination.description,
        destination.latitude,
        destination.longitude,
        destination.distanceKm,
        destination.durationMinutes,
        destination.elevationGainM,
        destination.difficulty,
        destination.entranceFeeCordobas,
        destination.capacityDaily,
        destination.sustainabilityScore,
        destination.communityContributionPct,
        destination.impactSummary,
        JSON.stringify(destination.localRules),
        JSON.stringify(destination.wasteGuidance),
        JSON.stringify(destination.communityBenefits),
        JSON.stringify(destination.routeCoordinates),
        destination.verificationStatus,
        destination.updatedAt,
      );
    }

    const budgetCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM budget_items');
    if (initialInstall && (budgetCount?.count ?? 0) === 0) {
      for (const item of seedBudgetItems) {
        await db.runAsync(
          'INSERT INTO budget_items (id, name, amount, category, created_at) VALUES (?, ?, ?, ?, ?)',
          item.id,
          item.name,
          item.amount,
          item.category,
          item.createdAt,
        );
      }
    }


    const postCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM community_posts');
    if ((postCount?.count ?? 0) === 0) {
      for (const post of seedCommunityPosts) {
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
    }
}
