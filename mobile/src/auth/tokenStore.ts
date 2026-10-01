import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "tracker.accessToken";
const REFRESH_TOKEN_KEY = "tracker.refreshToken";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// SecureStore can be unavailable on a given platform/runtime (e.g. the Expo
// web preview, or a device without a working keychain). In that case fall
// back to in-memory-only tokens rather than crashing the app — the session
// just won't survive a reload, which is an acceptable degradation.
async function safeGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function safeSet(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Ignored — see note above.
  }
}

async function safeDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Ignored — see note above.
  }
}

export async function hydrateTokens(): Promise<TokenPair | null> {
  const [storedAccess, storedRefresh] = await Promise.all([safeGet(ACCESS_TOKEN_KEY), safeGet(REFRESH_TOKEN_KEY)]);

  if (!storedAccess || !storedRefresh) return null;

  accessToken = storedAccess;
  refreshToken = storedRefresh;
  return { accessToken, refreshToken };
}

export async function setTokens(tokens: TokenPair): Promise<void> {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  await Promise.all([safeSet(ACCESS_TOKEN_KEY, tokens.accessToken), safeSet(REFRESH_TOKEN_KEY, tokens.refreshToken)]);
}

export async function clearTokens(): Promise<void> {
  accessToken = null;
  refreshToken = null;
  await Promise.all([safeDelete(ACCESS_TOKEN_KEY), safeDelete(REFRESH_TOKEN_KEY)]);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}
