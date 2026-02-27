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

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignUp = async () => {
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await signUp(email, password, name);
      router.replace("/(tabs)/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
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
            Create your account
          </Text>
        </View>

        <View style={styles.formSection}>
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!isLoading}
            mode="outlined"
            style={styles.input}
          />

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

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            editable={!isLoading}
            right={
              <TextInput.Icon
                icon={showConfirm ? "eye-off" : "eye"}
                onPress={() => setShowConfirm(!showConfirm)}
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
              onPress={handleSignUp}
              disabled={
                !name || !email || !password || !confirmPassword || isLoading
              }
              loading={isLoading}
              style={styles.button}
            >
              Sign Up
            </Button>
          </View>

          <View style={styles.signinPrompt}>
            <Text variant="bodyMedium">Already have an account?</Text>
            <Button
              mode="text"
              onPress={() => router.push("/auth/sign-in")}
              disabled={isLoading}
              compact
            >
              Sign In
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
  signinPrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
});
