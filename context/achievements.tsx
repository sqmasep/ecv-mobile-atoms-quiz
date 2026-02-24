import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  AchievementId,
  AchievementStore,
  GameResult,
} from "@/types/achievement";
import { checkNewAchievements } from "@/utils/check-achievements";

const STORAGE_KEY = "atoms_achievement_store_v1";

const DEFAULT_STORE: AchievementStore = {
  unlockedIds: [],
  completedCategories: [],
  completedGuessModes: [],
};

type AchievementsContextValue = {
  /** IDs of all-time unlocked achievements. */
  unlocked: Set<AchievementId>;
  /** IDs unlocked in the most recent completed game (cleared when leaving finished screen). */
  newlyUnlocked: AchievementId[];
  clearNewlyUnlocked: () => void;
  /** Check a completed game; returns the IDs newly earned this game. */
  checkGame: (result: GameResult) => AchievementId[];
};

const AchievementsContext = createContext<AchievementsContextValue>({
  unlocked: new Set(),
  newlyUnlocked: [],
  clearNewlyUnlocked: () => {},
  checkGame: () => [],
});

export function AchievementsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store, setStore] = useState<AchievementStore>(DEFAULT_STORE);
  // Keep a ref so checkGame always reads the latest store without being
  // recreated on every store change.
  const storeRef = useRef<AchievementStore>(DEFAULT_STORE);
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementId[]>([]);

  // Load persisted data once on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!raw) return;
      try {
        const parsed: AchievementStore = JSON.parse(raw);
        storeRef.current = parsed;
        setStore(parsed);
      } catch {}
    });
  }, []);

  const checkGame = useCallback((result: GameResult): AchievementId[] => {
    const { newIds, updatedStore } = checkNewAchievements(
      result,
      storeRef.current,
    );
    if (newIds.length > 0) {
      storeRef.current = updatedStore;
      setStore(updatedStore);
      setNewlyUnlocked(newIds);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStore));
    }
    return newIds;
  }, []); // stable — reads via ref, writes via setters

  const clearNewlyUnlocked = useCallback(() => setNewlyUnlocked([]), []);

  return (
    <AchievementsContext.Provider
      value={{
        unlocked: new Set(store.unlockedIds),
        newlyUnlocked,
        clearNewlyUnlocked,
        checkGame,
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  return useContext(AchievementsContext);
}
