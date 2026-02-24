import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

import data from "@/data.json";
import type { ElementFilter } from "@/types/game";
import { ELEMENT_CATEGORIES } from "@/types/game";

const COUNTS: Record<string, number> = { all: data.elements.length };
data.elements.forEach(e => {
  COUNTS[e.category] = (COUNTS[e.category] ?? 0) + 1;
});

const LABELS: Record<string, string> = {
  all: "All",
  "alkali metal": "Alkali",
  "alkaline earth metal": "Alk. Earth",
  "transition metal": "Transition",
  "post-transition metal": "Post-trans.",
  metalloid: "Metalloid",
  "reactive nonmetal": "Nonmetal",
  "noble gas": "Noble Gas",
  lanthanide: "Lanthanide",
  actinide: "Actinide",
};

const FILTERS: ElementFilter[] = ["all", ...ELEMENT_CATEGORIES];

export function ElementFilterSelector({
  value,
  onChange,
}: {
  value: ElementFilter;
  onChange: (filter: ElementFilter) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {FILTERS.map(f => {
        const active = value === f;
        return (
          <TouchableOpacity
            key={f}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(f)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {LABELS[f] ?? f}
            </Text>
            <Text style={[styles.count, active && styles.countActive]}>
              {COUNTS[f] ?? 0}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
    backgroundColor: "#18181b", // zinc-900
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    gap: 2,
  },
  chipActive: {
    borderColor: "#e4e4e7", // zinc-200
    backgroundColor: "#27272a", // zinc-800
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3f3f46", // zinc-700
  },
  labelActive: {
    color: "#f4f4f5", // zinc-100
  },
  count: {
    fontSize: 11,
    fontWeight: "500",
    color: "#27272a", // zinc-800
  },
  countActive: {
    color: "#52525b", // zinc-600
  },
});
