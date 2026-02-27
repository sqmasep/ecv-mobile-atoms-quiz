import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

export function AchievementsButton({ top }: { top: number }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={[styles.btn, { top }]}
      onPress={() => router.push("/achievements")}
    >
      <MaterialCommunityIcons name="trophy" size={18} color="#f4f4f5" />
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
