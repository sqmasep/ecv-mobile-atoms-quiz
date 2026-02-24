import data from "@/data.json";

export type Element = (typeof data.elements)[number];
export type GameState = "idle" | "playing" | "finished";
export type GuessMode = "name" | "symbol" | "atomicNumber";
export type ReactionEntry = {
  atomicNumber: number;
  ms: number;
  skipped: boolean;
};
