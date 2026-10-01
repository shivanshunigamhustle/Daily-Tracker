import { Platform } from "react-native";

// For a physical device + Expo Go, set EXPO_PUBLIC_API_URL in mobile/.env to
// your machine's LAN IP, e.g. http://192.168.1.50:4000/api/v1
const configuredUrl = process.env.EXPO_PUBLIC_API_URL;

function defaultApiUrl(): string {
  if (Platform.OS === "android") {
    // Android emulator's alias for the host machine's localhost.
    return "http://10.0.2.2:4000/api/v1";
  }
  return "http://localhost:4000/api/v1";
}

export const API_BASE_URL = configuredUrl ?? defaultApiUrl();
