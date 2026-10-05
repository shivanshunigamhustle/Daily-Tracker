import { apiClient } from "./client";
import { AttendanceRecord, DailyUpdate, DailyUpdateStatus, Task, TaskPriority, TaskStatus, TeamAttendanceRow, WorkMode } from "../types";

export async function getTodayAttendance(): Promise<AttendanceRecord | null> {
  const { data } = await apiClient.get<AttendanceRecord | null>("/attendance/today");
  return data;
}

export async function checkIn(workMode: WorkMode = "OFFICE"): Promise<AttendanceRecord> {
  const { data } = await apiClient.post<AttendanceRecord>("/attendance/check-in", { workMode });
  return data;
}

export async function checkOut(): Promise<AttendanceRecord> {
  const { data } = await apiClient.post<AttendanceRecord>("/attendance/check-out");
  return data;
}

export async function getTeamAttendanceToday(): Promise<TeamAttendanceRow[]> {
  const { data } = await apiClient.get<TeamAttendanceRow[]>("/attendance/team/today");
  return data;
}

export async function listTasks(): Promise<Task[]> {
  const { data } = await apiClient.get<Task[]>("/tasks");
  return data;
}

export async function createTask(input: {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId: string;
}): Promise<Task> {
  const { data } = await apiClient.post<Task>("/tasks", input);
  return data;
}

export async function updateTask(
  id: string,
  input: { status?: TaskStatus; completion?: number }
): Promise<Task> {
  const { data } = await apiClient.patch<Task>(`/tasks/${id}`, input);
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}

export async function getMyTodayUpdate(): Promise<DailyUpdate | null> {
  const { data } = await apiClient.get<DailyUpdate | null>("/daily-updates/today");
  return data;
}

export async function submitDailyUpdate(input: {
  summary: string;
  blockers?: string;
  tomorrowPlan?: string;
}): Promise<DailyUpdate> {
  const { data } = await apiClient.post<DailyUpdate>("/daily-updates", input);
  return data;
}

export async function getTeamUpdatesToday(): Promise<DailyUpdate[]> {
  const { data } = await apiClient.get<DailyUpdate[]>("/daily-updates/review");
  return data;
}

export async function reviewDailyUpdate(
  id: string,
  input: { decision: Exclude<DailyUpdateStatus, "SUBMITTED">; comment?: string }
): Promise<DailyUpdate> {
  const { data } = await apiClient.post<DailyUpdate>(`/daily-updates/${id}/review`, input);
  return data;
}
