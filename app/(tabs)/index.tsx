import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSettings } from "@/context/settings";
import data from "@/data.json";

type Element = (typeof data.elements)[number];
type GameState = "idle" | "playing" | "finished";

function pickRandom(pool: Element[]): Element {
  return pool[Math.floor(Math.random() * pool.length)];
}

function AtomCard({ element }: { element: Element }) {
  const masked = element.name.replace(/[a-zA-Z]/g, "*");
  return (
    <View style={styles.atomCard}>
      <Text style={styles.atomNumber}>{element.atomicNumber}</Text>
      <Text style={styles.atomSymbol}>{element.symbol}</Text>
      <Text style={styles.maskedName}>{masked}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { autoSend } = useSettings();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [remaining, setRemaining] = useState<Element[]>([]);
  const [current, setCurrent] = useState<Element | null>(null);
  const [score, setScore] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [input, setInput] = useState("");
  const inputRef = useRef<TextInput>(null);

  const advanceToNext = useCallback((pool: Element[]) => {
    if (pool.length === 0) {
      setGameState("finished");
      return;
    }
    const next = pickRandom(pool);
    setRemaining(pool.filter(e => e.atomicNumber !== next.atomicNumber));
    setCurrent(next);
    setInput("");
    inputRef.current?.focus();
  }, []);

  const startGame = useCallback(() => {
    const pool = [...data.elements];
    const first = pickRandom(pool);
    setRemaining(pool.filter(e => e.atomicNumber !== first.atomicNumber));
    setCurrent(first);
    setScore(0);
    setSkipCount(0);
    setErrorCount(0);
    setInput("");
    setGameState("playing");
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!current) return;
    if (input.trim().toLowerCase() === current.name.toLowerCase()) {
      setScore(s => s + 1);
      advanceToNext(remaining);
    } else {
      setErrorCount(e => e + 1);
      setInput("");
      inputRef.current?.focus();
    }
  }, [current, input, remaining, advanceToNext]);

  const handleSkip = useCallback(() => {
    if (!current) return;
    setSkipCount(s => s + 1);
    advanceToNext(remaining);
  }, [current, remaining, advanceToNext]);

  const handleChangeText = useCallback(
    (text: string) => {
      setInput(text);
      if (autoSend && current) {
        if (text.trim().toLowerCase() === current.name.toLowerCase()) {
          setScore(s => s + 1);
          advanceToNext(remaining);
        }
      }
    },
    [autoSend, current, remaining, advanceToNext],
  );

  if (gameState === "idle") {
    return (
      <View style={[styles.fill, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[styles.settingsBtn, { top: insets.top + 10 }]}
          onPress={() => router.push("/modal")}
        >
          <Text style={styles.settingsBtnText}>⚙</Text>
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={styles.idleTitle}>⚛ Atom Quiz</Text>
          <Text style={styles.idleSubtitle}>
            Can you name all 118 elements?
          </Text>
          <TouchableOpacity style={styles.btn} onPress={startGame}>
            <Text style={styles.btnText}>Play</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (gameState === "finished") {
    return (
      <View style={[styles.fill, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[styles.settingsBtn, { top: insets.top + 10 }]}
          onPress={() => router.push("/modal")}
        >
          <Text style={styles.settingsBtnText}>⚙</Text>
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={styles.idleTitle}>Complete</Text>
          <Text style={styles.idleSubtitle}>You named all 118 elements.</Text>
          <TouchableOpacity style={styles.btn} onPress={startGame}>
            <Text style={styles.btnText}>Play again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <TouchableOpacity
        style={[styles.settingsBtn, { top: insets.top + 10 }]}
        onPress={() => router.push("/modal")}
      >
        <Text style={styles.settingsBtnText}>⚙</Text>
      </TouchableOpacity>
      <KeyboardAvoidingView
        style={[
          styles.gameWrapper,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 8 },
        ]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Stats + Score */}
        <View style={styles.topArea}>
          <View style={styles.statsRow}>
            <Text style={styles.statItem}>↷ {skipCount} skipped</Text>
            <Text style={styles.statDivider}>·</Text>
            <Text style={styles.statItem}>✗ {errorCount} errors</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreNum}>{score}</Text>
            <Text style={styles.scoreTotal}> / 118</Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.cardArea}>
          {current && <AtomCard element={current} />}
        </View>

        {/* Input + Buttons */}
        <View style={styles.inputArea}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={handleChangeText}
            onSubmitEditing={handleSubmit}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="done"
            blurOnSubmit={false}
            keyboardAppearance="dark"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={handleSkip}
            >
              <Text style={[styles.btnText, styles.btnSecondaryText]}>
                Skip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={handleSubmit}
            >
              <Text style={styles.btnText}>Submit</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={startGame}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Tailwind zinc: 950=#09090b 900=#18181b 800=#27272a 700=#3f3f46
//               600=#52525b 500=#71717a 400=#a1a1aa 300=#d4d4d8
//               200=#e4e4e7 100=#f4f4f5
const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "#09090b", // zinc-950
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 32,
  },
  idleTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#f4f4f5", // zinc-100
    letterSpacing: 0.3,
    textAlign: "center",
  },
  idleSubtitle: {
    fontSize: 14,
    color: "#52525b", // zinc-600
    textAlign: "center",
    lineHeight: 21,
  },

  btn: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 44,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: "#f4f4f5", // zinc-100
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: "#18181b", // zinc-900
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
  },
  btnText: {
    color: "#09090b", // zinc-950
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  btnSecondaryText: {
    color: "#71717a", // zinc-500
  },

  gameWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  topArea: {
    alignItems: "center",
    gap: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statItem: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3f3f46", // zinc-700
  },
  statDivider: {
    fontSize: 12,
    color: "#27272a", // zinc-800
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  scoreNum: {
    fontSize: 32,
    fontWeight: "800",
    color: "#e4e4e7", // zinc-200
  },
  scoreTotal: {
    fontSize: 18,
    fontWeight: "400",
    color: "#3f3f46", // zinc-700
  },
  cardArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  atomCard: {
    width: 190,
    height: 190,
    borderRadius: 18,
    backgroundColor: "#18181b", // zinc-900
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
  atomSymbol: {
    fontSize: 76,
    fontWeight: "700",
    color: "#f4f4f5", // zinc-100
    letterSpacing: -2,
    lineHeight: 82,
  },
  maskedName: {
    position: "absolute",
    bottom: 14,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2.5,
    color: "#3f3f46", // zinc-700
  },

  inputArea: {
    width: "100%",
    gap: 8,
    alignItems: "center",
    paddingBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    gap: 8,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: "#e4e4e7", // zinc-200
    backgroundColor: "#18181b", // zinc-900
  },
  resetText: {
    fontSize: 13,
    color: "#3f3f46", // zinc-700
    fontWeight: "500",
    paddingVertical: 4,
  },
  settingsBtn: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsBtnText: {
    fontSize: 16,
    color: "#71717a",
  },
});
