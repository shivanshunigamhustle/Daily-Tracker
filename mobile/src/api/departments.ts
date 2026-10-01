import { apiClient } from "./client";
import { Department } from "../types";

export async function listDepartments(): Promise<Department[]> {
  const { data } = await apiClient.get<Department[]>("/departments");
  return data;
}

export async function createDepartment(input: { name: string; description?: string }): Promise<Department> {
  const { data } = await apiClient.post<Department>("/departments", input);
  return data;
}

export async function deleteDepartment(id: string): Promise<void> {
  await apiClient.delete(`/departments/${id}`);
}
