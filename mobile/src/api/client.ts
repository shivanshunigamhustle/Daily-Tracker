import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./config";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../auth/tokenStore";

// Without a timeout, an unreachable API (e.g. wrong LAN IP on a physical
// device) leaves requests hanging forever instead of failing visibly. 30s
// (rather than something tighter) gives legitimate slow-network round trips
// room to complete instead of being aborted mid-request.
export const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 30000 });

let onAuthFailure: (() => void) | null = null;

export function setOnAuthFailure(handler: () => void) {
  onAuthFailure = handler;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken }, { timeout: 30000 });
    await setTokens({ accessToken: response.data.accessToken, refreshToken: response.data.refreshToken });
    return response.data.accessToken as string;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    if (error.response?.status === 401 && config && !config._retried && !config.url?.includes("/auth/")) {
      config._retried = true;

      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newAccessToken = await refreshPromise;
      refreshPromise = null;

      if (newAccessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(config);
      }

      await clearTokens();
      onAuthFailure?.();
    }

    return Promise.reject(error);
  }
);
