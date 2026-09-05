import type { Destination, UserLocation } from '@/types/domain';
import type { RoadRoute } from '@/services/map-routing';

export type EsteliMapProps = {
  destinations: Destination[];
  selected: Destination | null;
  userLocation: UserLocation | null;
  route: RoadRoute | null;
  offline: boolean;
  theme?: 'light' | 'dark';
  recenterToken: number;
  onDestinationPress: (destination: Destination) => void;
  onMapPress: () => void;
};
