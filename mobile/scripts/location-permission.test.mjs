import test from 'node:test';
import assert from 'node:assert/strict';
import { needsLocationSettings } from '../src/services/location-permission.ts';

test('web: una denegación necesita ajustes aunque Expo permita reintentar', () => {
  assert.equal(needsLocationSettings({ status: 'denied', canAskAgain: true }, 'web'), true);
});
test('Android/iOS: denegación permanente dirige a los ajustes', () => {
  for (const platform of ['android', 'ios']) {
    assert.equal(needsLocationSettings({ status: 'denied', canAskAgain: false }, platform), true);
    assert.equal(needsLocationSettings({ status: 'denied', canAskAgain: true }, platform), false);
  }
});
test('permiso inicial o concedido no se presenta como bloqueado', () => {
  for (const platform of ['web', 'android', 'ios']) {
    for (const status of ['granted', 'undetermined']) {
      assert.equal(needsLocationSettings({ status, canAskAgain: true }, platform), false);
    }
  }
});
