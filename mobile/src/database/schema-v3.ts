import type { SQLiteDatabase } from 'expo-sqlite';
import { guides, verifiedPrices } from '@/data/core';
import type { CommunityComment } from '@/types/domain';
import { isComment, moneyMinor, parseArray } from './validation';

export async function migrateV3(db: SQLiteDatabase) {
  const profile = await db.getFirstAsync<{ id: string }>('SELECT id FROM profiles ORDER BY id LIMIT 1');
  if (!profile) throw new Error('Falta el perfil local. La actualización se canceló sin borrar datos.');
  const now = new Date().toISOString();
  await db.execAsync(`
    CREATE TABLE app_meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    CREATE TABLE app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value INTEGER NOT NULL CHECK(value IN (0,1)), updated_at TEXT NOT NULL
    );
    CREATE TABLE budgets (
      id TEXT PRIMARY KEY NOT NULL, owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
      name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 120),
      currency TEXT NOT NULL DEFAULT 'NIO' CHECK(currency = 'NIO'), created_at TEXT NOT NULL
    );
    CREATE TABLE trip_plans (
      id TEXT PRIMARY KEY NOT NULL, budget_id TEXT NOT NULL REFERENCES budgets(id) ON DELETE RESTRICT,
      destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
      people INTEGER NOT NULL CHECK(typeof(people) = 'integer' AND people BETWEEN 1 AND 50),
      entrance_unit_minor INTEGER NOT NULL CHECK(typeof(entrance_unit_minor) = 'integer' AND entrance_unit_minor >= 0),
      extras_minor INTEGER NOT NULL CHECK(typeof(extras_minor) = 'integer' AND extras_minor >= 0),
      total_minor INTEGER NOT NULL CHECK(total_minor = people * entrance_unit_minor + extras_minor),
      created_at TEXT NOT NULL, deleted_at TEXT
    );
    ALTER TABLE budget_items ADD COLUMN budget_id TEXT REFERENCES budgets(id) ON DELETE RESTRICT;
    ALTER TABLE budget_items ADD COLUMN amount_minor INTEGER NOT NULL DEFAULT 0 CHECK(typeof(amount_minor) = 'integer' AND amount_minor >= 0);
    ALTER TABLE budget_items ADD COLUMN plan_id TEXT REFERENCES trip_plans(id) ON DELETE RESTRICT;
    ALTER TABLE budget_items ADD COLUMN updated_at TEXT;
    ALTER TABLE budget_items ADD COLUMN deleted_at TEXT;
    ALTER TABLE community_posts ADD COLUMN author_profile_id TEXT REFERENCES profiles(id) ON DELETE RESTRICT;
    CREATE TABLE community_comments (
      post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
      id TEXT NOT NULL, author TEXT NOT NULL CHECK(length(trim(author)) BETWEEN 1 AND 80),
      author_profile_id TEXT REFERENCES profiles(id) ON DELETE RESTRICT,
      body TEXT NOT NULL CHECK(length(trim(body)) BETWEEN 1 AND 1500), created_at TEXT NOT NULL,
      PRIMARY KEY(post_id, id)
    );
    CREATE TABLE guides (
      id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, base TEXT NOT NULL,
      rating REAL NOT NULL CHECK(rating BETWEEN 0 AND 5), credential TEXT NOT NULL,
      specialty TEXT NOT NULL, skills_json TEXT NOT NULL CHECK(json_valid(skills_json) AND json_type(skills_json) = 'array'),
      phone TEXT, verification_status TEXT NOT NULL DEFAULT 'demo' CHECK(verification_status IN ('demo','community_verified','institution_verified')),
      source_url TEXT, checked_at TEXT, active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)), updated_at TEXT NOT NULL
    );
    CREATE TABLE guide_destinations (
      guide_id TEXT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
      destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
      PRIMARY KEY(guide_id, destination_id)
    );
    CREATE TABLE prices (
      id TEXT PRIMARY KEY NOT NULL, destination_id TEXT REFERENCES destinations(id) ON DELETE RESTRICT,
      name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 150), category TEXT NOT NULL,
      amount_minor INTEGER NOT NULL CHECK(typeof(amount_minor) = 'integer' AND amount_minor >= 0),
      currency TEXT NOT NULL DEFAULT 'NIO' CHECK(currency = 'NIO'),
      verification_status TEXT NOT NULL DEFAULT 'demo' CHECK(verification_status IN ('demo','community_verified','institution_verified')),
      valid_until TEXT, source_url TEXT, checked_at TEXT, updated_at TEXT NOT NULL
    );
    CREATE TABLE destination_locations (
      destination_id TEXT PRIMARY KEY REFERENCES destinations(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'demo' CHECK(status IN ('demo','pending','verified')),
      source_url TEXT, checked_at TEXT, notes TEXT NOT NULL DEFAULT '',
      entrance_latitude REAL CHECK(entrance_latitude BETWEEN -90 AND 90),
      entrance_longitude REAL CHECK(entrance_longitude BETWEEN -180 AND 180),
      CHECK((entrance_latitude IS NULL) = (entrance_longitude IS NULL)),
      CHECK(status != 'verified' OR (source_url IS NOT NULL AND checked_at IS NOT NULL))
    );
    CREATE TABLE destination_visits (
      id TEXT PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
      destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
      visited_at TEXT NOT NULL, UNIQUE(profile_id, destination_id)
    );
    ALTER TABLE sos_events ADD COLUMN canceled_at TEXT;
    ALTER TABLE sos_events ADD COLUMN cancellation_reason TEXT;
    ALTER TABLE sos_events ADD COLUMN location_timestamp TEXT;
    ALTER TABLE sync_queue ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts >= 0);
    ALTER TABLE sync_queue ADD COLUMN last_error TEXT;
    ALTER TABLE sync_queue ADD COLUMN next_attempt_at TEXT;
    CREATE INDEX budgets_owner_idx ON budgets(owner_id);
    CREATE INDEX budget_items_active_idx ON budget_items(budget_id, deleted_at, created_at);
    CREATE UNIQUE INDEX budget_items_plan_idx ON budget_items(plan_id) WHERE plan_id IS NOT NULL;
    CREATE INDEX community_posts_destination_idx ON community_posts(destination_id, created_at DESC);
    CREATE INDEX community_posts_author_idx ON community_posts(author_profile_id, created_at DESC);
    CREATE INDEX community_comments_post_idx ON community_comments(post_id, created_at);
    CREATE INDEX prices_destination_idx ON prices(destination_id, verification_status);
    CREATE INDEX sos_created_idx ON sos_events(mode, status, created_at DESC);
    CREATE INDEX sync_queue_pending_idx ON sync_queue(synced_at, id);
  `);
  await db.runAsync('INSERT INTO app_meta(key, value) VALUES (?, ?)', 'active_profile_id', profile.id);
  await db.runAsync('INSERT INTO budgets(id, owner_id, name, created_at) VALUES (?, ?, ?, ?)', 'default-budget', profile.id, 'Mi presupuesto', now);
  const items = await db.getAllAsync<{ id: string; amount: number; created_at: string }>('SELECT id, amount, created_at FROM budget_items');
  for (const item of items) {
    await db.runAsync('UPDATE budget_items SET amount_minor = ?, budget_id = ?, updated_at = ? WHERE id = ?', moneyMinor(item.amount), 'default-budget', item.created_at, item.id);
  }
  const posts = await db.getAllAsync<{ id: string; comments_json: string; created_at: string }>('SELECT id, comments_json, created_at FROM community_posts');
  for (const post of posts) {
    for (const comment of parseArray<CommunityComment>(post.comments_json, `comentarios de ${post.id}`, isComment)) {
      await db.runAsync('INSERT INTO community_comments(post_id, id, author, body, created_at) VALUES (?, ?, ?, ?, ?)', post.id, comment.id, comment.author, comment.text, post.created_at);
    }
  }
  for (const key of ['offline_mode', 'reduced_data']) await db.runAsync('INSERT INTO app_settings VALUES (?, 0, ?)', key, now);
  await db.execAsync("INSERT INTO destination_locations(destination_id, notes) SELECT id, 'Coordenadas de ejemplo; validar acceso en campo.' FROM destinations;");
  // Retain example names/skills, but never make calls to fictional phone numbers.
  for (const guide of guides) {
    await db.runAsync('INSERT INTO guides(id, name, base, rating, credential, specialty, skills_json, phone, verification_status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)', guide.id, guide.name, guide.base, guide.rating, 'Credencial de ejemplo · no validada', guide.specialty, JSON.stringify(guide.skills), 'demo', now);
  }
  for (const [guideId, destinationId] of [['edgar-guide', 'tisey'], ['cesar-guide', 'estanzuela'], ['kassandra-guide', 'garnacha']]) {
    if (await db.getFirstAsync('SELECT id FROM destinations WHERE id = ?', destinationId)) await db.runAsync('INSERT INTO guide_destinations VALUES (?, ?)', guideId, destinationId);
  }
  const destinations: Record<string, string> = { 'entry-estanzuela': 'estanzuela', 'guide-tisey': 'tisey', 'lunch-garnacha': 'garnacha' };
  for (const price of verifiedPrices) {
    const destinationId = destinations[price.id];
    const exists = destinationId && await db.getFirstAsync('SELECT id FROM destinations WHERE id = ?', destinationId);
    await db.runAsync('INSERT INTO prices(id, destination_id, name, category, amount_minor, updated_at) VALUES (?, ?, ?, ?, ?, ?)', price.id, exists ? destinationId : null, price.name, price.category, moneyMinor(price.amount), now);
  }
  // Additive triggers protect future writes without destructively rebuilding legacy tables.
  for (const event of ['INSERT', 'UPDATE']) {
    const name = event.toLowerCase();
    await db.execAsync(`
      CREATE TRIGGER budget_items_validate_${name} BEFORE ${event} ON budget_items BEGIN
        SELECT CASE WHEN NEW.budget_id IS NULL OR length(trim(NEW.name)) NOT BETWEEN 1 AND 200
          OR NEW.category NOT IN ('Transporte','Hospedaje','Alimentación','Guía','Entrada','Otro')
          OR abs(NEW.amount * 100 - NEW.amount_minor) > 0.00001
          THEN RAISE(ABORT, 'Invalid budget item') END;
      END;
      CREATE TRIGGER posts_validate_${name} BEFORE ${event} ON community_posts BEGIN
        SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM destinations WHERE id = NEW.destination_id)
          OR length(trim(NEW.body)) NOT BETWEEN 1 AND 1500 OR NEW.likes < 0 OR NEW.liked NOT IN (0,1)
          THEN RAISE(ABORT, 'Invalid community post') END;
      END;
      CREATE TRIGGER destinations_validate_${name} BEFORE ${event} ON destinations BEGIN
        SELECT CASE WHEN NEW.latitude NOT BETWEEN -90 AND 90 OR NEW.longitude NOT BETWEEN -180 AND 180
          OR NEW.distance_km < 0 OR NEW.duration_minutes < 0 OR NEW.entrance_fee_cordobas < 0
          OR NEW.capacity_daily <= 0 OR NEW.sustainability_score NOT BETWEEN 0 AND 100
          OR NEW.community_contribution_pct NOT BETWEEN 0 AND 100
          OR NEW.difficulty NOT IN ('Fácil','Medio','Avanzado')
          OR NEW.verification_status NOT IN ('demo','community_verified','institution_verified')
          OR NOT json_valid(NEW.local_rules_json) OR json_type(NEW.local_rules_json) != 'array'
          OR NOT json_valid(NEW.waste_guidance_json) OR json_type(NEW.waste_guidance_json) != 'array'
          OR NOT json_valid(NEW.community_benefits_json) OR json_type(NEW.community_benefits_json) != 'array'
          OR NOT json_valid(NEW.route_coordinates_json) OR json_type(NEW.route_coordinates_json) != 'array'
          THEN RAISE(ABORT, 'Invalid destination') END;
      END;
    `);
  }
  await db.execAsync(`
    CREATE TRIGGER sos_demo_insert BEFORE INSERT ON sos_events BEGIN
      SELECT CASE WHEN NEW.mode != 'demo' OR NEW.status != 'simulated'
        OR NEW.latitude NOT BETWEEN -90 AND 90 OR NEW.longitude NOT BETWEEN -180 AND 180
        OR NEW.accuracy < 0 THEN RAISE(ABORT, 'Only valid demo SOS is allowed locally') END;
    END;
    CREATE TRIGGER sos_demo_update BEFORE UPDATE ON sos_events BEGIN
      SELECT CASE WHEN NEW.mode != OLD.mode OR NEW.latitude != OLD.latitude OR NEW.longitude != OLD.longitude
        OR NEW.mode != 'demo' OR NEW.status != 'canceled' OR OLD.status != 'simulated'
        OR NEW.canceled_at IS NULL OR length(trim(COALESCE(NEW.cancellation_reason,''))) NOT BETWEEN 3 AND 500
        THEN RAISE(ABORT, 'Invalid SOS cancellation') END;
    END;
    CREATE TRIGGER destination_restrict_delete BEFORE DELETE ON destinations BEGIN
      SELECT CASE WHEN EXISTS(SELECT 1 FROM community_posts WHERE destination_id = OLD.id)
        THEN RAISE(ABORT, 'Destination has community posts') END;
    END;
  `);
}
