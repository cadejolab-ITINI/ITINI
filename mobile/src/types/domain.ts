export type Difficulty = 'Fácil' | 'Medio' | 'Avanzado';
export type VerificationStatus = 'demo' | 'community_verified' | 'institution_verified';

export type Coordinate = { latitude: number; longitude: number };

export type Destination = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  durationMinutes: number;
  elevationGainM: number;
  difficulty: Difficulty;
  entranceFeeCordobas: number;
  capacityDaily: number;
  sustainabilityScore: number;
  communityContributionPct: number;
  impactSummary: string;
  localRules: string[];
  wasteGuidance: string[];
  communityBenefits: string[];
  routeCoordinates: Coordinate[];
  verificationStatus: VerificationStatus;
  updatedAt: string;
};

export type Profile = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  homeRegion: string;
};

export type BudgetCategory = 'Transporte' | 'Hospedaje' | 'Alimentación' | 'Guía' | 'Entrada' | 'Otro';

export type BudgetItem = {
  id: string;
  name: string;
  amount: number;
  category: BudgetCategory;
  createdAt: string;
};

export type UserLocation = Coordinate & { accuracy: number | null; timestamp: number };

export type SosEvent = {
  id: string;
  mode: 'demo' | 'institutional';
  status: 'simulated' | 'queued' | 'sent' | 'failed';
  latitude: number;
  longitude: number;
  accuracy: number | null;
  createdAt: string;
};

export type CommunityComment = {
  id: string;
  author: string;
  text: string;
};

export type CommunityPost = {
  id: string;
  author: string;
  role: string;
  avatar: string;
  destinationId: string;
  destinationName: string;
  rating: number;
  text: string;
  likes: number;
  liked: boolean;
  comments: CommunityComment[];
  photoUri: string | null;
  createdAt: string;
};
