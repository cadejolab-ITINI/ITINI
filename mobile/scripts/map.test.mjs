import test from 'node:test';
import assert from 'node:assert/strict';
import { distanceKm, normalizeSearch, fetchRoadRoute, validCoordinate } from '../src/services/map-routing.ts';

const origin = { latitude: 13.0919, longitude: -86.3538 };
const destination = { latitude: 13.0528, longitude: -86.3915 };
test('distancia geográfica: cero, simetría y distancia conocida', () => {
  assert.equal(distanceKm(origin, origin), 0);
  assert.ok(Math.abs(distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 }) - 111.195) < 0.01);
  assert.equal(distanceKm(origin, destination), distanceKm(destination, origin));
  assert.ok(Number.isFinite(distanceKm({ latitude: 90, longitude: 0 }, { latitude: -90, longitude: 180 })));
});
test('buscador ignora tildes, mayúsculas y espacios exteriores', () => {
  assert.equal(normalizeSearch('  FÁCIL Estelí  '), 'facil esteli');
});
test('rechaza coordenadas no válidas', () => {
  assert.equal(validCoordinate({ latitude: NaN, longitude: 0 }), false);
  assert.equal(validCoordinate({ latitude: 91, longitude: 0 }), false);
});
test('ruta usa origen y destino reales y convierte GeoJSON lon/lat', async (t) => {
  let requested;
  t.mock.method(globalThis, 'fetch', async (url) => {
    requested = url;
    return { ok: true, json: async () => ({ code: 'Ok', routes: [{ distance: 6500, duration: 900, geometry: { coordinates: [[-86.3538, 13.0919], [-86.3915, 13.0528]] } }] }) };
  });
  const route = await fetchRoadRoute(origin, destination, new AbortController().signal);
  assert.ok(requested.includes('-86.3538,13.0919;-86.3915,13.0528'));
  assert.deepEqual(route.coordinates, [origin, destination]);
  assert.deepEqual(route.origin, origin);
  assert.deepEqual(route.destination, destination);
  assert.equal(route.distanceMeters, 6500);
});
test('sin carretera: error explícito, nunca una línea inventada', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ code: 'NoRoute' }) }));
  await assert.rejects(fetchRoadRoute(origin, destination, new AbortController().signal), /No encontramos una ruta/);
});
test('errores HTTP y geometrías incompletas no se dibujan', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({ ok: false }));
  await assert.rejects(fetchRoadRoute(origin, destination, new AbortController().signal), /no está disponible/);
  fetchMock.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ code: 'Ok', routes: [{ distance: 2, duration: 1, geometry: { coordinates: [[-86, 13]] } }] }) }));
  await assert.rejects(fetchRoadRoute(origin, destination, new AbortController().signal), /incompleta/);
});
test('cancelación de solicitudes se propaga al proveedor', async (t) => {
  const controller = new AbortController();
  controller.abort();
  t.mock.method(globalThis, 'fetch', async (_, { signal }) => { signal.throwIfAborted(); });
  await assert.rejects(fetchRoadRoute(origin, destination, controller.signal), { name: 'AbortError' });
});
