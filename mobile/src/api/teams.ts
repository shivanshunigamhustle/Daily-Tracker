import { apiClient } from "./client";
import { Team } from "../types";

export async function listTeams(): Promise<Team[]> {
  const { data } = await apiClient.get<Team[]>("/teams");
  return data;
}

export async function createTeam(input: { name: string; departmentId: string; managerId?: string }): Promise<Team> {
  const { data } = await apiClient.post<Team>("/teams", input);
  return data;
}

export async function deleteTeam(id: string): Promise<void> {
  await apiClient.delete(`/teams/${id}`);
}
