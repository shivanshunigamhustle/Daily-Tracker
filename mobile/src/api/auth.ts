import { apiClient } from "./client";
import { AuthenticatedUser } from "../types";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", { email, password });
  return data;
}

export async function fetchMe(): Promise<AuthenticatedUser> {
  const { data } = await apiClient.get<AuthenticatedUser>("/auth/me");
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
