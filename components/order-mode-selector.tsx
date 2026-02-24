import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { GuessMode, OrderMode } from "@/types/game";

type Option = { value: OrderMode; label: string };

const OPTIONS: Option[] = [
  { value: "random", label: "Random" },
  { value: "atomicNumber", label: "By number" },
  { value: "alphabetical", label: "A \u2192 Z" },
];

/** Returns true when the combo would produce trivially sequential answers. */
function isInvalid(order: OrderMode, guessMode: GuessMode): boolean {
  // Guessing the atomic number with elements sorted by atomic number means
  // the answers are always 1, 2, 3 … — no challenge.
  return order === "atomicNumber" && guessMode === "atomicNumber";
}

export function OrderModeSelector({
  value,
  guessMode,
  onChange,
}: {
  value: OrderMode;
  guessMode: GuessMode;
  onChange: (order: OrderMode) => void;
}) {
  return (
    <View style={styles.row}>
      {OPTIONS.map(o => {
        const active = value === o.value;
        const disabled = isInvalid(o.value, guessMode);
        return (
          <TouchableOpacity
            key={o.value}
            style={[
              styles.btn,
              active && styles.btnActive,
              disabled && styles.btnDisabled,
            ]}
            onPress={() => !disabled && onChange(o.value)}
            disabled={disabled}
          >
            <Text
              style={[
                styles.label,
                active && styles.labelActive,
                disabled && styles.labelDisabled,
              ]}
            >
              {o.label}
            </Text>
            {disabled && <Text style={styles.disabledHint}>trivial</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  btn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
    backgroundColor: "#18181b", // zinc-900
    paddingVertical: 12,
    alignItems: "center",
    gap: 2,
  },
  btnActive: {
    borderColor: "#e4e4e7", // zinc-200
    backgroundColor: "#27272a", // zinc-800
  },
  btnDisabled: {
    borderColor: "#1c1c1f",
    opacity: 0.35,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3f3f46", // zinc-700
  },
  labelActive: {
    color: "#f4f4f5", // zinc-100
  },
  labelDisabled: {
    color: "#3f3f46",
  },
  disabledHint: {
    fontSize: 9,
    color: "#3f3f46",
    fontStyle: "italic",
  },
});
