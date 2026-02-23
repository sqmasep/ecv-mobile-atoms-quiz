import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CATEGORY_COLORS, reactionColor } from "@/constants/atom-palette";
import { useSettings } from "@/context/settings";
import data from "@/data.json";

type Element = (typeof data.elements)[number];
type GameState = "idle" | "playing" | "finished";
type GuessMode = "name" | "symbol" | "atomicNumber";

/** How long (ms) the per-atom reaction time badge stays visible */
const REACTION_DISPLAY_MS = 1500;
const REACTION_ENTER_MS = 180;
const REACTION_EXIT_MS = 260;

function ReactionTimeBadge({
  ms,
  color,
  onHide,
}: {
  ms: number;
  color: string;
  onHide: () => void;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: REACTION_ENTER_MS });
    translateY.value = withTiming(0, { duration: REACTION_ENTER_MS });

    const t = setTimeout(() => {
      opacity.value = withTiming(
        0,
        { duration: REACTION_EXIT_MS },
        finished => {
          if (finished) runOnJS(onHide)();
        },
      );
      translateY.value = withTiming(-20, { duration: REACTION_EXIT_MS });
    }, REACTION_DISPLAY_MS);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[styles.reactionTime, { color }, animStyle]}>
      {formatTime(ms)}
    </Animated.Text>
  );
}

function pickRandom(pool: Element[]): Element {
  return pool[Math.floor(Math.random() * pool.length)];
}

function formatTime(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${m}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function AtomCard({
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
    <View style={[styles.atomCard, { backgroundColor: bgColor }]}>
      <Text style={styles.atomNumber}>
        {guessMode === "atomicNumber" ? maskedNumber : element.atomicNumber}
      </Text>
      <Text
        style={[
          styles.atomSymbol,
          guessMode === "symbol" && styles.atomFieldMasked,
        ]}
      >
        {guessMode === "symbol" ? maskedSymbol : element.symbol}
      </Text>
      <Text
        style={[
          styles.maskedName,
          guessMode !== "name" && styles.maskedNameVisible,
        ]}
      >
        {guessMode === "name" ? maskedName : element.name}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { autoSend } = useSettings();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [guessMode, setGuessMode] = useState<GuessMode>("name");
  const [remaining, setRemaining] = useState<Element[]>([]);
  const [current, setCurrent] = useState<Element | null>(null);
  const [score, setScore] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [input, setInput] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elementStartRef = useRef(0);
  const reactionTimesRef = useRef<
    { atomicNumber: number; ms: number; skipped: boolean }[]
  >([]);
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null);
  const [reactionKey, setReactionKey] = useState(0);
  const [finalReactionTimes, setFinalReactionTimes] = useState<
    { atomicNumber: number; ms: number; skipped: boolean }[]
  >([]);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    const start = Date.now();
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(Date.now() - start), 20);
  }, [stopTimer]);

  const showReaction = useCallback((ms: number) => {
    setLastReactionMs(ms);
    setReactionKey(k => k + 1);
  }, []);

  const advanceToNext = useCallback(
    (pool: Element[]) => {
      if (pool.length === 0) {
        stopTimer();
        setFinalReactionTimes([...reactionTimesRef.current]);
        setGameState("finished");
        return;
      }
      const next = pickRandom(pool);
      setRemaining(pool.filter(e => e.atomicNumber !== next.atomicNumber));
      setCurrent(next);
      setInput("");
      elementStartRef.current = Date.now();
      inputRef.current?.focus();
    },
    [stopTimer],
  );

  const startGame = useCallback(() => {
    const pool = [...data.elements];
    const first = pickRandom(pool);
    setRemaining(pool.filter(e => e.atomicNumber !== first.atomicNumber));
    setCurrent(first);
    setScore(0);
    setSkipCount(0);
    setErrorCount(0);
    setInput("");
    reactionTimesRef.current = [];
    elementStartRef.current = Date.now();
    setGameState("playing");
    startTimer();
    setTimeout(() => inputRef.current?.focus(), 150);
  }, [startTimer]);

  const handleSubmit = useCallback(() => {
    if (!current) return;
    const answer = input.trim().toLowerCase();
    const correct =
      guessMode === "name"
        ? current.name.toLowerCase()
        : guessMode === "symbol"
          ? current.symbol.toLowerCase()
          : String(current.atomicNumber);
    if (answer === correct) {
      const ms = Date.now() - elementStartRef.current;
      reactionTimesRef.current.push({
        atomicNumber: current.atomicNumber,
        ms,
        skipped: false,
      });
      showReaction(ms);
      setScore(s => s + 1);
      advanceToNext(remaining);
    } else {
      setErrorCount(e => e + 1);
      setInput("");
      inputRef.current?.focus();
    }
  }, [current, input, guessMode, remaining, advanceToNext, showReaction]);

  const handleSkip = useCallback(() => {
    if (!current) return;
    const ms = Date.now() - elementStartRef.current;
    reactionTimesRef.current.push({
      atomicNumber: current.atomicNumber,
      ms,
      skipped: true,
    });
    showReaction(ms);
    setSkipCount(s => s + 1);
    advanceToNext(remaining);
  }, [current, remaining, advanceToNext, showReaction]);

  const handleChangeText = useCallback(
    (text: string) => {
      setInput(text);
      if (autoSend && current) {
        const answer = text.trim().toLowerCase();
        const correct =
          guessMode === "name"
            ? current.name.toLowerCase()
            : guessMode === "symbol"
              ? current.symbol.toLowerCase()
              : String(current.atomicNumber);
        if (answer === correct) {
          const ms = Date.now() - elementStartRef.current;
          reactionTimesRef.current.push({
            atomicNumber: current.atomicNumber,
            ms,
            skipped: false,
          });
          showReaction(ms);
          setScore(s => s + 1);
          advanceToNext(remaining);
        }
      }
    },
    [autoSend, guessMode, current, remaining, advanceToNext, showReaction],
  );

  if (gameState === "idle") {
    const MODES: { value: GuessMode; label: string; sub: string }[] = [
      { value: "name", label: "Name", sub: "Hydrogen" },
      { value: "symbol", label: "Symbol", sub: "H" },
      { value: "atomicNumber", label: "Number", sub: "1" },
    ];
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
          <Text style={styles.idleSubtitle}>What do you want to guess?</Text>
          <View style={styles.modeRow}>
            {MODES.map(m => (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.modeBtn,
                  guessMode === m.value && styles.modeBtnActive,
                ]}
                onPress={() => setGuessMode(m.value)}
              >
                <Text
                  style={[
                    styles.modeBtnLabel,
                    guessMode === m.value && styles.modeBtnLabelActive,
                  ]}
                >
                  {m.label}
                </Text>
                <Text
                  style={[
                    styles.modeBtnSub,
                    guessMode === m.value && styles.modeBtnSubActive,
                  ]}
                >
                  {m.sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
        <ScrollView
          contentContainerStyle={[
            styles.finishedContent,
            { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.idleTitle}>Complete</Text>
          <Text style={styles.idleSubtitle}>{formatTime(elapsed)}</Text>
          <Text style={styles.idleSubtitle}>
            {skipCount} skipped · {errorCount} errors
          </Text>
          <TouchableOpacity style={styles.btn} onPress={startGame}>
            <Text style={styles.btnText}>Play again</Text>
          </TouchableOpacity>

          {/* Recap */}
          <View style={styles.recapList}>
            <Text style={styles.recapHeader}>Reaction times</Text>
            {finalReactionTimes.map(rt => {
              const el = data.elements.find(
                e => e.atomicNumber === rt.atomicNumber,
              );
              return (
                <View key={rt.atomicNumber} style={styles.recapRow}>
                  <Text style={styles.recapSymbol}>{el?.symbol}</Text>
                  <Text style={styles.recapName}>{el?.name}</Text>
                  <Text
                    style={[
                      styles.recapTime,
                      rt.skipped
                        ? styles.recapTimeSkipped
                        : { color: reactionColor(rt.ms) },
                    ]}
                  >
                    {rt.skipped ? "skip" : formatTime(rt.ms)}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
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
            <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
            <View style={styles.reactionSlot}>
              {lastReactionMs !== null && (
                <ReactionTimeBadge
                  key={reactionKey}
                  ms={lastReactionMs}
                  color={reactionColor(lastReactionMs)}
                  onHide={() => setLastReactionMs(null)}
                />
              )}
            </View>
            <View style={styles.scoreGroup}>
              <Text style={styles.scoreNum}>{score}</Text>
              <Text style={styles.scoreTotal}> / 118</Text>
            </View>
          </View>
        </View>

        {/* Card */}
        <View style={styles.cardArea}>
          {current && <AtomCard element={current} guessMode={guessMode} />}
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
    width: "100%",
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
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  scoreGroup: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  timerText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#52525b", // zinc-600
    fontVariant: ["tabular-nums"],
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
    color: "#3f3f46", // zinc-700 — masked
  },
  maskedNameVisible: {
    color: "#71717a", // zinc-500 — shown
    letterSpacing: 1,
  },
  atomFieldMasked: {
    color: "#3f3f46", // zinc-700 — masked symbol
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

  // ── Mode selector ────────────────────────────────────────────────────────
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 8,
  },
  modeBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
    backgroundColor: "#18181b", // zinc-900
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  modeBtnActive: {
    borderColor: "#e4e4e7", // zinc-200
    backgroundColor: "#27272a", // zinc-800
  },
  modeBtnLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3f3f46", // zinc-700
  },
  modeBtnLabelActive: {
    color: "#f4f4f5", // zinc-100
  },
  modeBtnSub: {
    fontSize: 18,
    fontWeight: "700",
    color: "#27272a", // zinc-800
  },
  modeBtnSubActive: {
    color: "#71717a", // zinc-500
  },

  // ── Live reaction flash ────────────────────────────────────────────────────
  reactionSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  reactionTime: {
    fontSize: 13,
    fontWeight: "700",
    color: "#52525b", // zinc-600 (default, overridden inline)
    fontVariant: ["tabular-nums"],
  },

  // ── Finished / recap ──────────────────────────────────────────────────────
  finishedContent: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  recapList: {
    width: "100%",
    marginTop: 24,
    gap: 2,
  },
  recapHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3f3f46", // zinc-700
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  recapRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#18181b", // zinc-900
    marginBottom: 2,
    gap: 10,
  },
  recapSymbol: {
    width: 32,
    fontSize: 14,
    fontWeight: "700",
    color: "#a1a1aa", // zinc-400
    textAlign: "center",
  },
  recapName: {
    flex: 1,
    fontSize: 14,
    color: "#71717a", // zinc-500
  },
  recapTime: {
    fontSize: 13,
    fontWeight: "700",
    color: "#52525b", // zinc-600 (default, overridden inline)
    fontVariant: ["tabular-nums"],
  },
  recapTimeSkipped: {
    color: "#3f3f46", // zinc-700
    fontStyle: "italic",
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
