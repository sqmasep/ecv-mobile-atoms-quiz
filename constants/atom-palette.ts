/** Background color for the atom card, keyed by element category. */
export const CATEGORY_COLORS: Record<string, string> = {
  actinide: "#16093a", // very dark violet
  "alkali metal": "#3b0a0a", // very dark red
  "alkaline earth metal": "#341a04", // very dark amber
  lanthanide: "#0d0b2e", // very dark indigo
  metalloid: "#071e1c", // very dark teal
  "noble gas": "#071e2b", // very dark cyan
  "post-transition metal": "#0b1828", // very dark navy
  "reactive nonmetal": "#072214", // very dark green
  "transition metal": "#0d1318", // very dark steel
};

/** Thresholds (ms) → text color for reaction-time display, fastest first. */
const REACTION_THRESHOLDS: { ms: number; color: string }[] = [
  { ms: 700, color: "#E879F9" }, // < 0.7 s  — fuchsia  (legendary)
  { ms: 1000, color: "#A855F7" }, // < 1.0 s  — purple   (excellent)
  { ms: 1500, color: "#EAB308" }, // < 1.5 s  — gold     (great)
  { ms: 2500, color: "#4ADE80" }, // < 2.5 s  — green    (good)
  { ms: 4000, color: "#60A5FA" }, // < 4.0 s  — blue     (ok)
  { ms: 5000, color: "#FB923C" }, // < 5.0 s  — orange   (slow)
];

const REACTION_COLOR_DEFAULT = "#52525b"; // zinc-600 — very slow / skipped

export function reactionColor(ms: number): string {
  for (const { ms: threshold, color } of REACTION_THRESHOLDS) {
    if (ms < threshold) return color;
  }
  return REACTION_COLOR_DEFAULT;
}
