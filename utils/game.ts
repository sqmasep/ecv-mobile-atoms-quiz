import type { Element, GuessMode } from "@/types/game";

export function formatTime(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${m}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

export function pickRandom<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getCorrectAnswer(
  element: Element,
  guessMode: GuessMode,
): string {
  if (guessMode === "name") return element.name.toLowerCase();
  if (guessMode === "symbol") return element.symbol.toLowerCase();
  return String(element.atomicNumber);
}
