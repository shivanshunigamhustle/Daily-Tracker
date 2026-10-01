import { colors } from "./colors";

// Custom-loaded fonts (see App.tsx's useFonts call) ignore the RN
// `fontWeight` style prop on Android — each weight is its own family name,
// so every text style below sets `fontFamily` directly instead.
export const fontFamily = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

// Kept for any code that still wants a numeric weight (e.g. native
// components that don't accept fontFamily, like ActivityIndicator sizing).
export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const typography = {
  display: { fontFamily: fontFamily.bold, fontSize: 32, color: colors.textPrimary, letterSpacing: -0.5 },
  h1: { fontFamily: fontFamily.bold, fontSize: 24, color: colors.textPrimary },
  h2: { fontFamily: fontFamily.bold, fontSize: 20, color: colors.textPrimary },
  h3: { fontFamily: fontFamily.semibold, fontSize: 17, color: colors.textPrimary },
  title: { fontFamily: fontFamily.semibold, fontSize: 16, color: colors.textPrimary },
  subtitle: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.textSecondary },
  body: { fontFamily: fontFamily.regular, fontSize: 15, color: colors.textPrimary },
  bodySmall: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  caption: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  button: { fontFamily: fontFamily.semibold, fontSize: 15, color: colors.white },
  label: { fontFamily: fontFamily.semibold, fontSize: 12, color: colors.textMuted, letterSpacing: 0.4 },
  overline: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
  },
};
