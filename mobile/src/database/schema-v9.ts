import type { SQLiteDatabase } from 'expo-sqlite';

// Repara instalaciones donde la tabla de precios quedó creada, pero sin el catálogo demo.
const prices = [
  { id: 'entry-estanzuela', destinationId: 'estanzuela', name: 'Entrada Cascada La Estanzuela', category: 'Entrada', amount: 50 },
  { id: 'guide-tisey', destinationId: 'tisey', name: 'Guía Comunitario Tisey (por grupo)', category: 'Guía', amount: 350 },
  { id: 'lunch-garnacha', destinationId: 'garnacha', name: 'Almuerzo Campestre La Garnacha', category: 'Alimentación', amount: 180 },
  { id: 'transport-miraflor', destinationId: null, name: 'Traslado Colectivo Miraflor', category: 'Transporte', amount: 60 },
] as const;

export async function migrateV9(db: SQLiteDatabase) {
  const now = new Date().toISOString();
  for (const price of prices) {
    const destination = price.destinationId ? await db.getFirstAsync<{ id: string }>('SELECT id FROM destinations WHERE id = ?', price.destinationId) : null;
    await db.runAsync(
      `INSERT OR IGNORE INTO prices
       (id, destination_id, name, category, amount_minor, currency, verification_status, updated_at)
       VALUES (?, ?, ?, ?, ?, 'NIO', 'demo', ?)`,
      price.id,
      destination?.id ?? null,
      price.name,
      price.category,
      Math.round(price.amount * 100),
      now,
    );
  }
}
