import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as repository from '@/database/repositories';
import * as catalog from '@/database/catalog';
import { newId } from '@/database/ids';
import { serializeDatabase } from '@/database/transactions';
import type { BudgetCategory, BudgetItem, BusSchedule, BusTerminal, CommunityPost, Destination, Profile, TripPlan } from '@/types/domain';

type Snapshot = {
  destinations: Destination[]; budgetItems: BudgetItem[]; profile: Profile | null; communityPosts: CommunityPost[];
  guides: catalog.Guide[]; prices: catalog.CatalogPrice[]; settings: catalog.Settings; stats: catalog.ProfileStats;
  busTerminals: BusTerminal[]; busSchedules: BusSchedule[];
  tripPlans: TripPlan[];
};
type AppDataContextValue = Snapshot & {
  loading: boolean; error: string | null; refresh: () => Promise<void>;
  addBudgetItem: (name: string, amount: number, category: BudgetCategory) => Promise<boolean>;
  removeBudgetItem: (id: string) => Promise<boolean>;
  updateProfile: (profile: Profile) => Promise<boolean>;
  addCommunityPost: (post: CommunityPost) => Promise<boolean>;
  toggleCommunityLike: (id: string) => Promise<boolean>;
  addCommunityComment: (id: string, author: string, text: string) => Promise<boolean>;
  addTripPlan: (destinationId: string, people: number, extras: number, details?: { transportMode: TripPlan['transportMode']; transportAmount: number; foodAmount: number; guideAmount: number }) => Promise<boolean>;
  updateTripPlanStatus: (id: string, status: TripPlan['status']) => Promise<boolean>;
  updateLatestTripPlanStatus: (destinationId: string, status: TripPlan['status']) => Promise<boolean>;
  updateSetting: (key: keyof catalog.Settings, value: boolean) => Promise<boolean>;
};
const AppDataContext = createContext<AppDataContextValue | null>(null);
export function AppDataProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [data, setData] = useState<Snapshot>({ destinations: [], budgetItems: [], profile: null, communityPosts: [], guides: [], prices: [], settings: { offlineMode: false, reducedData: false }, stats: { visits: 0, reviews: 0 }, busTerminals: [], busSchedules: [], tripPlans: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => serializeDatabase(db, async () => {
    const [destinations, budgetItems, profile, communityPosts, guides, prices, settings, stats, busTerminals, busSchedules, tripPlans] = await Promise.all([
      repository.listDestinations(db), repository.listBudgetItems(db), repository.getProfile(db), repository.listCommunityPosts(db),
      catalog.listGuides(db), catalog.listPrices(db), catalog.getSettings(db), catalog.getProfileStats(db), catalog.listBusTerminals(db), catalog.listBusSchedules(db), repository.listTripPlans(db),
    ]);
    if (!profile) throw new Error('No se encontró el perfil local. No se borraron tus datos.');
    setData({ destinations, budgetItems, profile, communityPosts, guides, prices, settings, stats, busTerminals, busSchedules, tripPlans });
  }), [db]);
  const report = (cause: unknown) => setError(cause instanceof Error ? cause.message : 'No se pudieron guardar los datos. Intentá nuevamente.');
  const refresh = useCallback(async () => {
    try { await load(); setError(null); } catch (cause) { report(cause); } finally { setLoading(false); }
  }, [load]);
  useEffect(() => { void refresh(); }, [refresh]);
  // A successful write is never reported as failed if only refreshing the UI fails.
  const mutate = async (operation: () => Promise<unknown>): Promise<boolean> => {
    try { await operation(); } catch (cause) { report(cause); return false; }
    await refresh();
    return true;
  };
  const value: AppDataContextValue = {
    ...data, loading, error, refresh,
    addBudgetItem: (name, amount, category) => mutate(() => repository.insertBudgetItem(db, { id: newId(), name, amount, category, createdAt: new Date().toISOString() })),
    removeBudgetItem: id => mutate(() => repository.deleteBudgetItem(db, id)),
    updateProfile: profile => mutate(() => repository.saveProfile(db, profile)),
    addCommunityPost: post => mutate(() => repository.insertCommunityPost(db, { ...post, id: newId() })),
    toggleCommunityLike: id => mutate(() => repository.toggleCommunityPostLike(db, id)),
    addCommunityComment: (id, _author, text) => mutate(() => repository.insertCommunityComment(db, id, text)),
    addTripPlan: (id, people, extras, details) => mutate(() => repository.createTripPlan(db, id, people, extras, details)),
    updateTripPlanStatus: (id, status) => mutate(() => repository.updateTripPlanStatus(db, id, status)),
    updateLatestTripPlanStatus: (destinationId, status) => mutate(() => repository.updateLatestTripPlanStatus(db, destinationId, status)),
    updateSetting: (key, next) => mutate(() => catalog.saveSetting(db, key, next)),
  };
  return <AppDataContext.Provider value={value}>{children}{error && <View accessibilityRole="alert" style={{ position: 'absolute', bottom: 80, left: 12, right: 12, padding: 14, borderRadius: 12, backgroundColor: '#701C2A', zIndex: 999 }}><Text style={{ color: 'white' }}>{error}</Text><Pressable accessibilityRole="button" onPress={refresh} style={{ paddingVertical: 12 }}><Text style={{ color: 'white' }}>Reintentar lectura</Text></Pressable><Pressable accessibilityRole="button" onPress={() => setError(null)}><Text style={{ color: 'white' }}>Cerrar aviso</Text></Pressable></View>}</AppDataContext.Provider>;
}
export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData debe usarse dentro de AppDataProvider');
  return context;
}
