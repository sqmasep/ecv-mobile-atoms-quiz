import { useEffect, useRef } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AchievementsButton } from "@/components/achievements-button";
import { AtomCard } from "@/components/atom-card";
import { ElementFilterSelector } from "@/components/element-filter-selector";
import { GameModeSelector } from "@/components/game-mode-selector";
import { HomeButton } from "@/components/home-button";
import { OrderModeSelector } from "@/components/order-mode-selector";
import { ReactionTimeBadge } from "@/components/reaction-time-badge";
import { SettingsButton } from "@/components/settings-button";
import { ACHIEVEMENTS } from "@/constants/achievements";
import { reactionColor } from "@/constants/atom-palette";
import { useAchievements } from "@/context/achievements";
import data from "@/data.json";
import { useGame } from "@/hooks/use-game";
import type { GameResult } from "@/types/achievement";
import { formatTime } from "@/utils/game";

// Tailwind zinc: 950=#09090b 900=#18181b 800=#27272a 700=#3f3f46
//               600=#52525b 500=#71717a 400=#a1a1aa 300=#d4d4d8
//               200=#e4e4e7 100=#f4f4f5

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const game = useGame();
  const achievements = useAchievements();

  // Fire achievement check exactly once each time the game finishes
  const checkedRef = useRef(false);
  useEffect(() => {
    if (game.gameState === "playing") checkedRef.current = false;
    if (game.gameState !== "finished" || checkedRef.current) return;
    checkedRef.current = true;
    const result: GameResult = {
      guessMode: game.guessMode,
      elementFilter: game.elementFilter,
      orderMode: game.orderMode,
      poolSize: game.poolSize,
      score: game.score,
      skipCount: game.skipCount,
      errorCount: game.errorCount,
      elapsed: game.elapsed,
      reactions: game.finalReactionTimes,
    };
    achievements.checkGame(result);
  }, [game.gameState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear newly-unlocked banner when leaving the finished screen
  useEffect(() => {
    if (game.gameState !== "finished") achievements.clearNewlyUnlocked();
  }, [game.gameState]); // eslint-disable-line react-hooks/exhaustive-deps

  if (game.gameState === "idle") {
    const poolCount =
      game.elementFilter === "all"
        ? data.elements.length
        : data.elements.filter(e => e.category === game.elementFilter).length;

    return (
      <View style={[styles.fill, { paddingTop: insets.top }]}>
        <AchievementsButton top={insets.top + 10} />
        <SettingsButton top={insets.top + 10} />
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[
            styles.idleContent,
            { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.idleTitle, styles.px]}>
            {"\u269b"} Atom Quiz
          </Text>

          <Text style={[styles.sectionLabel, styles.px]}>Guess</Text>
          <View style={styles.px}>
            <GameModeSelector
              value={game.guessMode}
              onChange={game.setGuessMode}
            />
          </View>

          <Text style={[styles.sectionLabel, styles.px]}>Category</Text>
          <ElementFilterSelector
            value={game.elementFilter}
            onChange={game.setElementFilter}
          />

          <Text style={[styles.sectionLabel, styles.px]}>Order</Text>
          <View style={styles.px}>
            <OrderModeSelector
              value={game.orderMode}
              guessMode={game.guessMode}
              onChange={game.setOrderMode}
            />
          </View>

          <View style={[styles.px, { marginTop: 8 }]}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={game.startGame}
            >
              <Text style={styles.btnText}>Play · {poolCount}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (game.gameState === "finished") {
    return (
      <View style={[styles.fill, { paddingTop: insets.top }]}>
        <HomeButton top={insets.top + 10} onPress={game.goHome} />
        <SettingsButton top={insets.top + 10} />
        <ScrollView
          contentContainerStyle={[
            styles.finishedContent,
            { paddingTop: insets.top + 68, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.idleTitle}>Complete</Text>
          <Text style={styles.idleSubtitle}>{formatTime(game.elapsed)}</Text>
          <Text style={styles.idleSubtitle}>
            {game.skipCount} skipped {"\u00b7"} {game.errorCount} errors
          </Text>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={game.startGame}
          >
            <Text style={styles.btnText}>Play again</Text>
          </TouchableOpacity>

          {achievements.newlyUnlocked.length > 0 && (
            <View style={styles.achievementBanner}>
              <Text style={styles.achievementBannerTitle}>
                {"\u{1F3C6}"} Achievement
                {achievements.newlyUnlocked.length > 1 ? "s" : ""} Unlocked!
              </Text>
              {achievements.newlyUnlocked.map(id => {
                const ach = ACHIEVEMENTS.find(a => a.id === id);
                if (!ach) return null;
                return (
                  <Text key={id} style={styles.achievementBannerItem}>
                    {ach.icon} {ach.name}
                  </Text>
                );
              })}
            </View>
          )}

          <View style={styles.recapList}>
            <Text style={styles.recapHeader}>Reaction times</Text>
            {game.finalReactionTimes.map(rt => {
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

  // Playing screen
  return (
    <View style={styles.fill}>
      <HomeButton top={insets.top + 10} onPress={game.goHome} />
      <SettingsButton top={insets.top + 10} />
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
            <Text style={styles.statItem}>
              {"\u21b7"} {game.skipCount} skipped
            </Text>
            <Text style={styles.statDivider}>{"\u00b7"}</Text>
            <Text style={styles.statItem}>
              {"\u2717"} {game.errorCount} errors
            </Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.timerText}>{formatTime(game.elapsed)}</Text>
            <View style={styles.reactionSlot}>
              {game.lastReactionMs !== null && (
                <ReactionTimeBadge
                  key={game.reactionKey}
                  ms={game.lastReactionMs}
                  color={reactionColor(game.lastReactionMs)}
                  onHide={() => game.setLastReactionMs(null)}
                />
              )}
            </View>
            <View style={styles.scoreGroup}>
              <Text style={styles.scoreNum}>{game.score}</Text>
              <Text style={styles.scoreTotal}> / {game.poolSize}</Text>
            </View>
          </View>
        </View>

        {/* Card */}
        <View style={styles.cardArea}>
          {game.current && (
            <AtomCard element={game.current} guessMode={game.guessMode} />
          )}
        </View>

        {/* Input + Buttons */}
        <View style={styles.inputArea}>
          <TextInput
            ref={game.inputRef}
            style={styles.input}
            value={game.input}
            onChangeText={game.handleChangeText}
            onSubmitEditing={game.handleSubmit}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="done"
            blurOnSubmit={false}
            keyboardAppearance="dark"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={game.handleSkip}
            >
              <Text style={[styles.btnText, styles.btnSecondaryText]}>
                Skip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={game.handleSubmit}
            >
              <Text style={styles.btnText}>Submit</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={game.startGame}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "#09090b", // zinc-950
  },
  /** Horizontal padding shared by padded idle-screen rows */
  px: {
    paddingHorizontal: 24,
  },
  idleContent: {
    flexGrow: 1,
    justifyContent: "center",
    gap: 10,
  },
  idleTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#f4f4f5", // zinc-100
    letterSpacing: 0.3,
    textAlign: "center",
    marginBottom: 6,
  },
  idleSubtitle: {
    fontSize: 14,
    color: "#52525b", // zinc-600
    textAlign: "center",
    lineHeight: 21,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3f3f46", // zinc-700
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: -4,
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  btn: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 44,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnPrimary: {
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

  // ── Playing layout ────────────────────────────────────────────────────────
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
  reactionSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Input area ────────────────────────────────────────────────────────────
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

  // ── Finished / recap ──────────────────────────────────────────────────────
  finishedContent: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  // ── Achievement banner (finished screen) ─────────────────────────────────
  achievementBanner: {
    width: "100%",
    backgroundColor: "#18181b", // zinc-900
    borderWidth: 1,
    borderColor: "#3f3f46", // zinc-700
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
    marginTop: 4,
  },
  achievementBannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#e4e4e7", // zinc-200
    letterSpacing: 0.2,
  },
  achievementBannerItem: {
    fontSize: 13,
    color: "#71717a", // zinc-500
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
    color: "#52525b", // zinc-600 (overridden inline)
    fontVariant: ["tabular-nums"],
  },
  recapTimeSkipped: {
    color: "#3f3f46", // zinc-700
    fontStyle: "italic",
  },
});
