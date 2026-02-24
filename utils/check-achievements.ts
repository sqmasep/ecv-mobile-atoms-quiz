import type {
  AchievementId,
  AchievementStore,
  GameResult,
} from "@/types/achievement";
import { ELEMENT_CATEGORIES } from "@/types/game";

/**
 * Pure function — given a completed game result and the current persistent
 * store, returns the achievement IDs newly earned this game plus an updated
 * store snapshot (does NOT write to storage itself).
 */
export function checkNewAchievements(
  result: GameResult,
  store: AchievementStore,
): { newIds: AchievementId[]; updatedStore: AchievementStore } {
  const alreadyUnlocked = new Set(store.unlockedIds);
  const earned = new Set<AchievementId>();

  const nonSkipped = result.reactions.filter(r => !r.skipped);
  // A "perfect" game = all elements answered (score === poolSize → skipCount === 0)
  const perfectGame = result.score === result.poolSize;

  // ── Per-reaction checks ────────────────────────────────────────────────────

  // Reflex: any answer under 700 ms
  if (nonSkipped.some(r => r.ms < 700)) earned.add("reflex");

  // Deep Focus: any answer under 300 ms
  if (nonSkipped.some(r => r.ms < 300)) earned.add("deep_focus");

  // On Fire: 3 consecutive non-skipped answers each under 500 ms
  let streak = 0;
  for (const r of result.reactions) {
    if (!r.skipped && r.ms < 500) {
      streak++;
      if (streak >= 3) {
        earned.add("on_fire");
        break;
      }
    } else {
      streak = 0;
    }
  }

  // ── Per-game checks ────────────────────────────────────────────────────────

  if (result.errorCount === 0) earned.add("scholar");
  if (perfectGame) earned.add("perfect");
  if (perfectGame && result.errorCount === 0) earned.add("flawless");
  if (perfectGame && result.elapsed < 60_000) earned.add("blitz");
  if (result.poolSize === 118) earned.add("completionist");
  if (result.poolSize === 118 && perfectGame && result.elapsed < 180_000)
    earned.add("speed_run");

  if (result.elementFilter === "noble gas" && perfectGame)
    earned.add("noble_blood");
  if (result.guessMode === "symbol" && perfectGame) earned.add("symbol_master");
  if (result.guessMode === "atomicNumber" && perfectGame)
    earned.add("number_cruncher");
  if (result.orderMode === "alphabetical" && perfectGame)
    earned.add("alphabetist");

  // ── Cross-session checks ───────────────────────────────────────────────────

  const updatedStore: AchievementStore = {
    unlockedIds: [...store.unlockedIds],
    completedCategories: [...store.completedCategories],
    completedGuessModes: [...store.completedGuessModes],
  };

  if (perfectGame) {
    // Polyglot: perfect score in all 3 guess modes
    const newModes = new Set([...store.completedGuessModes, result.guessMode]);
    updatedStore.completedGuessModes = [...newModes];
    if (newModes.size >= 3) earned.add("polyglot");

    // Category Collector: perfect score in every category
    if (result.elementFilter !== "all") {
      const newCats = new Set([
        ...store.completedCategories,
        result.elementFilter,
      ]);
      updatedStore.completedCategories = [...newCats];
      if (newCats.size >= ELEMENT_CATEGORIES.length)
        earned.add("category_collector");
    }
  }

  // Only keep achievements that weren't already unlocked
  const newIds = [...earned].filter(id => !alreadyUnlocked.has(id));
  updatedStore.unlockedIds = [...new Set([...store.unlockedIds, ...newIds])];

  return { newIds, updatedStore };
}
