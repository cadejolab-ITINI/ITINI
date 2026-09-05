import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { newId } from './ids';
import { transaction } from './transactions';
import { textValue } from './validation';
import type { Profile } from '@/types/domain';

export const avatarOptions = ['🥾', '⛰️', '🌿', '🧭', '🌊', '🌲'] as const;

export type RegisterInput = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  avatar: string;
};

const normalizeUsername = (value: string) => value.trim().replace(/^@+/, '').toLowerCase();

function validateUsername(value: string) {
  const username = normalizeUsername(value);
  if (!/^[a-z0-9_\.]{3,30}$/.test(username)) throw new Error('El usuario debe tener 3–30 caracteres: letras, números, punto o guion bajo.');
  return username;
}

async function hashPassword(password: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

export async function registerLocalAccount(db: SQLiteDatabase, input: RegisterInput): Promise<Profile> {
  const firstName = textValue(input.firstName, 'Nombre', 50);
  const lastName = textValue(input.lastName, 'Apellido', 70);
  if (input.password.length < 8 || input.password.length > 128) throw new Error('La contraseña debe tener entre 8 y 128 caracteres.');
  if (!avatarOptions.includes(input.avatar as (typeof avatarOptions)[number])) throw new Error('Elegí un avatar válido.');
  const username = validateUsername(input.username);
  const profileId = newId();
  const accountId = newId();
  const salt = newId();
  const passwordHash = await hashPassword(input.password, salt);
  const now = new Date().toISOString();
  const profile: Profile = {
    id: profileId,
    name: `${firstName} ${lastName}`,
    username: `@${username}`,
    avatar: input.avatar,
    bio: 'Explorador ITINI de Nicaragua.',
    homeRegion: 'Estelí, Nicaragua',
  };

  await transaction(db, async () => {
    const exists = await db.getFirstAsync<{ id: string }>('SELECT id FROM accounts WHERE username = ? COLLATE NOCASE', username);
    if (exists) throw new Error('Ese usuario ya existe. Probá con otro.');
    await db.runAsync(
      'INSERT INTO profiles(id, name, username, avatar, bio, home_region, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      profile.id, profile.name, profile.username, profile.avatar, profile.bio, profile.homeRegion, now,
    );
    await db.runAsync(
      'INSERT INTO accounts(id, profile_id, username, salt, password_hash, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      accountId, profile.id, username, salt, passwordHash, now, now,
    );
    await db.runAsync('UPDATE app_meta SET value = ? WHERE key = \'active_profile_id\'', profile.id);
    await db.runAsync('INSERT INTO budgets(id, owner_id, name, created_at) VALUES (?, ?, ?, ?)', `budget-${profile.id}`, profile.id, 'Mi presupuesto', now);
  });
  return profile;
}

export async function loginLocalAccount(db: SQLiteDatabase, usernameInput: string, password: string): Promise<Profile> {
  const username = validateUsername(usernameInput);
  const account = await db.getFirstAsync<{ id: string; profile_id: string; salt: string; password_hash: string }>('SELECT id, profile_id, salt, password_hash FROM accounts WHERE username = ? COLLATE NOCASE', username);
  if (!account) throw new Error('No encontramos esa cuenta. Revisá el usuario o registrate.');
  const candidate = await hashPassword(password, account.salt);
  if (candidate !== account.password_hash) throw new Error('La contraseña no coincide.');
  const now = new Date().toISOString();
  await transaction(db, async () => {
    await db.runAsync('UPDATE accounts SET last_login_at = ? WHERE id = ?', now, account.id);
    await db.runAsync('UPDATE app_meta SET value = ? WHERE key = \'active_profile_id\'', account.profile_id);
  });
  const profile = await db.getFirstAsync<{ id: string; name: string; username: string; avatar: string; bio: string; home_region: string }>('SELECT * FROM profiles WHERE id = ?', account.profile_id);
  if (!profile) throw new Error('La cuenta no tiene un perfil válido.');
  return { id: profile.id, name: profile.name, username: profile.username, avatar: profile.avatar, bio: profile.bio, homeRegion: profile.home_region };
}
