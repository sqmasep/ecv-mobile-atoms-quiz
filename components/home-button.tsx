import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";

export function HomeButton({
  top,
  onPress,
}: {
  top: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.btn, { top }]} onPress={onPress}>
      <Ionicons name="arrow-back" size={18} color="#71717a" />
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
    fontSize: 16,
    color: "#71717a", // zinc-500
  },
});
