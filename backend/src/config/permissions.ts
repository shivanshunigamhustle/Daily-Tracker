export const PERMISSIONS = {
  DEPARTMENTS_READ: "departments:read",
  DEPARTMENTS_WRITE: "departments:write",
  TEAMS_READ: "teams:read",
  TEAMS_WRITE: "teams:write",
  EMPLOYEES_READ: "employees:read",
  EMPLOYEES_READ_ALL: "employees:read:all",
  EMPLOYEES_WRITE: "employees:write",
  ROLES_READ: "roles:read",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionKey[] = Object.values(PERMISSIONS);

// Default permission grants per role, used by the seed script.
export const ROLE_PERMISSIONS: Record<"SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE", PermissionKey[]> = {
  SUPER_ADMIN: [...ALL_PERMISSIONS],
  ADMIN: [...ALL_PERMISSIONS],
  MANAGER: [
    PERMISSIONS.DEPARTMENTS_READ,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.EMPLOYEES_READ,
    PERMISSIONS.ROLES_READ,
  ],
  EMPLOYEE: [PERMISSIONS.DEPARTMENTS_READ, PERMISSIONS.TEAMS_READ, PERMISSIONS.EMPLOYEES_READ],
};
