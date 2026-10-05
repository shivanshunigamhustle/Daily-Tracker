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

export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type DailyUpdateStatus = "SUBMITTED" | "NEEDS_CHANGES" | "APPROVED";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completion: number;
  dueDate: string | null;
  assignee: { id: string; fullName: string };
  assignedBy: { id: string; fullName: string } | null;
}

export interface AttendanceRecord {
  id: string;
  checkInAt: string;
  checkOutAt: string | null;
  workMode: WorkMode;
}

export interface DailyUpdate {
  id: string;
  employeeId: string;
  summary: string;
  blockers: string | null;
  tomorrowPlan: string | null;
  status: DailyUpdateStatus;
  reviewComment: string | null;
  employee?: { id: string; fullName: string; designation: string | null };
}

export interface TeamAttendanceRow {
  employeeId: string;
  fullName: string;
  designation: string | null;
  teamName: string | null;
  attendance: AttendanceRecord | null;
}

export interface EmployeeDashboard {
  role: "EMPLOYEE";
  employee: { fullName: string; designation: string | null } | null;
  today: {
    workStatus: "NOT_STARTED" | "WORKING" | "ENDED";
    loginTime: string | null;
    workingTime: string | null;
    dailyUpdateStatus: DailyUpdateStatus | "NOT_SUBMITTED";
  };
  tasks: { total: number; completed: number; inProgress: number; notStarted: number; blocked: number };
}

export interface ManagerDashboard {
  role: "MANAGER";
  team: { totalEmployees: number; present: number; absent: number; updatesPending: number };
  tasks: { total: number; completed: number; inProgress: number; blocked: number };
}

export interface AdminDashboard {
  role: "ADMIN" | "SUPER_ADMIN";
  organization: { totalEmployees: number; totalDepartments: number; totalTeams: number };
  team: { totalEmployees: number; present: number; absent: number; updatesPending: number };
  tasks: { total: number; completed: number; inProgress: number; blocked: number };
}

export type DashboardPayload = EmployeeDashboard | ManagerDashboard | AdminDashboard;
