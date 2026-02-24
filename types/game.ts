import data from "@/data.json";

export type Element = (typeof data.elements)[number];
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
