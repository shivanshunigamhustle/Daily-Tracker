import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export function Input({ label, error, isPassword, style, onFocus, onBlur, ...props }: InputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            isPassword && styles.inputWithIcon,
            isFocused && !error && styles.inputFocused,
            error && styles.inputError,
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          secureTextEntry={isPassword ? !isVisible : props.secureTextEntry}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.toggle}
            onPress={() => setIsVisible((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={isVisible ? "Hide password" : "Show password"}
          >
            <Ionicons name={isVisible ? "eye-off" : "eye"} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputRow: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputWithIcon: {
    paddingRight: spacing.xl + spacing.md,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  toggle: {
    position: "absolute",
    right: spacing.md,
    height: 48,
    justifyContent: "center",
  },
  error: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.danger,
  },
});
