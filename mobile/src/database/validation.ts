export function textValue(value: string, label: string, max: number, min = 1) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) {
    throw new Error(`${label}: usá entre ${min} y ${max} caracteres.`);
  }
  return value.trim();
}

export function moneyMinor(amount: number) {
  const cents = Math.round(amount * 100);
  if (!Number.isFinite(amount) || amount < 0 || amount > 100000000 || !Number.isSafeInteger(cents) || Math.abs(amount * 100 - cents) > 0.00001) {
    throw new Error('El monto debe ser positivo o cero y tener como máximo dos decimales.');
  }
  return cents;
}

export function parseArray<T>(raw: string, label: string, valid: (item: unknown) => boolean): T[] {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error(`Datos locales dañados: ${label}. No se borró información.`); }
  if (!Array.isArray(parsed) || !parsed.every(valid)) throw new Error(`Formato inválido: ${label}. No se borró información.`);
  return parsed as T[];
}

export const isText = (value: unknown) => typeof value === 'string';
export const isComment = (value: unknown) => !!value && typeof value === 'object' && 'id' in value && typeof value.id === 'string' && 'author' in value && typeof value.author === 'string' && 'text' in value && typeof value.text === 'string';
export const categories = ['Transporte', 'Hospedaje', 'Alimentación', 'Guía', 'Entrada', 'Otro'];
