import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Root wrapper for every tab screen. Applies the device's safe-area insets
 * (status bar / notch on top, left/right in landscape) so content — most
 * importantly ScreenHeader — never renders underneath the OS status bar.
 * The bottom inset is left alone: react-navigation's tab bar already
 * reserves that space on its own.
 */
export function Screen({ children, style }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.sm, paddingLeft: insets.left, paddingRight: insets.right },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
