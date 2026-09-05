import type { SQLiteDatabase } from 'expo-sqlite';

export async function migrateV12(db: SQLiteDatabase) {
  await db.execAsync(`
    ALTER TABLE trip_plans ADD COLUMN status TEXT NOT NULL DEFAULT 'saved' CHECK(status IN ('saved','in_progress','completed'));
    ALTER TABLE trip_plans ADD COLUMN transport_mode TEXT NOT NULL DEFAULT 'Bus';
    ALTER TABLE trip_plans ADD COLUMN transport_minor INTEGER NOT NULL DEFAULT 0 CHECK(transport_minor >= 0);
    ALTER TABLE trip_plans ADD COLUMN food_minor INTEGER NOT NULL DEFAULT 0 CHECK(food_minor >= 0);
    ALTER TABLE trip_plans ADD COLUMN guide_minor INTEGER NOT NULL DEFAULT 0 CHECK(guide_minor >= 0);
    CREATE INDEX IF NOT EXISTS trip_plans_status_idx ON trip_plans(status, created_at DESC);
  `);
}
