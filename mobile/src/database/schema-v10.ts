import type { SQLiteDatabase } from 'expo-sqlite';

import { busSchedules, busTerminals } from '@/data/bus-schedules';

export async function migrateV10(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS bus_terminals (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT UNIQUE NOT NULL,
      direction TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      source_url TEXT NOT NULL,
      checked_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bus_schedules (
      id TEXT PRIMARY KEY NOT NULL,
      terminal_id TEXT NOT NULL REFERENCES bus_terminals(id) ON DELETE CASCADE,
      destination TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      days TEXT NOT NULL,
      service_type TEXT NOT NULL,
      fare_cordobas REAL,
      duration_minutes INTEGER,
      notes TEXT NOT NULL DEFAULT '',
      source_url TEXT NOT NULL,
      checked_at TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'reference' CHECK (verification_status IN ('reference', 'verified'))
    );
    CREATE INDEX IF NOT EXISTS idx_bus_schedules_terminal_time ON bus_schedules(terminal_id, departure_time);
  `);

  for (const terminal of busTerminals) {
    await db.runAsync(
      `INSERT OR IGNORE INTO bus_terminals (id, name, direction, address, phone, source_url, checked_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      terminal.id, terminal.name, terminal.direction, terminal.address, terminal.phone, terminal.sourceUrl, terminal.checkedAt,
    );
  }
  for (const schedule of busSchedules) {
    await db.runAsync(
      `INSERT OR IGNORE INTO bus_schedules (id, terminal_id, destination, departure_time, days, service_type, fare_cordobas, duration_minutes, notes, source_url, checked_at, verification_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      schedule.id, schedule.terminalId, schedule.destination, schedule.departureTime, schedule.days, schedule.serviceType,
      schedule.fareCordobas, schedule.durationMinutes, schedule.notes, schedule.sourceUrl, schedule.checkedAt, schedule.verificationStatus,
    );
  }
}
