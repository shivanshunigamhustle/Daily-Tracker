import { z } from "zod";

const roleNameEnum = z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"]);
const workModeEnum = z.enum(["OFFICE", "WFH", "HYBRID", "FIELD"]);
const employmentStatusEnum = z.enum(["ACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED"]);

export const createEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  roleName: roleNameEnum,
  fullName: z.string().min(1).max(160),
  employeeCode: z.string().min(1).max(40).optional(),
  designation: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
  departmentId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  joiningDate: z.coerce.date().optional(),
  workMode: workModeEnum.optional(),
});

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(1).max(160).optional(),
  designation: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
  managerId: z.string().uuid().nullable().optional(),
  joiningDate: z.coerce.date().optional(),
  workMode: workModeEnum.optional(),
  employmentStatus: employmentStatusEnum.optional(),
  roleName: roleNameEnum.optional(),
  isActive: z.boolean().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
