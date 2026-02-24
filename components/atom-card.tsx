import { StyleSheet, Text, View } from "react-native";

import { CATEGORY_COLORS } from "@/constants/atom-palette";
import type { Element, GuessMode } from "@/types/game";

export function AtomCard({
  element,
  guessMode,
}: {
  element: Element;
  guessMode: GuessMode;
}) {
  const bgColor = CATEGORY_COLORS[element.category] ?? "#18181b";
  const maskedSymbol = element.symbol.replace(/[a-zA-Z]/g, "*");
  const maskedNumber = String(element.atomicNumber).replace(/\d/g, "*");
  const maskedName = element.name.replace(/[a-zA-Z]/g, "*");

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <Text style={styles.atomNumber}>
        {guessMode === "atomicNumber" ? maskedNumber : element.atomicNumber}
      </Text>
      <Text
        style={[styles.symbol, guessMode === "symbol" && styles.fieldMasked]}
      >
        {guessMode === "symbol" ? maskedSymbol : element.symbol}
      </Text>
      <Text style={[styles.name, guessMode !== "name" && styles.nameVisible]}>
        {guessMode === "name" ? maskedName : element.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 190,
    height: 190,
    borderRadius: 18,
    backgroundColor: "#18181b", // zinc-900 fallback
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
    justifyContent: "center",
    alignItems: "center",
  },
  atomNumber: {
    position: "absolute",
    top: 13,
    left: 15,
    fontSize: 13,
    fontWeight: "500",
    color: "#52525b", // zinc-600
  },
  symbol: {
    fontSize: 76,
    fontWeight: "700",
    color: "#f4f4f5", // zinc-100
    letterSpacing: -2,
    lineHeight: 82,
  },
  fieldMasked: {
    color: "#3f3f46", // zinc-700
  },
  name: {
    position: "absolute",
    bottom: 14,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2.5,
    color: "#3f3f46", // zinc-700 — masked
  },
  nameVisible: {
    color: "#71717a", // zinc-500 — revealed
    letterSpacing: 1,
  },
});
