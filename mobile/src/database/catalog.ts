import type { SQLiteDatabase } from 'expo-sqlite';
import type { BudgetCategory, VerificationStatus } from '@/types/domain';
import { isText, parseArray } from './validation';
import { transaction } from './transactions';

export type Guide = { id: string; name: string; base: string; rating: number; credential: string; specialty: string; skills: string[]; phone: string | null; verificationStatus: VerificationStatus };
export type CatalogPrice = { id: string; name: string; amount: number; category: BudgetCategory; verificationStatus: VerificationStatus };
export type Settings = { offlineMode: boolean; reducedData: boolean; lightMode: boolean };
export type ProfileStats = { visits: number; reviews: number };

export async function listGuides(db: SQLiteDatabase): Promise<Guide[]> {
  const rows = await db.getAllAsync<Omit<Guide, 'skills' | 'verificationStatus'> & { skills_json: string; verification_status: VerificationStatus }>('SELECT * FROM guides WHERE active=1 ORDER BY name');
  return rows.map(row => ({ ...row, skills: parseArray<string>(row.skills_json, 'habilidades', isText), verificationStatus: row.verification_status }));
}
export async function listPrices(db: SQLiteDatabase): Promise<CatalogPrice[]> {
  const rows = await db.getAllAsync<{ id: string; name: string; amount_minor: number; category: BudgetCategory; verification_status: VerificationStatus }>("SELECT * FROM prices WHERE valid_until IS NULL OR julianday(valid_until) >= julianday('now') ORDER BY name");
  return rows.map(row => ({ id: row.id, name: row.name, amount: row.amount_minor / 100, category: row.category, verificationStatus: row.verification_status }));
}
const settingKeys = { offlineMode: 'offline_mode', reducedData: 'reduced_data', lightMode: 'light_mode' } as const;
export async function getSettings(db: SQLiteDatabase): Promise<Settings> {
  const rows = await db.getAllAsync<{ key: string; value: number }>('SELECT key,value FROM app_settings');
  return { offlineMode: rows.some(row => row.key === 'offline_mode' && row.value === 1), reducedData: rows.some(row => row.key === 'reduced_data' && row.value === 1), lightMode: rows.some(row => row.key === 'light_mode' && row.value === 1) };
}
export async function saveSetting(db: SQLiteDatabase, key: keyof Settings, value: boolean) {
  if (!(key in settingKeys) || typeof value !== 'boolean') throw new Error('Preferencia inválida.');
  return transaction(db, async () => {
    await db.runAsync('INSERT INTO app_settings(key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at', settingKeys[key], value ? 1 : 0, new Date().toISOString());
  });
}
export async function getProfileStats(db: SQLiteDatabase): Promise<ProfileStats> {
  const row = await db.getFirstAsync<ProfileStats>(`SELECT
    (SELECT count(*) FROM destination_visits WHERE profile_id=(SELECT value FROM app_meta WHERE key='active_profile_id')) AS visits,
    (SELECT count(*) FROM community_posts WHERE author_profile_id=(SELECT value FROM app_meta WHERE key='active_profile_id')) AS reviews`);
  return row ?? { visits: 0, reviews: 0 };
}
