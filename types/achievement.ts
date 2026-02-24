import type {
  ElementFilter,
  GuessMode,
  OrderMode,
  ReactionEntry,
} from "./game";

export type AchievementId =
  | "reflex"
  | "deep_focus"
  | "on_fire"
  | "scholar"
  | "perfect"
  | "flawless"
  | "blitz"
  | "completionist"
  | "speed_run"
  | "noble_blood"
  | "symbol_master"
  | "number_cruncher"
  | "alphabetist"
  | "polyglot"
  | "category_collector";

export type Achievement = {
  id: AchievementId;
  icon: string;
  name: string;
  description: string;
};

export type GameResult = {
  guessMode: GuessMode;
  elementFilter: ElementFilter;
  orderMode: OrderMode;
  poolSize: number;
  score: number;
  skipCount: number;
  errorCount: number;
  elapsed: number; // ms
  reactions: ReactionEntry[];
};

export type AchievementStore = {
  unlockedIds: AchievementId[];
  /** Categories completed with a perfect score (no skips). */
  completedCategories: string[];
  /** Guess modes completed with a perfect score (no skips). */
  completedGuessModes: string[];
};
