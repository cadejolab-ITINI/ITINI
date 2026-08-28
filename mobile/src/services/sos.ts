import type { SQLiteDatabase } from 'expo-sqlite';

import { insertSosEvent } from '@/database/repositories';
import type { SosEvent, UserLocation } from '@/types/domain';

export interface SosGateway {
  readonly mode: SosEvent['mode'];
  trigger(location: UserLocation): Promise<SosEvent>;
}

export class DemoSosGateway implements SosGateway {
  readonly mode = 'demo' as const;

  constructor(private readonly db: SQLiteDatabase) {}

  async trigger(location: UserLocation) {
    const event: SosEvent = {
      id: `sos-demo-${Date.now()}`,
      mode: 'demo',
      status: 'simulated',
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      createdAt: new Date().toISOString(),
    };
    await insertSosEvent(this.db, event);
    return event;
  }
}

export class InstitutionalSosGateway implements SosGateway {
  readonly mode = 'institutional' as const;

  async trigger(): Promise<SosEvent> {
    throw new Error('La integración institucional está bloqueada hasta contar con convenios, API y protocolo auditado.');
  }
}
