import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ACHIEVEMENTS } from "@/constants/achievements";
import { useAchievements } from "@/context/achievements";
import { Ionicons } from "@expo/vector-icons";

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { unlocked } = useAchievements();

  const unlockedCount = unlocked.size;
  const total = ACHIEVEMENTS.length;

  return (
    <View style={[styles.fill, { paddingTop: insets.top }]}>
      {/* Back button */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 10 }]}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={18} color="#71717a" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 68, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>
            {unlockedCount} / {total} unlocked
          </Text>
          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(unlockedCount / total) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Achievement cards */}
        {ACHIEVEMENTS.map(ach => {
          const isUnlocked = unlocked.has(ach.id);
          return (
            <View
              key={ach.id}
              style={[styles.card, !isUnlocked && styles.cardLocked]}
            >
              <View
                style={[styles.iconBox, !isUnlocked && styles.iconBoxLocked]}
              >
                <Text
                  style={[
                    styles.iconText,
                    !isUnlocked && styles.iconTextLocked,
                  ]}
                >
                  {ach.icon}
                </Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <Text
                    style={[
                      styles.cardName,
                      !isUnlocked && styles.cardNameLocked,
                    ]}
                  >
                    {ach.name}
                  </Text>
                  {isUnlocked && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Unlocked</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.cardDesc,
                    !isUnlocked && styles.cardDescLocked,
                  ]}
                >
                  {ach.description}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "#09090b", // zinc-950
  },
  backBtn: {
    position: "absolute",
    left: 16,
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
  backIcon: {
    fontSize: 16,
    color: "#71717a",
  },
  content: {
    paddingHorizontal: 20,
    gap: 8,
  },
  header: {
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f4f4f5", // zinc-100
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "#52525b", // zinc-600
    fontWeight: "500",
  },
  progressTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "#27272a", // zinc-800
    marginTop: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#e4e4e7", // zinc-200
  },

  // ── Cards ──────────────────────────────────────────────────────────────────
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#18181b", // zinc-900
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
    padding: 14,
  },
  cardLocked: {
    borderColor: "#1c1c1f",
    backgroundColor: "#111113",
    opacity: 0.55,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#27272a", // zinc-800
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxLocked: {
    backgroundColor: "#1c1c1f",
  },
  iconText: {
    fontSize: 24,
  },
  iconTextLocked: {
    opacity: 0.4,
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#e4e4e7", // zinc-200
  },
  cardNameLocked: {
    color: "#3f3f46", // zinc-700
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#27272a", // zinc-800
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#71717a", // zinc-500
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  cardDesc: {
    fontSize: 12,
    color: "#52525b", // zinc-600
    lineHeight: 17,
  },
  cardDescLocked: {
    color: "#27272a", // zinc-800
  },
});
