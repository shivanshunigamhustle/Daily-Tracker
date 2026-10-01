import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Screen } from "../components/Screen";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";
import { duration, useReducedMotion } from "../theme/animation";
import { getErrorMessage } from "../utils/errorMessage";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(reducedMotion ? 0 : 16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: reducedMotion ? 0 : duration.large, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: reducedMotion ? 0 : duration.large, useNativeDriver: true }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ]).start();
  }, []);

  function validate(): boolean {
    const trimmedEmail = email.trim();
    let valid = true;

    if (!trimmedEmail) {
      setEmailError("Email is required");
      valid = false;
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailError("Enter a valid email address");
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      valid = false;
    } else {
      setPasswordError(null);
    }

    return valid;
  }

  async function handleSubmit() {
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setFormError(getErrorMessage(err, "Unable to sign in. Check your credentials."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Animated.View style={[styles.content, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.title}>Team Daily Tracker</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(null);
            }}
            keyboardType="email-address"
            placeholder="you@company.com"
            error={emailError ?? undefined}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            isPassword
            placeholder="••••••••"
            error={passwordError ?? undefined}
          />
          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          <Button title="Sign In" onPress={handleSubmit} loading={submitting} disabled={!email || !password} />
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  form: {
    marginTop: spacing.lg,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    marginBottom: spacing.md,
  },
});
