import data from "@/data.json";
import type {
  Element,
  ElementFilter,
  GuessMode,
  OrderMode,
} from "@/types/game";

export function formatTime(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${m}:${String(s).padStart(2, "00")}.${String(cs).padStart(2, "00")}`;
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

export function buildPool(
  filter: ElementFilter,
  orderMode: OrderMode,
  guessMode: GuessMode,
): Element[] {
  let pool: Element[] =
    filter === "all"
      ? [...data.elements]
      : data.elements.filter(e => e.category === filter);

  if (orderMode === "atomicNumber") {
    pool = pool.slice().sort((a, b) => a.atomicNumber - b.atomicNumber);
  } else if (orderMode === "alphabetical") {
    const key: "symbol" | "name" = guessMode === "symbol" ? "symbol" : "name";
    pool = pool.slice().sort((a, b) => a[key].localeCompare(b[key]));
  }
  // random: unsorted — pickRandom handles selection
  return pool;
}
