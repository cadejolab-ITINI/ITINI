import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import {
  deleteBudgetItem,
  insertCommunityPost,
  insertBudgetItem,
  listCommunityPosts,
  listBudgetItems,
  listDestinations,
  getProfile,
  saveProfile,
  saveCommunityPostState,
} from '@/database/repositories';
import type { BudgetCategory, BudgetItem, CommunityPost, Destination, Profile } from '@/types/domain';

type AppDataContextValue = {
  destinations: Destination[];
  budgetItems: BudgetItem[];
  profile: Profile | null;
  communityPosts: CommunityPost[];
  loading: boolean;
  refresh: () => Promise<void>;
  addBudgetItem: (name: string, amount: number, category: BudgetCategory) => Promise<void>;
  removeBudgetItem: (id: string) => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
  addCommunityPost: (post: CommunityPost) => Promise<void>;
  toggleCommunityLike: (id: string) => Promise<void>;
  addCommunityComment: (id: string, author: string, text: string) => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [nextDestinations, nextBudget, nextProfile, nextPosts] = await Promise.all([
      listDestinations(db),
      listBudgetItems(db),
      getProfile(db),
      listCommunityPosts(db),
    ]);
    setDestinations(nextDestinations);
    setBudgetItems(nextBudget);
    setProfile(nextProfile);
    setCommunityPosts(nextPosts);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    refresh().catch((error) => {
      console.error('No se pudo cargar la base local de ITINI', error);
      setLoading(false);
    });
  }, [refresh]);

  const addBudgetItem = useCallback(async (name: string, amount: number, category: BudgetCategory) => {
    const item: BudgetItem = {
      id: `budget-${Date.now()}`,
      name: name.trim(),
      amount,
      category,
      createdAt: new Date().toISOString(),
    };
    await insertBudgetItem(db, item);
    setBudgetItems((current) => [...current, item]);
  }, [db]);

  const removeBudgetItem = useCallback(async (id: string) => {
    await deleteBudgetItem(db, id);
    setBudgetItems((current) => current.filter((item) => item.id !== id));
  }, [db]);

  const updateProfile = useCallback(async (nextProfile: Profile) => {
    await saveProfile(db, nextProfile);
    setProfile(nextProfile);
  }, [db]);

  const addCommunityPost = useCallback(async (post: CommunityPost) => {
    await insertCommunityPost(db, post);
    setCommunityPosts((current) => [post, ...current]);
  }, [db]);

  const toggleCommunityLike = useCallback(async (id: string) => {
    const current = communityPosts.find((post) => post.id === id);
    if (!current) return;
    const next = { ...current, liked: !current.liked, likes: current.likes + (current.liked ? -1 : 1) };
    await saveCommunityPostState(db, next);
    setCommunityPosts((posts) => posts.map((post) => post.id === id ? next : post));
  }, [communityPosts, db]);

  const addCommunityComment = useCallback(async (id: string, author: string, text: string) => {
    const current = communityPosts.find((post) => post.id === id);
    if (!current || !text.trim()) return;
    const next = {
      ...current,
      comments: [...current.comments, { id: `comment-${Date.now()}`, author, text: text.trim() }],
    };
    await saveCommunityPostState(db, next);
    setCommunityPosts((posts) => posts.map((post) => post.id === id ? next : post));
  }, [communityPosts, db]);

  const value = useMemo<AppDataContextValue>(() => ({
    destinations,
    budgetItems,
    profile,
    communityPosts,
    loading,
    refresh,
    addBudgetItem,
    removeBudgetItem,
    updateProfile,
    addCommunityPost,
    toggleCommunityLike,
    addCommunityComment,
  }), [destinations, budgetItems, profile, communityPosts, loading, refresh, addBudgetItem, removeBudgetItem, updateProfile, addCommunityPost, toggleCommunityLike, addCommunityComment]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData debe usarse dentro de AppDataProvider');
  return context;
}
