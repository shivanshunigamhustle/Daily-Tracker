import { Platform } from "react-native";

// Development: set EXPO_PUBLIC_API_URL in mobile/.env to your machine's LAN IP,
// e.g. http://192.168.1.50:4000/api/v1 (localhost on a phone is the phone itself).
// Release builds must set EXPO_PUBLIC_API_URL to the public HTTPS backend.
const configuredUrl = process.env.EXPO_PUBLIC_API_URL;

function devFallbackUrl(): string {
  if (Platform.OS === "android") {
    // Android emulator's alias for the host machine's localhost.
    return "http://10.0.2.2:4000/api/v1";
  }
  return "http://localhost:4000/api/v1";
}

if (!configuredUrl && !__DEV__) {
  throw new Error("EXPO_PUBLIC_API_URL is not set for this release build");
}

export const API_BASE_URL = configuredUrl ?? devFallbackUrl();
