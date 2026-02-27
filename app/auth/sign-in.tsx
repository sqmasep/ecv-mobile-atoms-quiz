import { useAuth } from "@/stores/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    setError("");
    try {
      await signIn(email, password);
      router.replace("/(tabs)/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text variant="displaySmall" style={styles.title}>
            Atom Quiz
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Sign in to continue
          </Text>
        </View>

        <View style={styles.formSection}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!isLoading}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            mode="outlined"
            style={styles.input}
          />

          {error && (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          )}

          <View style={styles.buttonGroup}>
            <Button
              mode="contained"
              onPress={handleSignIn}
              disabled={!email || !password || isLoading}
              loading={isLoading}
              style={styles.button}
            >
              Sign In
            </Button>
          </View>

          <View style={styles.signupPrompt}>
            <Text variant="bodyMedium">Don't have an account?</Text>
            <Button
              mode="text"
              onPress={() => router.push("/auth/sign-up")}
              disabled={isLoading}
              compact
            >
              Sign Up
            </Button>
          </View>
        </View>

        {isLoading && <ActivityIndicator size="large" />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    color: "#f4f4f5",
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#71717a",
  },
  formSection: {
    gap: 12,
  },
  input: {
    backgroundColor: "#18181b",
  },
  buttonGroup: {
    marginTop: 16,
    gap: 8,
  },
  button: {
    paddingVertical: 6,
  },
  signupPrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
});
