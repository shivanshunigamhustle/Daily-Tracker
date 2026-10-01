import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { hashPassword } from "../../utils/password";
import { AccessTokenPayload } from "../../utils/jwt";
import { CreateEmployeeInput, UpdateEmployeeInput } from "./employees.schema";

const employeeInclude = {
  user: { select: { id: true, email: true, isActive: true, role: { select: { name: true } } } },
  department: { select: { id: true, name: true } },
  team: { select: { id: true, name: true } },
  manager: { select: { id: true, fullName: true } },
} satisfies Prisma.EmployeeInclude;

async function generateEmployeeCode(): Promise<string> {
  const count = await prisma.employee.count();
  return `EMP-${String(count + 1).padStart(4, "0")}`;
}

async function findActingEmployee(userId: string) {
  return prisma.employee.findUnique({ where: { userId } });
}

/**
 * Builds the Prisma `where` clause enforcing per-role visibility:
 * admins/super admins see everyone, managers see their managed teams,
 * employees see only themselves.
 */
async function scopeForRequester(requester: AccessTokenPayload): Promise<Prisma.EmployeeWhereInput> {
  if (requester.role === "SUPER_ADMIN" || requester.role === "ADMIN") {
    return {};
  }

  const actingEmployee = await findActingEmployee(requester.sub);
  if (!actingEmployee) return { id: "__none__" };

  if (requester.role === "MANAGER") {
    return {
      OR: [{ id: actingEmployee.id }, { team: { managerId: actingEmployee.id } }],
    };
  }

  return { id: actingEmployee.id };
}

export async function listEmployees(requester: AccessTokenPayload) {
  const where = await scopeForRequester(requester);
  return prisma.employee.findMany({ where, include: employeeInclude, orderBy: { fullName: "asc" } });
}

export async function getEmployee(id: string, requester: AccessTokenPayload) {
  const where = await scopeForRequester(requester);
  const employee = await prisma.employee.findFirst({ where: { ...where, id }, include: employeeInclude });
  if (!employee) throw ApiError.notFound("Employee not found");
  return employee;
}

export async function createEmployee(input: CreateEmployeeInput) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) throw ApiError.conflict("A user with this email already exists");

  const role = await prisma.role.findUnique({ where: { name: input.roleName } });
  if (!role) throw ApiError.badRequest("Unknown role");

  const employeeCode = input.employeeCode ?? (await generateEmployeeCode());
  const existingCode = await prisma.employee.findUnique({ where: { employeeCode } });
  if (existingCode) throw ApiError.conflict("This employee code is already in use");

  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: input.email, passwordHash, roleId: role.id },
    });

    return tx.employee.create({
      data: {
        userId: user.id,
        employeeCode,
        fullName: input.fullName,
        designation: input.designation,
        phone: input.phone,
        departmentId: input.departmentId,
        teamId: input.teamId,
        managerId: input.managerId,
        joiningDate: input.joiningDate,
        workMode: input.workMode,
      },
      include: employeeInclude,
    });
  });
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) throw ApiError.notFound("Employee not found");

  const { roleName, isActive, ...employeeFields } = input;

  if (roleName || isActive !== undefined) {
    const role = roleName ? await prisma.role.findUnique({ where: { name: roleName } }) : null;
    if (roleName && !role) throw ApiError.badRequest("Unknown role");

    await prisma.user.update({
      where: { id: employee.userId },
      data: { ...(role ? { roleId: role.id } : {}), ...(isActive !== undefined ? { isActive } : {}) },
    });
  }

  return prisma.employee.update({ where: { id }, data: employeeFields, include: employeeInclude });
}

export async function deleteEmployee(id: string) {
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) throw ApiError.notFound("Employee not found");
  // Deleting the user cascades to the employee profile.
  await prisma.user.delete({ where: { id: employee.userId } });
}
