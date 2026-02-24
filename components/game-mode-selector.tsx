import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { GuessMode } from "@/types/game";

const MODES: { value: GuessMode; label: string; sub: string }[] = [
  { value: "name", label: "Name", sub: "Hydrogen" },
  { value: "symbol", label: "Symbol", sub: "H" },
  { value: "atomicNumber", label: "Number", sub: "1" },
];

export function GameModeSelector({
  value,
  onChange,
}: {
  value: GuessMode;
  onChange: (mode: GuessMode) => void;
}) {
  return (
    <View style={styles.row}>
      {MODES.map(m => (
        <TouchableOpacity
          key={m.value}
          style={[styles.btn, value === m.value && styles.btnActive]}
          onPress={() => onChange(m.value)}
        >
          <Text style={[styles.label, value === m.value && styles.labelActive]}>
            {m.label}
          </Text>
          <Text style={[styles.sub, value === m.value && styles.subActive]}>
            {m.sub}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 8,
  },
  btn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
    backgroundColor: "#18181b", // zinc-900
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  btnActive: {
    borderColor: "#e4e4e7", // zinc-200
    backgroundColor: "#27272a", // zinc-800
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3f3f46", // zinc-700
  },
  labelActive: {
    color: "#f4f4f5", // zinc-100
  },
  sub: {
    fontSize: 18,
    fontWeight: "700",
    color: "#27272a", // zinc-800
  },
  subActive: {
    color: "#71717a", // zinc-500
  },
});
