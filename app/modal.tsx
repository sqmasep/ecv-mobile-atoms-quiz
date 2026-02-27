import { useRouter } from "expo-router";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSettings } from "@/context/settings";
import { useAuth } from "@/stores/auth";

export default function SettingsModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { autoSend, setAutoSend } = useSettings();
  const { user, signOut } = useAuth();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Options */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowLabel}>Auto-send on correct</Text>
            <Text style={styles.rowDesc}>
              Submit automatically as soon as your answer matches.
            </Text>
          </View>
          <Switch
            value={autoSend}
            onValueChange={setAutoSend}
            trackColor={{ false: "#27272a", true: "#52525b" }}
            thumbColor={autoSend ? "#f4f4f5" : "#3f3f46"}
          />
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userSection}>
        <Text style={styles.userLabel}>Signed in as</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Sign Out Button */}
      <Button
        mode="outlined"
        onPress={() => { signOut(); router.replace("/auth/sign-in"); }}
        textColor="#71717a"
        style={styles.signOutBtn}
      >
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f4f4f5",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#71717a",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    borderRadius: 14,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowLeft: {
    flex: 1,
    gap: 3,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e4e4e7",
  },
  rowDesc: {
    fontSize: 12,
    color: "#52525b",
    lineHeight: 17,
  },
  userSection: {
    marginTop: 32,
    gap: 6,
  },
  userLabel: {
    fontSize: 12,
    color: "#52525b",
    fontWeight: "500",
  },
  userEmail: {
    fontSize: 14,
    color: "#e4e4e7",
    fontWeight: "600",
  },
  signOutBtn: {
    marginTop: 16,
    borderColor: "#27272a",
  },
});
