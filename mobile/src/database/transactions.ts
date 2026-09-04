import type { SQLiteDatabase } from 'expo-sqlite';

// Expo's web transaction API is not exclusive. All repository writes share this
// queue so unrelated async actions cannot accidentally join another transaction.
const queues = new WeakMap<SQLiteDatabase, Promise<unknown>>();
export function serializeDatabase<T>(db: SQLiteDatabase, task: () => Promise<T>): Promise<T> {
  const next = (queues.get(db) ?? Promise.resolve()).catch(() => undefined).then(task);
  queues.set(db, next.catch(() => undefined));
  return next;
}

export function transaction<T>(db: SQLiteDatabase, task: () => Promise<T>): Promise<T> {
  return serializeDatabase(db, async () => {
    let result!: T;
    await db.withTransactionAsync(async () => { result = await task(); });
    return result;
  });
}
