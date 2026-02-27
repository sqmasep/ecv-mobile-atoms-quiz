export type Element = {
  name: string;
  appearance?: string | null;
  atomic_mass?: number;
  atomicNumber: number; // mapped from API `number`
  boil?: number | null;
  category?: string | null;
  color?: string | null;
  density?: number | null;
  discovered_by?: string | null;
  melt?: number | null;
  molar_heat?: number | null;
  named_by?: string | null;
  period?: number;
  phase?: string | null;
  source?: string | null;
  spectral_img?: string | null;
  summary?: string | null;
  symbol: string;
  xpos?: number;
  ypos?: number;
  shells?: number[];
  electron_configuration?: string | null;
  electron_configuration_semantic?: string | null;
  electron_affinity?: number | null;
  electronegativity_pauling?: number | null;
  ionization_energies?: number[] | null;
};
export type GameState = "idle" | "playing" | "finished";
export type GuessMode = "name" | "symbol" | "atomicNumber";
export type ElementFilter = "all" | string; // one of the 9 category strings
export type OrderMode = "random" | "atomicNumber" | "alphabetical";
export type ReactionEntry = {
  atomicNumber: number;
  ms: number;
  skipped: boolean;
};

/** Ordered list of all element categories (mirrors data.json). */
export const ELEMENT_CATEGORIES = [
  "alkali metal",
  "alkaline earth metal",
  "transition metal",
  "post-transition metal",
  "metalloid",
  "reactive nonmetal",
  "noble gas",
  "lanthanide",
  "actinide",
] as const;

export type ElementCategory = (typeof ELEMENT_CATEGORIES)[number];
