import { apiClient } from "./client";
import { DashboardPayload } from "../types";

export async function fetchMyDashboard(): Promise<DashboardPayload> {
  const { data } = await apiClient.get<DashboardPayload>("/dashboard/me");
  return data;
}
