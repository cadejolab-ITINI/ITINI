import type { SQLiteDatabase } from 'expo-sqlite';

/** Cuenta local. Nunca se guarda la contraseña en texto plano. */
export async function migrateV4(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE CHECK(length(trim(username)) BETWEEN 3 AND 30),
      salt TEXT NOT NULL CHECK(length(salt) >= 16),
      password_hash TEXT NOT NULL CHECK(length(password_hash) = 64),
      created_at TEXT NOT NULL,
      last_login_at TEXT
    );
    CREATE UNIQUE INDEX IF NOT EXISTS accounts_username_idx ON accounts(username COLLATE NOCASE);
  `);
}
