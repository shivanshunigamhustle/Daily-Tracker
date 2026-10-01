export type RoleName = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE";
export type WorkMode = "OFFICE" | "WFH" | "HYBRID" | "FIELD";
export type EmploymentStatus = "ACTIVE" | "ON_LEAVE" | "SUSPENDED" | "TERMINATED";

export interface EmployeeSummary {
  id: string;
  employeeCode: string;
  fullName: string;
  designation: string | null;
  departmentId: string | null;
  teamId: string | null;
  managerId: string | null;
  workMode: WorkMode;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: RoleName;
  isActive: boolean;
  employee: EmployeeSummary | null;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  _count?: { teams: number; employees: number };
}

export interface Team {
  id: string;
  name: string;
  departmentId: string;
  managerId: string | null;
  department?: { id: string; name: string };
  manager?: { id: string; fullName: string } | null;
  _count?: { members: number };
}

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  designation: string | null;
  phone: string | null;
  departmentId: string | null;
  teamId: string | null;
  managerId: string | null;
  joiningDate: string | null;
  employmentStatus: EmploymentStatus;
  workMode: WorkMode;
  user: { id: string; email: string; isActive: boolean; role: { name: RoleName } };
  department: { id: string; name: string } | null;
  team: { id: string; name: string } | null;
  manager: { id: string; fullName: string } | null;
}

export interface EmployeeDashboard {
  role: "EMPLOYEE";
  employee: Employee | null;
  today: {
    workStatus: string;
    loginTime: string | null;
    workingTime: string | null;
    dailyUpdateStatus: string;
  };
  tasks: { total: number; completed: number; inProgress: number };
}

export interface ManagerDashboard {
  role: "MANAGER";
  employee: Employee | null;
  team: { totalEmployees: number; present: number; absent: number; onLeave: number; updatesPending: number };
}

export interface AdminDashboard {
  role: "ADMIN" | "SUPER_ADMIN";
  organization: { totalEmployees: number; totalDepartments: number; totalTeams: number };
}

export type DashboardPayload = EmployeeDashboard | ManagerDashboard | AdminDashboard;
