import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export function AchievementsButton({ top }: { top: number }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={[styles.btn, { top }]}
      onPress={() => router.push("/achievements")}
    >
      <Text style={styles.icon}>{"\u{1F3C6}"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#18181b", // zinc-900
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 15,
  },
});
