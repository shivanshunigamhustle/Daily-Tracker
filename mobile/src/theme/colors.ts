// Light-mode token values. Kept as a single flat object (rather than
// {light, dark}) so existing `colors.primary`-style imports keep working.
// A future dark mode just needs a parallel `dark` object plus a provider
// that swaps which one this module re-exports — no consumer changes needed.
export const colors = {
  // Brand
  primary: "#4F46E5",
  primaryDark: "#4338CA",
  primaryLight: "#818CF8",
  primaryMuted: "#EEF0FD",
  secondary: "#0EA5E9",
  secondaryMuted: "#E6F6FD",
  accent: "#F59E0B",

  // Surfaces
  background: "#F5F6FA",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  overlay: "rgba(17, 24, 39, 0.45)",

  // Text
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textDisabled: "#C5C9D3",

  // Borders
  border: "#E3E6ED",
  divider: "#ECEEF2",

  // Semantic status
  success: "#059669",
  successDark: "#047857",
  successMuted: "#E6F4EF",
  warning: "#D97706",
  warningDark: "#B45309",
  warningMuted: "#FDF0E1",
  danger: "#DC2626",
  dangerDark: "#B91C1C",
  dangerMuted: "#FCE8E8",
  info: "#2563EB",
  infoDark: "#1D4ED8",
  infoMuted: "#E8EFFD",

  // Aliases (error === danger) so either vocabulary reads naturally
  error: "#DC2626",
  errorDark: "#B91C1C",
  errorMuted: "#FCE8E8",

  white: "#FFFFFF",
  black: "#000000",
};
