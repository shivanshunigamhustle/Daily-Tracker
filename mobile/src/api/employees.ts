import { apiClient } from "./client";
import { Employee, RoleName, WorkMode } from "../types";

export async function listEmployees(): Promise<Employee[]> {
  const { data } = await apiClient.get<Employee[]>("/employees");
  return data;
}

export interface CreateEmployeeInput {
  email: string;
  password: string;
  roleName: RoleName;
  fullName: string;
  designation?: string;
  phone?: string;
  departmentId?: string;
  teamId?: string;
  managerId?: string;
  workMode?: WorkMode;
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const { data } = await apiClient.post<Employee>("/employees", input);
  return data;
}

export async function deleteEmployee(id: string): Promise<void> {
  await apiClient.delete(`/employees/${id}`);
}
